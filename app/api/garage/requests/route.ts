import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notifyRequestCreated } from "@/lib/notifications"
import { z } from "zod"

const createRequestSchema = z.object({
  vehicleId: z.string(),
  parts: z.array(z.string()),
  description: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "GARAGE") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const requests = await prisma.request.findMany({
      where: { garageId: session.user.id },
      include: {
        vehicle: true,
        offers: {
          include: {
            supplier: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Get requests error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "GARAGE") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validated = createRequestSchema.parse(body)

    const request = await prisma.request.create({
      data: {
        garageId: session.user.id,
        vehicleId: validated.vehicleId,
        parts: JSON.stringify(validated.parts),
        description: validated.description,
      },
      include: {
        vehicle: true,
      },
    })

    // Notify garage and suppliers
    await notifyRequestCreated(request.id)

    return NextResponse.json(request, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create request error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

