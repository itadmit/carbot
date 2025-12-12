import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updatePreferencesSchema = z.object({
  manufacturers: z.array(z.string()).optional(),
  models: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
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

    const preferences = await prisma.supplierPreference.findUnique({
      where: { supplierId: session.user.id },
    })

    if (!preferences) {
      return NextResponse.json({
        manufacturers: [],
        models: [],
        regions: [],
      })
    }

    return NextResponse.json({
      manufacturers: preferences.manufacturers ? JSON.parse(preferences.manufacturers) : [],
      models: preferences.models ? JSON.parse(preferences.models) : [],
      regions: preferences.regions ? JSON.parse(preferences.regions) : [],
    })
  } catch (error) {
    console.error("Get preferences error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validated = updatePreferencesSchema.parse(body)

    const preferences = await prisma.supplierPreference.upsert({
      where: { supplierId: session.user.id },
      update: {
        manufacturers: validated.manufacturers ? JSON.stringify(validated.manufacturers) : undefined,
        models: validated.models ? JSON.stringify(validated.models) : undefined,
        regions: validated.regions ? JSON.stringify(validated.regions) : undefined,
      },
      create: {
        supplierId: session.user.id,
        manufacturers: validated.manufacturers ? JSON.stringify(validated.manufacturers) : null,
        models: validated.models ? JSON.stringify(validated.models) : null,
        regions: validated.regions ? JSON.stringify(validated.regions) : null,
      },
    })

    return NextResponse.json(preferences)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Update preferences error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

