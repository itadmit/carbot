import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Eye, Calendar, MapPin } from "lucide-react"
import { findMatchingSuppliers } from "@/lib/matching"

export default async function SupplierRequestsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SUPPLIER") {
    redirect("/login")
  }

  // Get all open requests
  const allRequests = await prisma.request.findMany({
    where: { status: "open" },
    include: {
      vehicle: true,
      garage: {
        select: {
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

  // Filter to matching requests
  const matchingRequests = []
  for (const request of allRequests) {
    const matchingSupplierIds = await findMatchingSuppliers({
      manufacturer: request.vehicle.manufacturer,
    })
    if (matchingSupplierIds.includes(session.user.id)) {
      matchingRequests.push(request)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">בקשות פתוחות</h1>
        <p className="text-gray-600">בקשות רלוונטיות לפי ההעדפות שלך</p>
      </div>

      {matchingRequests.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg mb-4">אין בקשות רלוונטיות כרגע</p>
          <p className="text-gray-400 text-sm">
            בקשות חדשות יופיעו כאן ברגע שיתאימו להעדפות שלך
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matchingRequests.map((request) => {
            const parts = JSON.parse(request.parts) as string[]
            const hasOffer = request.offers.length > 0

            return (
              <div key={request.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {request.vehicle.manufacturer} {request.vehicle.model}
                      </h3>
                      {hasOffer && (
                        <span className="badge badge-success">שלחת הצעה</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span>מספר רישוי: <span className="font-medium">{request.vehicle.licensePlate}</span></span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(request.createdAt).toLocaleDateString("he-IL")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      מוסך: <span className="font-medium">{request.garage.name}</span>
                      {request.garage.phone && (
                        <span className="mr-3">• טלפון: {request.garage.phone}</span>
                      )}
                    </p>
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">חלקים נדרשים:</p>
                      <div className="flex flex-wrap gap-2">
                        {parts.map((part, idx) => (
                          <span key={idx} className="badge badge-info">
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                    {request.description && (
                      <p className="text-gray-600 text-sm">{request.description}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {request.offers.length > 0 ? (
                      <span>שלחת הצעה ב-{new Date(request.offers[0].createdAt).toLocaleDateString("he-IL")}</span>
                    ) : (
                      <span>אין הצעה שלך עדיין</span>
                    )}
                  </div>
                  <Link
                    href={`/supplier/requests/${request.id}`}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Eye size={18} />
                    {hasOffer ? "צפה בהצעה" : "שלח הצעה"}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

