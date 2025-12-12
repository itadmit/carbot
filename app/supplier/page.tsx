import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FileText, DollarSign, TrendingUp, CheckCircle, ArrowLeft } from "lucide-react"
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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          שלום, {session.user.name} 👋
        </h1>
        <p className="text-slate-600">ברוך הבא למערכת ניהול ההזמנות שלך</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">בקשות רלוונטיות</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{matchingRequests.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">הצעות ששלחתי</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{myOffers.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">הצעות שאושרו</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{acceptedOffers}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <CheckCircle className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">שיעור הצלחה</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {myOffers.length > 0
                  ? Math.round((acceptedOffers / myOffers.length) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <TrendingUp className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">בקשות חדשות</h2>
            <Link href="/supplier/requests" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
              צפה בהכל
            </Link>
          </div>
          <div className="space-y-4">
            {matchingRequests.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500">אין בקשות רלוונטיות כרגע</p>
              </div>
            ) : (
              matchingRequests.slice(0, 5).map((request) => (
                <Link
                  key={request.id}
                  href={`/supplier/requests/${request.id}`}
                  className="block p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all hover:border-blue-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {request.vehicle.manufacturer} {request.vehicle.model}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {request.vehicle.licensePlate}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-sm text-slate-600">
                          {request.offers.length} הצעות
                        </span>
                      </div>
                    </div>
                    <span className="badge badge-info shadow-sm">חדש</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="card h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">הצעות אחרונות</h2>
            <Link href="/supplier/offers" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
              צפה בהכל
            </Link>
          </div>
          <div className="space-y-4">
            {myOffers.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500">אין הצעות עדיין</p>
              </div>
            ) : (
              myOffers.slice(0, 5).map((offer) => (
                <div
                  key={offer.id}
                  className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">
                        {offer.request.vehicle.manufacturer} {offer.request.vehicle.model}
                      </p>
                      <p className="text-sm font-medium text-slate-600 mt-1">
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
