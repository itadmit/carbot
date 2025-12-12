import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FileText, MessageSquare, DollarSign, TrendingUp, ArrowLeft } from "lucide-react"
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            שלום, {session.user.name} 👋
          </h1>
          <p className="text-slate-600">ברוך הבא למערכת ניהול הבקשות שלך</p>
        </div>
        
        <Link 
          href="/garage/chat" 
          className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <MessageSquare size={20} />
          בקשה חדשה
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">סה״כ בקשות</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{totalRequests}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">בקשות פתוחות</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{openRequests}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">הצעות חדשות</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {recentRequests.reduce((sum, req) => sum + req.offers.length, 0)}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <DollarSign className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">פעולות מהירות</h2>
          </div>
          <div className="space-y-4">
            <Link
              href="/garage/chat"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl transition-all duration-200 group"
            >
              <div className="p-3 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <MessageSquare className="text-blue-600" size={24} />
              </div>
              <div className="mr-4">
                <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">פתח בקשה חדשה</p>
                <p className="text-sm text-slate-600">השתמש בצ&apos;אטבוט החכם לאיתור חלקים</p>
              </div>
              <ArrowLeft className="mr-auto text-blue-400 group-hover:-translate-x-1 transition-transform" size={20} />
            </Link>
            
            <Link
              href="/garage/requests"
              className="flex items-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition-all duration-200 group"
            >
              <div className="p-3 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <FileText className="text-slate-600" size={24} />
              </div>
              <div className="mr-4">
                <p className="font-bold text-slate-900 group-hover:text-slate-700 transition-colors">ניהול בקשות</p>
                <p className="text-sm text-slate-600">צפה בסטטוס הבקשות והצעות המחיר</p>
              </div>
              <ArrowLeft className="mr-auto text-slate-400 group-hover:-translate-x-1 transition-transform" size={20} />
            </Link>
          </div>
        </div>

        <div className="card h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">בקשות אחרונות</h2>
            <Link href="/garage/requests" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
              צפה בהכל
            </Link>
          </div>
          <div className="space-y-4">
            {recentRequests.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500">אין בקשות עדיין</p>
                <Link href="/garage/chat" className="text-blue-600 font-medium text-sm mt-2 inline-block">
                  צור בקשה ראשונה
                </Link>
              </div>
            ) : (
              recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors hover:border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">
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
                    <span className={`badge ${
                      request.status === "open" ? "badge-success" : "badge-secondary"
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
