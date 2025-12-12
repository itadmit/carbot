// Chatbot logic for garage requests

export interface ChatbotState {
  step: "welcome" | "license_plate" | "confirm_vehicle" | "parts" | "confirm_request"
  licensePlate?: string
  vehicleData?: {
    manufacturer: string
    model: string
    year?: number
  }
  parts?: string[]
}

export function getChatbotResponse(state: ChatbotState, userInput: string): {
  message: string
  newState: ChatbotState
} {
  let newState = { ...state }
  let message = ""

  switch (state.step) {
    case "welcome":
      message = "👋 שלום! אני כאן לעזור לך לפתוח בקשה לחלקי חילוף.\n\nאנא הזן מספר רישוי:"
      newState.step = "license_plate"
      break

    case "license_plate":
      const licensePlate = userInput.trim().replace(/[\s-]/g, "")
      if (licensePlate.length >= 7 && licensePlate.length <= 8) {
        newState.licensePlate = licensePlate
        // In real app, lookup vehicle here
        message = `🔍 מצאתי רכב:\nיצרן: Mazda\nדגם: 3\nשנה: 2018\n\nהאם זה נכון? (כן/לא)`
        newState.step = "confirm_vehicle"
        newState.vehicleData = {
          manufacturer: "Mazda",
          model: "3",
          year: 2018,
        }
      } else {
        message = "❌ מספר רישוי לא תקין. אנא הזן מספר רישוי בן 7-8 ספרות:"
      }
      break

    case "confirm_vehicle":
      const confirmed = userInput.toLowerCase().includes("כן") || userInput.toLowerCase().includes("yes")
      if (confirmed) {
        message = "✅ מעולה!\n\nאנא הזן את רשימת החלקים הנדרשים (מופרדים בפסיק):"
        newState.step = "parts"
      } else {
        message = "אנא הזן מספר רישוי חדש:"
        newState.step = "license_plate"
        newState.licensePlate = undefined
        newState.vehicleData = undefined
      }
      break

    case "parts":
      const parts = userInput.split(",").map(p => p.trim()).filter(p => p.length > 0)
      if (parts.length > 0) {
        newState.parts = parts
        message = `📋 סיכום הבקשה:\nרכב: ${newState.vehicleData?.manufacturer} ${newState.vehicleData?.model}\nחלקים: ${parts.join(", ")}\n\nלאשר ולשלוח? (כן/לא)`
        newState.step = "confirm_request"
      } else {
        message = "❌ אנא הזן לפחות חלק אחד:"
      }
      break

    case "confirm_request":
      const sendConfirmed = userInput.toLowerCase().includes("כן") || userInput.toLowerCase().includes("yes")
      if (sendConfirmed) {
        message = "✅ הבקשה נשלחה בהצלחה! תקבל עדכונים על הצעות דרך WhatsApp."
        newState = {
          step: "welcome",
        }
      } else {
        message = "הבקשה בוטלה. תוכל להתחיל מחדש."
        newState = {
          step: "welcome",
        }
      }
      break
  }

  return { message, newState }
}

