const WEBHOOK_URL = "https://vofmun.org/api/google-form"

function onFormSubmit(e) {
  const secret = PropertiesService.getScriptProperties().getProperty("GOOGLE_FORM_WEBHOOK_SECRET")
  if (!secret) {
    throw new Error("Missing GOOGLE_FORM_WEBHOOK_SECRET in script properties.")
  }

  const payload = {
    formId: e?.source?.getId(),
    responseId: e?.response?.getId(),
    submittedAt: e?.response?.getTimestamp()?.toISOString?.() ?? new Date().toISOString(),
    namedValues: e?.namedValues ?? {},
  }

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + secret,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  }

  const response = UrlFetchApp.fetch(WEBHOOK_URL, options)
  const status = response.getResponseCode()

  if (status < 200 || status >= 300) {
    console.error("VOFMUN webhook error:", response.getContentText())
  }
}
