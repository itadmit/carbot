// Vehicle lookup - Mock data for now
// In production, this would integrate with gov.il API

interface VehicleData {
  licensePlate: string
  manufacturer: string
  model: string
  year?: number
}

const MOCK_VEHICLES: Record<string, VehicleData> = {
  "12345678": {
    licensePlate: "12345678",
    manufacturer: "Mazda",
    model: "3",
    year: 2018,
  },
  "87654321": {
    licensePlate: "87654321",
    manufacturer: "Toyota",
    model: "Corolla",
    year: 2020,
  },
  "11111111": {
    licensePlate: "11111111",
    manufacturer: "Mitsubishi",
    model: "Lancer",
    year: 2017,
  },
  "22222222": {
    licensePlate: "22222222",
    manufacturer: "Honda",
    model: "Civic",
    year: 2019,
  },
  "33333333": {
    licensePlate: "33333333",
    manufacturer: "Hyundai",
    model: "i30",
    year: 2021,
  },
}

export async function lookupVehicle(licensePlate: string): Promise<VehicleData | null> {
  // Normalize license plate (remove spaces, dashes)
  const normalized = licensePlate.replace(/[\s-]/g, "").toUpperCase()
  
  // Check mock data
  if (MOCK_VEHICLES[normalized]) {
    return MOCK_VEHICLES[normalized]
  }
  
  // In production, call gov.il API here
  // const response = await fetch(`https://api.gov.il/vehicles/${normalized}`)
  
  return null
}

export function validateLicensePlate(licensePlate: string): boolean {
  const normalized = licensePlate.replace(/[\s-]/g, "")
  // Israeli license plates: 7-8 digits
  return /^\d{7,8}$/.test(normalized)
}

