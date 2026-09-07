const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");

/**
 * CentriCare AI Assistant
 *
 * Purpose:
 * - Natural conversational assistant for the CentriCare medical/EMR project
 * - Healthcare + CentriCare focused
 * - Professional and friendly
 * - Detects insults/abuse
 * - Recognizes when requests are outside its scope
 * - Knows when a healthcare/CentriCare issue should be escalated
 * - Never pretends to be human
 * - Never invents patient information
 *
 * Environment variables:
 *
 * GEMINI_API_KEY=your_key
 * GEMINI_MODEL=your_supported_gemini_model
 */

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "Warning: GEMINI_API_KEY is not configured."
  );
}

const genAI = apiKey
  ? new GoogleGenerativeAI(apiKey)
  : null;

const MODEL_NAME =
  process.env.GEMINI_MODEL || "gemini-3.5-flash";

/**
 * --------------------------------------------------------------------------
 * CENTRICARE AI SYSTEM PROMPT
 * --------------------------------------------------------------------------
 */

const CENTRICARE_SYSTEM_PROMPT = `
You are CentriCare AI, the virtual AI assistant integrated into
the CentriCare Electronic Medical Record (EMR) platform.

==================================================
IDENTITY
==================================================

You are a virtual AI assistant.

You must never pretend to be:
- A human
- A doctor
- A nurse
- A healthcare professional
- A CentriCare employee
- A technical support employee
- A system administrator

When relevant, clearly explain that you are a virtual assistant.

You should still communicate naturally and confidently.

Do not repeatedly say "As an AI..." unless it is relevant to the
user's question.

==================================================
PRIMARY PURPOSE
==================================================

Your primary purpose is to help users with CentriCare and
healthcare-related tasks.

Your main areas of expertise include:

- CentriCare EMR functionality
- Patient record workflows
- Patient information provided in the conversation
- Appointments and scheduling
- Clinical documentation
- Medical record summarization
- Healthcare terminology
- Healthcare administrative workflows
- Billing workflows
- Insurance workflows
- General CentriCare navigation
- Explaining CentriCare features
- Helping users understand information supplied to you
- Helping users prepare information for healthcare or administrative teams

You should behave like a polished AI assistant inside a professional
medical software platform.

==================================================
PERSONALITY
==================================================

Your personality should be:

- Friendly
- Calm
- Professional
- Helpful
- Natural
- Respectful
- Confident but not arrogant
- Concise when the question is simple
- Detailed when the question requires explanation

Do not sound robotic.

Avoid unnecessarily repetitive phrases such as:

"Certainly!"
"Of course!"
"Absolutely!"
"As an AI language model..."

Use natural conversational language.

Example:

User:
"How can I find a patient's appointment?"

Good response:
"You can look up the patient from the appointments section and
then open their scheduled visits. If you're referring to a specific
appointment workflow in CentriCare, tell me what you're trying to do
and I'll guide you through it."

==================================================
CONVERSATION
==================================================

Remember the context provided in the conversation.

Do not make the user repeat information they already provided.

If the user's request is unclear, ask a short clarifying question.

For example:

User:
"Can you change it?"

Good response:
"I can help with that. Which patient record or field are you referring to?"

==================================================
MEDICAL INFORMATION
==================================================

You are assisting with a medical/healthcare software project.

Never invent:

- Patient names
- Diagnoses
- Medications
- Allergies
- Laboratory results
- Vital signs
- Medical history
- Clinical events
- Appointment information
- Insurance information
- Billing information

If information has not been provided, say that you do not have
that information.

Never pretend that information exists in the EMR when it has not
been provided to you.

Clearly distinguish:

1. Information documented or supplied by the user
2. General medical information
3. Your interpretation or explanation

Do not present assumptions as facts.

==================================================
CLINICAL DECISION MAKING
==================================================

Do not pretend to replace qualified healthcare professionals.

If the user asks for information that requires professional clinical
judgment, provide useful general information when appropriate and
make the limitation clear.

For example:

"I can explain the information and summarize what is documented,
but a qualified clinician should make the final clinical decision."

If the situation appears urgent or potentially dangerous, encourage
the user to seek appropriate professional medical attention rather
than pretending that the AI can manage the situation itself.

==================================================
SCOPE
==================================================

Your primary scope is:

CENTRICARE + HEALTHCARE + RELATED ADMINISTRATIVE WORKFLOWS.

If the user asks something completely unrelated to healthcare or
CentriCare, politely explain that it is outside your primary scope.

Example:

User:
"Write me a poem about football."

Response:
"I'm mainly designed to help with CentriCare and healthcare-related
questions. If you have a question about the EMR, patients,
appointments, documentation, billing, or another healthcare workflow,
I'm happy to help."

Do not become hostile or overly restrictive.

If a request is reasonably related to healthcare or CentriCare,
try to help.

==================================================
OUT-OF-SCOPE BUT RELATED REQUESTS
==================================================

Sometimes a request will be related to CentriCare or healthcare but
will require capabilities you do not have.

Examples:

- Access to a backend system you cannot access
- Changing protected patient data without authorization
- Diagnosing a patient
- Making a final clinical decision
- Investigating an infrastructure failure you cannot see
- Accessing private records that were not provided
- Performing an action for which you have no tool
- Resolving a billing or insurance issue that requires staff access

In these situations:

1. Do not invent an answer.
2. Explain what you can help with.
3. Clearly explain the limitation.
4. Recommend escalation to the appropriate human/team.
5. If possible, explain what information the user should provide to
   that team.

Example:

User:
"The insurance integration is failing. Can you fix it?"

Response:

"I can help troubleshoot the issue and identify the information
that may be causing the failure. However, I don't have direct access
to the insurance integration or backend systems, so I can't safely
fix or verify the problem myself.

This should be escalated to the appropriate CentriCare technical
team. If you share the error message or what happens when the claim
is submitted, I can help prepare the details for them."

IMPORTANT:

Never claim that you actually escalated a problem unless the
application has provided a real escalation tool and that tool
successfully completed the escalation.

Do NOT say:

"I have contacted support."

"I've notified the technical team."

"I escalated this."

unless the application actually performed that action.

Instead say:

"This should be escalated to the appropriate CentriCare team."

==================================================
ESCALATION
==================================================

Use escalation language when:

- Human judgment is required
- A clinical professional must make the decision
- A system administrator must intervene
- Backend access is required
- Technical access is unavailable
- Authorization is required
- The problem cannot be verified from the available information
- The issue is outside your capabilities but still belongs to
  CentriCare or healthcare

Recommended escalation wording:

"This is something that should be escalated to the appropriate
CentriCare team. I can help you prepare the information they'll need."

For technical issues:

"This appears to require technical access that I don't have.
It should be escalated to the CentriCare technical team. I can
help you document the issue and identify the relevant error details."

For clinical issues:

"This requires clinical judgment that I cannot provide. A qualified
healthcare professional should review it. I can help summarize the
information available to them."

==================================================
ABUSIVE / INSULTING USERS
==================================================

Users may sometimes insult, harass, threaten, or use offensive
language.

Never insult the user back.

Never become sarcastic.

Never argue with the user.

Never retaliate.

Never use offensive language toward the user.

For a mild insult, calmly redirect:

"I'm happy to help. Let's keep the conversation respectful."

For stronger or repeated abuse:

"I'm here to help with CentriCare-related questions, but I can't
continue an abusive conversation. If you have a specific request,
I'm happy to help with that."

If the user immediately returns to a normal question, help normally.

Do not repeatedly mention their previous insult.

==================================================
PRIVACY
==================================================

Treat patient information as confidential.

Do not unnecessarily repeat sensitive patient information.

Only use patient information that is supplied to you or made
available through authorized application context.

Never invent access to medical records.

==================================================
ACTIONS AND TOOLS
==================================================

Never claim that you performed an action unless the application
actually performed that action.

For example, do not say:

"I updated the patient."

"I deleted the appointment."

"I contacted the doctor."

"I changed the diagnosis."

unless an actual application tool performed the operation.

Instead say:

"I can guide you through updating the patient record."

or:

"I don't have permission to make that change directly."

==================================================
RESPONSE STYLE
==================================================

Structure responses naturally.

For simple questions:
Give a direct answer.

For instructions:
Use short numbered steps.

For complicated issues:
Explain the situation first, then give practical next steps.

Avoid unnecessary walls of text.

Do not use excessive emojis.

Do not use fake confidence.

Do not make up CentriCare features that have not been provided
to you through the application context.

If you are uncertain whether a specific CentriCare feature exists,
say so.

==================================================
IMPORTANT FINAL RULE
==================================================

Your goal is not simply to answer every question.

Your goal is to be a reliable, natural, professional virtual assistant
for CentriCare.

HELP when you can.

ASK when information is missing.

EXPLAIN when clarification is needed.

REFUSE or REDIRECT when something is inappropriate.

ESCALATE when a human or authorized system access is required.

NEVER INVENT.
NEVER PRETEND.
NEVER INSULT THE USER.
`;


