import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Eye, Calendar, CheckCircle, XCircle, Clock } from "lucide-react"

export default async function SupplierOffersPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SUPPLIER") {
    redirect("/login")
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
              phone: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const statusIcons = {
    pending: Clock,
    accepted: CheckCircle,
    rejected: XCircle,
  }

  const statusLabels = {
    pending: "ממתין",
    accepted: "אושר",
    rejected: "נדחה",
  }

  const statusBadges = {
    pending: "badge-info",
    accepted: "badge-success",
    rejected: "badge-danger",
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">הצעות שלי</h1>
        <p className="text-gray-600">כל ההצעות ששלחת למוסכים</p>
      </div>

      {offers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg mb-4">אין הצעות עדיין</p>
          <Link href="/supplier/requests" className="btn-primary inline-block">
            צפה בבקשות פתוחות
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => {
            const offerParts = JSON.parse(offer.parts) as Array<{
              name: string
              price: number
              available: boolean
            }>
            const StatusIcon = statusIcons[offer.status as keyof typeof statusIcons] || Clock

            return (
              <div key={offer.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {offer.request.vehicle.manufacturer} {offer.request.vehicle.model}
                      </h3>
                      <span className={`badge ${statusBadges[offer.status as keyof typeof statusBadges]}`}>
                        {statusLabels[offer.status as keyof typeof statusLabels]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span>מספר רישוי: <span className="font-medium">{offer.request.vehicle.licensePlate}</span></span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(offer.createdAt).toLocaleDateString("he-IL")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      מוסך: <span className="font-medium">{offer.request.garage.name}</span>
                      {offer.request.garage.phone && (
                        <span className="mr-3">• טלפון: {offer.request.garage.phone}</span>
                      )}
                    </p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">הערות:</p>
                    <p className="text-gray-600 text-sm">{offer.notes}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <StatusIcon size={16} />
                    סטטוס: {statusLabels[offer.status as keyof typeof statusLabels]}
                  </div>
                  <Link
                    href={`/supplier/requests/${offer.request.id}`}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Eye size={18} />
                    צפה בבקשה
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

