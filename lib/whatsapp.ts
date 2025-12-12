// RappelSend WhatsApp API integration

const RAPPEL_API_URL = "https://api.rappelsend.com/v1"

interface SendWhatsAppParams {
  phone: string
  message: string
}

export async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  try {
    const clientId = process.env.RAPPEL_CLIENT_ID
    const apiKey = process.env.RAPPEL_API_KEY

    if (!clientId || !apiKey) {
      console.error("RappelSend credentials not configured")
      return false
    }

    // Format phone number (remove +, ensure starts with country code)
    const formattedPhone = phone.replace(/^\+/, "").replace(/\s/g, "")

    const response = await fetch(`${RAPPEL_API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-ID": clientId,
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        to: formattedPhone,
        message: message,
        type: "text",
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("RappelSend API error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    return false
  }
}

// Helper function to format phone numbers
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "")
  
  // If starts with 0, replace with 972 (Israel country code)
  if (cleaned.startsWith("0")) {
    cleaned = "972" + cleaned.substring(1)
  }
  
  // If doesn't start with country code, add 972
  if (!cleaned.startsWith("972")) {
    cleaned = "972" + cleaned
  }
  
  return cleaned
}

