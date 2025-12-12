import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getChatbotResponse, ChatbotState } from "@/lib/chatbot"
import { lookupVehicle } from "@/lib/vehicle"
import { prisma } from "@/lib/prisma"
import { notifyRequestCreated } from "@/lib/notifications"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "GARAGE") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { message, state } = await req.json()

    if (!state) {
      // Initialize new chat
      const initialState: ChatbotState = { step: "welcome" }
      const { message: response, newState } = getChatbotResponse(initialState, "")
      return NextResponse.json({ message: response, state: newState })
    }

    const chatbotState = state as ChatbotState
    let responseMessage = ""
    let newState = chatbotState

    // Handle vehicle lookup - when user enters license plate
    if (chatbotState.step === "license_plate" && message) {
      const licensePlate = message.trim().replace(/[\s-]/g, "")
      if (licensePlate.length >= 7 && licensePlate.length <= 8) {
        const vehicleData = await lookupVehicle(licensePlate)
        if (vehicleData) {
          newState.licensePlate = licensePlate
          newState.vehicleData = vehicleData
          responseMessage = `🔍 מצאתי רכב:\nיצרן: ${vehicleData.manufacturer}\nדגם: ${vehicleData.model}${vehicleData.year ? `\nשנה: ${vehicleData.year}` : ""}\n\nהאם זה נכון? (כן/לא)`
          newState.step = "confirm_vehicle"
        } else {
          responseMessage = "❌ לא נמצא רכב עם מספר רישוי זה. אנא נסה שוב או הזן מספר רישוי אחר:"
          // Stay in license_plate step
        }
      } else {
        // Invalid format - use chatbot logic
        const result = getChatbotResponse(chatbotState, message)
        responseMessage = result.message
        newState = result.newState
      }
    } else if (chatbotState.step === "confirm_request" && message.toLowerCase().includes("כן")) {
      // Create the actual request
      if (chatbotState.licensePlate && chatbotState.vehicleData && chatbotState.parts) {
        try {
          // Get or create vehicle
          let vehicle = await prisma.vehicle.findUnique({
            where: { licensePlate: chatbotState.licensePlate },
          })

          if (!vehicle) {
            vehicle = await prisma.vehicle.create({
              data: {
                licensePlate: chatbotState.licensePlate,
                manufacturer: chatbotState.vehicleData.manufacturer,
                model: chatbotState.vehicleData.model,
                year: chatbotState.vehicleData.year,
              },
            })
          }

          // Create request
          const request = await prisma.request.create({
            data: {
              garageId: session.user.id,
              vehicleId: vehicle.id,
              parts: JSON.stringify(chatbotState.parts),
            },
          })

          // Notify
          await notifyRequestCreated(request.id)

          responseMessage = `✅ הבקשה נשלחה בהצלחה!\nמספר בקשה: ${request.id.substring(0, 8)}\nרכב: ${chatbotState.vehicleData.manufacturer} ${chatbotState.vehicleData.model}\nחלקים: ${chatbotState.parts.join(", ")}\n\nתקבל עדכונים על הצעות דרך WhatsApp.`
          newState = { step: "welcome" }
        } catch (error) {
          console.error("Error creating request:", error)
          responseMessage = "❌ שגיאה ביצירת הבקשה. נסה שוב מאוחר יותר."
          newState = { step: "welcome" }
        }
      } else {
        responseMessage = "❌ חסרים פרטים. אנא התחל מחדש."
        newState = { step: "welcome" }
      }
    } else {
      // Use regular chatbot logic
      const result = getChatbotResponse(chatbotState, message)
      responseMessage = result.message
      newState = result.newState
    }

    return NextResponse.json({ message: responseMessage, state: newState })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

