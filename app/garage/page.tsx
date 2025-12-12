import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FileText, MessageSquare, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function GarageDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "GARAGE") {
    redirect("/login")
  }

  const stats = await prisma.request.groupBy({
    by: ["status"],
    where: { garageId: session.user.id },
    _count: true,
  })

  const totalRequests = stats.reduce((sum, stat) => sum + stat._count, 0)
  const openRequests = stats.find((s) => s.status === "open")?._count || 0

  const recentRequests = await prisma.request.findMany({
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
    take: 5,
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          שלום, {session.user.name} 👋
        </h1>
        <p className="text-gray-600">ברוך הבא לדשבורד המוסך שלך</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">סה״כ בקשות</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalRequests}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">בקשות פתוחות</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{openRequests}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">הצעות חדשות</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {recentRequests.reduce((sum, req) => sum + req.offers.length, 0)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">פעולות מהירות</h2>
          </div>
          <div className="space-y-3">
            <Link
              href="/garage/chat"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <MessageSquare className="text-blue-600 ml-3" size={24} />
              <div>
                <p className="font-medium text-gray-900">פתח בקשה חדשה</p>
                <p className="text-sm text-gray-600">דרך הצ&apos;אטבוט החכם</p>
              </div>
            </Link>
            <Link
              href="/garage/requests"
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <FileText className="text-green-600 ml-3" size={24} />
              <div>
                <p className="font-medium text-gray-900">צפה בכל הבקשות</p>
                <p className="text-sm text-gray-600">ניהול והצעות</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">בקשות אחרונות</h2>
            <Link href="/garage/requests" className="text-sm text-blue-600 hover:text-blue-700">
              צפה בהכל →
            </Link>
          </div>
          <div className="space-y-3">
            {recentRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">אין בקשות עדיין</p>
            ) : (
              recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                    <span className={`badge ${
                      request.status === "open" ? "badge-success" : "badge-warning"
                    }`}>
                      {request.status === "open" ? "פתוח" : "סגור"}
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

