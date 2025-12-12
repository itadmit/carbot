import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          🚗 CarBot
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          מערכת SaaS חכמה שמחברת בין מוסכים לספקי חלקי חילוף
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="btn-primary text-lg px-8 py-3"
          >
            התחברות
          </Link>
          <Link
            href="/register"
            className="btn-secondary text-lg px-8 py-3"
          >
            הרשמה
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">צ&apos;אטבוט חכם</h3>
            <p className="text-gray-600">
              פתיחת בקשות לחלקים בקלות באמצעות צ&apos;אטבוט מתקדם
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">חיפוש אוטומטי</h3>
            <p className="text-gray-600">
              שליפת נתוני רכב אוטומטית לפי מספר רישוי
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">📲</div>
            <h3 className="text-xl font-semibold mb-2">התראות WhatsApp</h3>
            <p className="text-gray-600">
              עדכונים מיידיים על בקשות והצעות חדשות
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

