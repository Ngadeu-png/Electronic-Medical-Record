/**
 * CamPay Payment Service
 * 
 * Provides communication with CamPay mobile money API for Cameroon:
 * - MTN Mobile Money & Orange Money
 * - Supports Permanent Access Token or dynamic token generation
 * - Collect payment (POST /api/collect/)
 * - Check transaction status (GET /api/transaction/{reference}/)
 */

const CAMPAY_BASE_URL = (
  process.env.CAMPAY_BASE_URL || "https://demo.campay.net/api"
).replace(/\/+$/, "");

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Format phone number to standard CamPay Cameroon format: 2376XXXXXXXX
 */
const formatCameroonPhone = (phone) => {
  if (!phone) return "";
  // Strip all non-digit characters
  let cleaned = String(phone).replace(/\D/g, "");

  // If starts with 00237, strip 00
  if (cleaned.startsWith("00237")) {
    cleaned = cleaned.substring(2);
  }

  // If already 12 digits and starts with 237
  if (cleaned.length === 12 && cleaned.startsWith("237")) {
    return cleaned;
  }

  // If 9 digits starting with 6 (standard Cameroon mobile: 6XXXXXXXX)
  if (cleaned.length === 9 && cleaned.startsWith("6")) {
    return `237${cleaned}`;
  }

  // If other 9 digits, prepend 237
  if (cleaned.length === 9) {
    return `237${cleaned}`;
  }

  return cleaned;
};

/**
 * Get active CamPay authorization token
 */
const getAuthToken = async () => {
  // 1. Check if permanent token is configured
  const permanentToken =
    process.env.Permanent_Access_token || process.env.CAMPAY_PERMANENT_TOKEN;
  if (permanentToken && permanentToken.trim()) {
    return permanentToken.trim();
  }

  // 2. Check cached dynamic token
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 60000) {
    return cachedToken;
  }

  // 3. Obtain new token via App credentials
  const username =
    process.env["App Username"] ||
    process.env.App_Username ||
    process.env.CAMPAY_APP_USERNAME ||
    process.env.CAMPAY_USERNAME;
  const password =
    process.env.App_Password ||
    process.env.CAMPAY_APP_PASSWORD ||
    process.env.CAMPAY_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "CamPay credentials not found. Please set Permanent_Access_token or App Username & App_Password."
    );
  }

  try {
    const response = await fetch(`${CAMPAY_BASE_URL}/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.trim(),
        password: password.trim(),
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.token) {
      throw new Error(
        data.message || data.error || data.detail || "Failed to authenticate with CamPay"
      );
    }

    cachedToken = data.token;
    // Default 1 hour expiry or expires_in if returned
    const expiresIn = data.expires_in || 3600;
    tokenExpiresAt = Date.now() + expiresIn * 1000;

    return cachedToken;
  } catch (err) {
    console.error("CamPay token acquisition error:", err.message);
    throw err;
  }
};

/**
 * Initiate mobile money collection via CamPay
 * 
 * @param {Object} params
 * @param {number|string} params.amount - Amount in XAF
 * @param {string} params.from - Cameroon phone number (e.g., 2376XXXXXXXX)
 * @param {string} params.description - Reason/note for payment
 * @param {string} [params.externalReference] - Unique internal ID for reconciliation
 */
const collectPayment = async ({ amount, from, description, externalReference }) => {
  const token = await getAuthToken();
  const formattedPhone = formatCameroonPhone(from);

  if (!formattedPhone || formattedPhone.length !== 12) {
    throw new Error(
      "Invalid Cameroon phone number. Must be a 9-digit mobile number (e.g. 670000000)."
    );
  }

  const payload = {
    amount: String(Math.round(amount)),
    currency: "XAF",
    from: formattedPhone,
    description: description || "CentriCare Medical Consultation",
  };

  if (externalReference) {
    payload.external_reference = String(externalReference);
  }

  try {
    const response = await fetch(`${CAMPAY_BASE_URL}/collect/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg =
        data.message ||
        data.detail ||
        data.error ||
        (Array.isArray(data.from) ? data.from.join(", ") : null) ||
        "Payment initiation failed with CamPay";
      return {
        success: false,
        message: errorMsg,
        data,
      };
    }

    return {
      success: true,
      reference: data.reference,
      status: data.status || "PENDING",
      operator: data.operator,
      data,
    };
  } catch (err) {
    console.error("CamPay collect error:", err);
    return {
      success: false,
      message: err.message || "Network error connecting to CamPay",
    };
  }
};

/**
 * Check transaction status using CamPay reference
 * 
 * @param {string} reference - CamPay transaction reference UUID
 */
const checkTransactionStatus = async (reference) => {
  if (!reference) {
    throw new Error("Transaction reference is required");
  }

  const token = await getAuthToken();

  try {
    const response = await fetch(`${CAMPAY_BASE_URL}/transaction/${reference}/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        status: "FAILED",
        message: data.message || data.detail || "Failed to retrieve transaction status",
        data,
      };
    }

    /**
     * CamPay statuses typically include:
     * - SUCCESSFUL
     * - FAILED
     * - PENDING
     */
    const rawStatus = (data.status || "").toUpperCase();
    let normalizedStatus = "pending";

    if (rawStatus === "SUCCESSFUL" || rawStatus === "SUCCESS" || rawStatus === "COMPLETED") {
      normalizedStatus = "paid";
    } else if (rawStatus === "FAILED" || rawStatus === "REJECTED" || rawStatus === "EXPIRED") {
      normalizedStatus = "failed";
    } else if (rawStatus === "PENDING" || rawStatus === "PROCESSING") {
      normalizedStatus = "processing";
    }

    return {
      success: true,
      rawStatus,
      status: normalizedStatus,
      reference: data.reference || reference,
      amount: data.amount,
      currency: data.currency || "XAF",
      operator: data.operator,
      operatorReference: data.operator_reference,
      code: data.code,
      data,
    };
  } catch (err) {
    console.error("CamPay checkTransactionStatus error:", err);
    return {
      success: false,
      status: "pending",
      message: err.message || "Network error checking transaction status",
    };
  }
};

module.exports = {
  CAMPAY_BASE_URL,
  formatCameroonPhone,
  getAuthToken,
  collectPayment,
  checkTransactionStatus,
};
