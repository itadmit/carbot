import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getChatbotResponse, ChatbotState } from "@/lib/chatbot"

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
    const { message: response, newState } = getChatbotResponse(chatbotState, message)

    return NextResponse.json({ message: response, state: newState })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

