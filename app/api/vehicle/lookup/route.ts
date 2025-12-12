import { NextRequest, NextResponse } from "next/server"
import { lookupVehicle, validateLicensePlate } from "@/lib/vehicle"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const licensePlate = searchParams.get("plate")

    if (!licensePlate) {
      return NextResponse.json(
        { error: "License plate is required" },
        { status: 400 }
      )
    }

    if (!validateLicensePlate(licensePlate)) {
      return NextResponse.json(
        { error: "Invalid license plate format" },
        { status: 400 }
      )
    }

    const vehicleData = await lookupVehicle(licensePlate)

    if (!vehicleData) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(vehicleData)
  } catch (error) {
    console.error("Vehicle lookup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

