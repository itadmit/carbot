import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowRight, Phone, Mail, Calendar, DollarSign } from "lucide-react"

export default async function RequestDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "GARAGE") {
    redirect("/login")
  }

  const request = await prisma.request.findUnique({
    where: { id: params.id },
    include: {
      vehicle: true,
      garage: true,
      offers: {
        include: {
          supplier: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!request || request.garageId !== session.user.id) {
    notFound()
  }

  const parts = JSON.parse(request.parts) as string[]

  return (
    <div>
      <Link
        href="/garage/requests"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowRight className="ml-2" size={18} />
        חזרה לבקשות
      </Link>

      <div className="card mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {request.vehicle.manufacturer} {request.vehicle.model}
            </h1>
            <p className="text-gray-600 text-lg">
              מספר רישוי: <span className="font-medium">{request.vehicle.licensePlate}</span>
            </p>
          </div>
          <span className={`badge ${
            request.status === "open" ? "badge-success" : "badge-warning"
          }`}>
            {request.status === "open" ? "פתוח" : "סגור"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">תאריך יצירה</p>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={18} />
              {new Date(request.createdAt).toLocaleDateString("he-IL", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">מספר בקשה</p>
            <p className="text-gray-600 font-mono">{request.id.substring(0, 8)}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">חלקים נדרשים</p>
          <div className="flex flex-wrap gap-2">
            {parts.map((part, idx) => (
              <span key={idx} className="badge badge-info text-base px-4 py-2">
                {part}
              </span>
            ))}
          </div>
        </div>

        {request.description && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">תיאור נוסף</p>
            <p className="text-gray-600">{request.description}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          הצעות מחיר ({request.offers.length})
        </h2>

        {request.offers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">אין הצעות עדיין</p>
            <p className="text-gray-400 text-sm mt-2">
              ההצעות יופיעו כאן ברגע שספקים ישלחו אותן
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {request.offers.map((offer) => {
              const offerParts = JSON.parse(offer.parts) as Array<{
                name: string
                price: number
                available: boolean
              }>

              return (
                <div
                  key={offer.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {offer.supplier.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {offer.supplier.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={16} />
                            {offer.supplier.phone}
                          </div>
                        )}
                        {offer.supplier.email && (
                          <div className="flex items-center gap-1">
                            <Mail size={16} />
                            {offer.supplier.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600 mb-1">מחיר כולל</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₪{offer.totalPrice?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">פירוט חלקים:</p>
                    <div className="space-y-2">
                      {offerParts.map((part, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{part.name}</span>
                            {!part.available && (
                              <span className="badge badge-warning text-xs">לא זמין</span>
                            )}
                          </div>
                          {part.available && (
                            <span className="text-gray-700 font-medium">
                              ₪{part.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {offer.notes && (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">הערות:</p>
                      <p className="text-gray-600 text-sm">{offer.notes}</p>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4 mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      נשלח ב-{new Date(offer.createdAt).toLocaleDateString("he-IL")}
                    </span>
                    <span className={`badge ${
                      offer.status === "pending" ? "badge-info" :
                      offer.status === "accepted" ? "badge-success" :
                      "badge-danger"
                    }`}>
                      {offer.status === "pending" ? "ממתין" :
                       offer.status === "accepted" ? "אושר" :
                       "נדחה"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

