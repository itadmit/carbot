import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FileText, DollarSign, TrendingUp, CheckCircle } from "lucide-react"
import Link from "next/link"
import { findMatchingSuppliers } from "@/lib/matching"

export default async function SupplierDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SUPPLIER") {
    redirect("/login")
  }

  // Get all open requests
  const allRequests = await prisma.request.findMany({
    where: { status: "open" },
    include: {
      vehicle: true,
      offers: {
        where: { supplierId: session.user.id },
      },
    },
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

  const myOffers = await prisma.offer.findMany({
    where: { supplierId: session.user.id },
    include: {
      request: {
        include: {
          vehicle: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const acceptedOffers = myOffers.filter((o) => o.status === "accepted").length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          שלום, {session.user.name} 👋
        </h1>
        <p className="text-gray-600">ברוך הבא לדשבורד הספק שלך</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">בקשות רלוונטיות</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{matchingRequests.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">הצעות ששלחתי</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{myOffers.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">הצעות שאושרו</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{acceptedOffers}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <CheckCircle className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">שיעור הצלחה</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {myOffers.length > 0
                  ? Math.round((acceptedOffers / myOffers.length) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">בקשות חדשות</h2>
            <Link href="/supplier/requests" className="text-sm text-green-600 hover:text-green-700">
              צפה בהכל →
            </Link>
          </div>
          <div className="space-y-3">
            {matchingRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">אין בקשות רלוונטיות כרגע</p>
            ) : (
              matchingRequests.slice(0, 5).map((request) => (
                <Link
                  key={request.id}
                  href={`/supplier/requests/${request.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.vehicle.manufacturer} {request.vehicle.model}
                      </p>
                      <p className="text-sm text-gray-600">
                        {request.vehicle.licensePlate} • {request.offers.length} הצעות
                      </p>
                    </div>
                    <span className="badge badge-info">חדש</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">הצעות אחרונות</h2>
            <Link href="/supplier/offers" className="text-sm text-green-600 hover:text-green-700">
              צפה בהכל →
            </Link>
          </div>
          <div className="space-y-3">
            {myOffers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">אין הצעות עדיין</p>
            ) : (
              myOffers.slice(0, 5).map((offer) => (
                <div
                  key={offer.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {offer.request.vehicle.manufacturer} {offer.request.vehicle.model}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₪{offer.totalPrice?.toLocaleString()}
                      </p>
                    </div>
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

