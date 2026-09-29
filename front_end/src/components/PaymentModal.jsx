import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  initiatePayment,
  verifyPayment,
  resetPaymentState,
} from "../redux/slices/paymentSlice";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Phone,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowRight,
  Lock,
  X,
  Smartphone,
} from "lucide-react";

const PaymentModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const dispatch = useDispatch();
  const { currentPayment, reference, status, paymentStatus, error, message } =
    useSelector((state) => state.payments);

  const [paymentMethod, setPaymentMethod] = useState("MTN");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [pollCount, setPollCount] = useState(0);
  const [pollingActive, setPollingActive] = useState(false);
  const pollIntervalRef = useRef(null);

  const amount = appointment?.amount || 25;
  const currency = appointment?.currency || "XAF";

  // Pre-fill user phone from local storage or context if available
  useEffect(() => {
    if (isOpen) {
      dispatch(resetPaymentState());
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.phone) {
        // Strip 237 or +237 if already present for the 9-digit input
        const cleanPhone = storedUser.phone.replace(/^(\+237|237)/, "");
        setPhoneNumber(cleanPhone);
      }
      setPollCount(0);
      setPollingActive(false);
    }
  }, [isOpen, dispatch]);

  // Clean up polling interval on unmount or close
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Poll for transaction verification once a reference exists
  useEffect(() => {
    if (reference && status === "processing" && !pollingActive) {
      setPollingActive(true);
      setPollCount(0);

      pollIntervalRef.current = setInterval(async () => {
        setPollCount((prev) => {
          const next = prev + 1;
          // Stop after ~15 polls (approx 60 seconds)
          if (next > 15) {
            clearInterval(pollIntervalRef.current);
            setPollingActive(false);
          }
          return next;
        });

        const result = await dispatch(verifyPayment(reference));
        if (result.payload?.status === "paid" || result.payload?.status === "failed") {
          clearInterval(pollIntervalRef.current);
          setPollingActive(false);
        }
      }, 4000);
    }

    if (paymentStatus === "paid" || paymentStatus === "failed") {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setPollingActive(false);
    }
  }, [reference, status, paymentStatus, dispatch, pollingActive]);

  if (!isOpen || !appointment) return null;

  const validatePhone = (val) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      setPhoneError("Phone number is required");
      return false;
    }
    if (cleaned.length !== 9 || !cleaned.startsWith("6")) {
      setPhoneError("Must be a valid 9-digit Cameroon number starting with 6 (e.g. 670123456)");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 9);
    setPhoneNumber(val);
    if (phoneError) validatePhone(val);
  };

  const handleInitiate = async (e) => {
    e.preventDefault();
    if (!validatePhone(phoneNumber)) return;

    await dispatch(
      initiatePayment({
        appointmentId: appointment._id,
        phoneNumber: `237${phoneNumber}`,
        paymentMethod,
        amount,
      })
    );
  };

  const handleManualVerify = () => {
    const activeRef = reference || currentPayment?.reference;
    if (activeRef) {
      dispatch(verifyPayment(activeRef));
    }
  };

  const handleRetry = () => {
    dispatch(resetPaymentState());
    setPollingActive(false);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
  };

  const handleCompleteSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <CreditCard className="w-5 h-5 text-purple-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Consultation Payment</h2>
              <p className="text-xs text-purple-200">Secure CamPay Mobile Checkout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={status === "processing"}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Appointment Summary Card */}
          <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                  Appointment Request
                </span>
                <h3 className="font-bold text-gray-800 text-sm">{appointment.reason}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Type: <strong className="text-gray-700">{appointment.type}</strong>
                  {appointment.appointmentDate && (
                    <span> • {new Date(appointment.appointmentDate).toLocaleString()}</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Fee Due</span>
                <span className="text-xl font-extrabold text-purple-900">
                  {amount.toLocaleString()} {currency}
                </span>
              </div>
            </div>
          </div>

          {/* ──────── STATE 1: INITIAL / INPUT FORM ──────── */}
          {paymentStatus !== "paid" && paymentStatus !== "failed" && status !== "processing" && (
            <form onSubmit={handleInitiate} className="space-y-4">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Select Mobile Money Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* MTN Mobile Money */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("MTN")}
                    className={`p-3.5 rounded-2xl border-2 transition flex items-center gap-3 text-left ${
                      paymentMethod === "MTN"
                        ? "border-amber-400 bg-amber-50/60 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 font-black flex items-center justify-center text-xs shadow-inner flex-shrink-0">
                      MTN
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-800">MTN MoMo</div>
                      <div className="text-[11px] text-gray-500">Cameroon (*126#)</div>
                    </div>
                  </button>

                  {/* Orange Money */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("ORANGE")}
                    className={`p-3.5 rounded-2xl border-2 transition flex items-center gap-3 text-left ${
                      paymentMethod === "ORANGE"
                        ? "border-orange-500 bg-orange-50/60 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-black flex items-center justify-center text-xs shadow-inner flex-shrink-0">
                      OM
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-800">Orange Money</div>
                      <div className="text-[11px] text-gray-500">Cameroon (#150#)</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Mobile Money Phone Number
                </label>
                <div className="relative flex rounded-xl border border-gray-300 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 transition overflow-hidden">
                  <span className="inline-flex items-center px-3.5 bg-gray-100 text-gray-600 font-semibold text-xs border-r border-gray-300">
                    🇨🇲 +237
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="6XXXXXXXX"
                    maxLength={9}
                    className="w-full px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none"
                    required
                  />
                </div>
                {phoneError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {phoneError}
                  </p>
                )}
                <p className="text-[11px] text-gray-500 mt-1">
                  Enter your 9-digit MTN or Orange number. You will receive an instant payment authorization prompt on your phone.
                </p>
              </div>

              {/* Error from backend initiation */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Security & Action button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Contacting CamPay...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Authorize &amp; Pay {amount.toLocaleString()} {currency}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ──────── STATE 2: PROCESSING / AWAITING USER PIN ──────── */}
          {status === "processing" && paymentStatus !== "paid" && paymentStatus !== "failed" && (
            <div className="py-6 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-purple-600 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-800">
                  Authorizing Payment on Your Phone...
                </h3>
                <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  A USSD notification has been sent to{" "}
                  <strong className="text-purple-900">+237 {phoneNumber}</strong>.
                  Please check your phone screen and enter your Mobile Money PIN to approve the consultation fee.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 text-left space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-amber-950">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Waiting for CamPay confirmation...
                </div>
                <p className="text-[11px] text-amber-800 pl-5">
                  If the prompt did not pop up automatically, dial <strong>*126#</strong> (MTN) or <strong>#150#</strong> (Orange) to view pending approval requests.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleManualVerify}
                  className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  I've Entered My PIN — Check Status
                </button>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold rounded-xl transition"
                >
                  Change Number
                </button>
              </div>

              {reference && (
                <p className="text-[10px] text-gray-400">
                  Reference: <code className="bg-gray-100 px-1 py-0.5 rounded">{reference}</code>
                </p>
              )}
            </div>
          )}

          {/* ──────── STATE 3: PAYMENT SUCCESSFUL ──────── */}
          {paymentStatus === "paid" && (
            <div className="py-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-emerald-900">Payment Confirmed!</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Your consultation fee of <strong>{amount.toLocaleString()} {currency}</strong> has been successfully received via CamPay.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-emerald-700">Status:</span>
                  <span className="font-bold uppercase text-emerald-800">Paid &amp; Confirmed</span>
                </div>
                {reference && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-emerald-700">Transaction Ref:</span>
                    <span className="font-mono text-emerald-900">{reference.slice(0, 18)}...</span>
                  </div>
                )}
                <div className="border-t border-emerald-200/60 pt-1.5 text-[11px] text-emerald-800">
                  ✓ Your appointment is now in the administrative queue for hospital doctor allocation.
                </div>
              </div>

              <button
                type="button"
                onClick={handleCompleteSuccess}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                Continue to My Appointments <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ──────── STATE 4: PAYMENT FAILED ──────── */}
          {paymentStatus === "failed" && (
            <div className="py-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-red-900">Payment Not Completed</h3>
                <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                  {error || "The mobile money payment was cancelled, timed out, or had insufficient funds."}
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 text-xs text-red-800 text-left">
                <p className="font-semibold mb-1">What would you like to do?</p>
                <p className="text-[11px] text-red-700">
                  Your appointment request is saved as <strong>Pending Payment</strong>. You can retry with the same or another phone number without losing your booking.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Payment
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-100 font-semibold text-xs rounded-xl transition"
                >
                  Pay Later
                </button>
              </div>
            </div>
          )}

          {/* Secure Guarantee Footer */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1 border-t border-gray-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-End Encrypted CamPay Mobile Money Integration</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
