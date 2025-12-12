import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notifyOfferSent } from "@/lib/notifications"
import { z } from "zod"

const createOfferSchema = z.object({
  requestId: z.string(),
  parts: z.array(z.object({
    name: z.string(),
    price: z.number(),
    available: z.boolean(),
  })),
  totalPrice: z.number().optional(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const offers = await prisma.offer.findMany({
      where: { supplierId: session.user.id },
      include: {
        request: {
          include: {
            vehicle: true,
            garage: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(offers)
  } catch (error) {
    console.error("Get offers error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validated = createOfferSchema.parse(body)

    // Calculate total price if not provided
    const totalPrice = validated.totalPrice || 
      validated.parts.reduce((sum, part) => sum + (part.available ? part.price : 0), 0)

    const offer = await prisma.offer.create({
      data: {
        requestId: validated.requestId,
        supplierId: session.user.id,
        parts: JSON.stringify(validated.parts),
        totalPrice,
        notes: validated.notes,
      },
      include: {
        request: {
          include: {
            vehicle: true,
          },
        },
      },
    })

    // Notify garage
    await notifyOfferSent(offer.id)

    return NextResponse.json(offer, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create offer error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

