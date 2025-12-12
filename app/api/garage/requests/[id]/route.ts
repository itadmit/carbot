import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "GARAGE") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        vehicle: true,
        offers: {
          include: {
            supplier: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!request || request.garageId !== session.user.id) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(request)
  } catch (error) {
    console.error("Get request error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

