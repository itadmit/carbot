import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { findMatchingSuppliers } from "@/lib/matching"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all open requests
    const allRequests = await prisma.request.findMany({
      where: { status: "open" },
      include: {
        vehicle: true,
        garage: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        offers: {
          where: { supplierId: session.user.id },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Filter to only matching requests
    const matchingRequests = []
    for (const request of allRequests) {
      const matchingSupplierIds = await findMatchingSuppliers({
        manufacturer: request.vehicle.manufacturer,
      })

      if (matchingSupplierIds.includes(session.user.id)) {
        matchingRequests.push(request)
      }
    }

    return NextResponse.json(matchingRequests)
  } catch (error) {
    console.error("Get supplier requests error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

