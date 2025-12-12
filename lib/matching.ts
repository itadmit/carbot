import { prisma } from "./prisma"

interface MatchCriteria {
  manufacturer?: string
  region?: string
}

export async function findMatchingSuppliers(criteria: MatchCriteria): Promise<string[]> {
  // Get all suppliers with preferences
  const suppliers = await prisma.user.findMany({
    where: {
      role: "SUPPLIER",
    },
    include: {
      supplierPreferences: true,
    },
  })

  const matchingSupplierIds: string[] = []

  for (const supplier of suppliers) {
    const preferences = supplier.supplierPreferences

    // If no preferences, match all
    if (!preferences) {
      matchingSupplierIds.push(supplier.id)
      continue
    }

    let matches = true

    // Check manufacturer match
    if (criteria.manufacturer && preferences.manufacturers) {
      try {
        const manufacturers = JSON.parse(preferences.manufacturers) as string[]
        if (manufacturers.length > 0 && !manufacturers.includes(criteria.manufacturer)) {
          matches = false
        }
      } catch (e) {
        // Invalid JSON, skip filter
      }
    }

    // Check region match (if region filtering is implemented)
    if (criteria.region && preferences.regions) {
      try {
        const regions = JSON.parse(preferences.regions) as string[]
        if (regions.length > 0 && !regions.includes(criteria.region)) {
          matches = false
        }
      } catch (e) {
        // Invalid JSON, skip filter
      }
    }

    if (matches) {
      matchingSupplierIds.push(supplier.id)
    }
  }

  return matchingSupplierIds
}

