import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Eye, Calendar } from "lucide-react"

export default async function GarageRequestsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "GARAGE") {
    redirect("/login")
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">בקשות שלי</h1>
          <p className="text-gray-600">ניהול כל הבקשות וההצעות</p>
        </div>
        <Link href="/garage/chat" className="btn-primary">
          בקשה חדשה
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg mb-4">אין בקשות עדיין</p>
          <Link href="/garage/chat" className="btn-primary inline-block">
            פתח בקשה ראשונה
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const parts = JSON.parse(request.parts) as string[]
            return (
              <div key={request.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {request.vehicle.manufacturer} {request.vehicle.model}
                      </h3>
                      <span className={`badge ${
                        request.status === "open" ? "badge-success" : "badge-warning"
                      }`}>
                        {request.status === "open" ? "פתוח" : "סגור"}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      מספר רישוי: <span className="font-medium">{request.vehicle.licensePlate}</span>
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar size={16} />
                      {new Date(request.createdAt).toLocaleDateString("he-IL")}
                    </div>
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">חלקים נדרשים:</p>
                      <div className="flex flex-wrap gap-2">
                        {parts.map((part, idx) => (
                          <span
                            key={idx}
                            className="badge badge-info"
                          >
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                    {request.description && (
                      <p className="text-gray-600 text-sm mb-3">{request.description}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        הצעות: <span className="text-blue-600">{request.offers.length}</span>
                      </p>
                      {request.offers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {request.offers.map((offer) => (
                            <div
                              key={offer.id}
                              className="text-sm bg-gray-50 px-3 py-1 rounded"
                            >
                              {offer.supplier.name}: ₪{offer.totalPrice}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/garage/requests/${request.id}`}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Eye size={18} />
                      צפה בפרטים
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