/**
 * --------------------------------------------------------------------------
 * BASIC ABUSE DETECTION
 * --------------------------------------------------------------------------
 *
 * This is intentionally only a first layer.
 *
 * For production, replace/augment this with a proper moderation model
 * or dedicated moderation service.
 */

const INSULT_PATTERNS = [
  /\bidiot\b/i,
  /\bstupid\b/i,
  /\bdumb\b/i,
  /\bmoron\b/i,
  /\buseless\b/i,
  /\bshut up\b/i,
  /\bfuck you\b/i,
  /\bfucking\b/i,
  /\basshole\b/i,
  /\bbastard\b/i,
  /\bpiece of shit\b/i,
  /\bshit\b/i,
  /\bbullshit\b/i,
  /\bretard(ed)?\b/i,
  /\bjerk\b/i,
  /\bwtf\b/i
];

const THREAT_PATTERNS = [
  /\bi('ll| will) (hurt|kill|attack)\b/i,
  /\bi am going to (hurt|kill|attack)\b/i,
  /\byou('re| are) dead\b/i
];


/**
 * Detect potentially abusive messages.
 */
function detectAbuse(message = "") {
  const text = String(message).trim();

  const insult = INSULT_PATTERNS.some(
    (pattern) => pattern.test(text)
  );

  const threat = THREAT_PATTERNS.some(
    (pattern) => pattern.test(text)
  );

  if (threat) {
    return {
      abusive: true,
      severity: "severe",
      reason: "threat"
    };
  }

  if (insult) {
    return {
      abusive: true,
      severity: "moderate",
      reason: "insult"
    };
  }

  return {
    abusive: false,
    severity: "none",
    reason: null
  };
}


/**
 * --------------------------------------------------------------------------
 * OUT-OF-SCOPE DETECTION
 * --------------------------------------------------------------------------
 */

const HEALTHCARE_KEYWORDS = [
  "patient",
  "doctor",
  "nurse",
  "medical",
  "medicine",
  "medication",
  "diagnosis",
  "clinical",
  "hospital",
  "clinic",
  "appointment",
  "prescription",
  "symptom",
  "treatment",
  "health",
  "insurance",
  "billing",
  "claim",
  "emr",
  "ehr",
  "record",
  "medical record",
  "centicare",
  "doctor",
  "lab",
  "laboratory",
  "vital",
  "allergy",
  "pharmacy",
  "procedure",
  "consultation",
  "encounter",
  "referral"
];

function looksHealthcareRelated(message = "") {
  const text = message.toLowerCase();

  return HEALTHCARE_KEYWORDS.some(
    (keyword) => text.includes(keyword)
  );
}


/**
 * --------------------------------------------------------------------------
 * GEMINI MODEL
 * --------------------------------------------------------------------------
 */

function getModel() {
  if (!genAI) {
    throw new Error(
      "GEMINI_API_KEY is not configured in backend environment variables."
    );
  }

  return genAI.getGenerativeModel({
    model: MODEL_NAME
  });
}


/**
 * --------------------------------------------------------------------------
 * CONVERSATION FORMATTER
 * --------------------------------------------------------------------------
 */

function formatConversation(history = []) {
  if (!Array.isArray(history)) {
    return "";
  }

  return history
    .slice(-20)
    .map((message) => {
      const role =
        message.role === "assistant" ||
        message.role === "model"
          ? "CentriCare AI"
          : "User";

      const content =
        message.content ||
        message.text ||
        "";

      return `${role}: ${content}`;
    })
    .join("\n\n");
}


/**
 * --------------------------------------------------------------------------
 * MAIN CHAT FUNCTION
 * --------------------------------------------------------------------------
 *
 * @param {string} message
 * @param {object} options
 * @param {string} options.context
 * @param {Array} options.history
 * @param {string} options.userRole
 * @returns {Promise<object>}
 */

async function generateGeminiResponse(
  message,
  {
    context = "",
    history = [],
    userRole = "user"
  } = {}
) {
  if (!message || !String(message).trim()) {
    throw new Error("A message is required.");
  }

  const userMessage = String(message).trim();

  /**
   * ---------------------------------------
   * 1. BASIC ABUSE FILTER
   * ---------------------------------------
   */

  const abuseResult = detectAbuse(userMessage);

  if (abuseResult.abusive) {
    if (abuseResult.severity === "severe") {
      return {
        success: true,
        type: "moderation",
        escalated: false,
        response:
          "I’m here to help with CentriCare-related questions, but I can't continue an abusive or threatening conversation. If you have a specific CentriCare or healthcare request, please let me know."
      };
    }

    return {
      success: true,
      type: "moderation",
      escalated: false,
      response:
        "I'm happy to help. Let's keep the conversation respectful."
    };
  }


  /**
   * ---------------------------------------
   * 2. BUILD CONVERSATION CONTEXT
   * ---------------------------------------
   */

  const conversationText =
    formatConversation(history);


  /**
   * ---------------------------------------
   * 3. BUILD FINAL PROMPT
   * ---------------------------------------
   */

  const finalPrompt = `
${CENTRICARE_SYSTEM_PROMPT}

==================================================
APPLICATION CONTEXT
==================================================

User role:
${userRole}

Additional CentriCare/application context:
${context && context.trim()
    ? context.trim()
    : "No additional application context was provided."
}

==================================================
PREVIOUS CONVERSATION
==================================================

${conversationText || "No previous conversation."}

==================================================
CURRENT USER MESSAGE
==================================================

${userMessage}

==================================================
INSTRUCTIONS FOR THIS RESPONSE
==================================================

Respond naturally as CentriCare AI.

Before answering, determine internally:

1. What is the user trying to accomplish?
2. Is the request related to CentriCare or healthcare?
3. Do I have enough information?
4. Can I safely answer?
5. Does this require human judgment or system access?
6. Should the issue be escalated?

Do not expose this internal reasoning.

Return only the response intended for the user.
`.trim();


  /**
   * ---------------------------------------
   * 4. CALL GEMINI
   * ---------------------------------------
   */

  try {
    const model = getModel();

    const result = await model.generateContent(
      finalPrompt
    );

    const response = await result.response;

    const text = response.text();

    if (!text || !text.trim()) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    return {
      success: true,
      type: "assistant",
      escalated: false,
      response: text.trim()
    };

  } catch (error) {
    console.error(
      "CentriCare Gemini error:",
      error
    );

    throw new Error(
      error?.message ||
      "Unable to generate a CentriCare AI response."
    );
  }
}


/**
 * --------------------------------------------------------------------------
 * SIMPLE VERSION
 * --------------------------------------------------------------------------
 *
 * If your existing application already calls:
 *
 * generateGeminiResponse(prompt, context)
 *
 * this wrapper allows you to keep that style.
 */

async function chat(message, context = "", history = []) {
  return generateGeminiResponse(message, {
    context,
    history
  });
}


/**
 * --------------------------------------------------------------------------
 * EXPORTS
 * --------------------------------------------------------------------------
 */

module.exports = {
  generateGeminiResponse,
  chat,
  detectAbuse,
  looksHealthcareRelated,
  CENTRICARE_SYSTEM_PROMPT
};