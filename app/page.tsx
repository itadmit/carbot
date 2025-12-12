import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { ArrowLeft, MessageSquare, Search, Zap, Shield, CheckCircle } from "lucide-react"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CarBot
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                כניסה
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg"
              >
                הרשמה חינם
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white opacity-70"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            חדש: מערכת ההתאמות החכמה זמינה כעת
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-8 animate-slide-up">
            הדרך החכמה לניהול <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              חלקי חילוף לרכב
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up [animation-delay:100ms]">
            מערכת SaaS מתקדמת המחברת בין מוסכים לספקים בזמן אמת.
            חיפוש אוטומטי, צ'אטבוט חכם וניהול הצעות מחיר במקום אחד.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up [animation-delay:200ms]">
            <Link
              href="/register"
              className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group"
            >
              התחל בחינם
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="btn-secondary text-lg px-8 py-4 bg-white"
            >
              יש לי כבר חשבון
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">למה לבחור ב-CarBot?</h2>
            <p className="text-lg text-slate-600">כל הכלים שאתם צריכים כדי לייעל את העבודה</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card card-hover group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">צ&apos;אטבוט חכם</h3>
              <p className="text-slate-600 leading-relaxed">
                פתיחת בקשות לחלקים בקלות ובמהירות באמצעות שיחה טבעית עם הבוט המתקדם שלנו.
              </p>
            </div>

            <div className="card card-hover group">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">זיהוי רכב אוטומטי</h3>
              <p className="text-slate-600 leading-relaxed">
                שליפת נתוני רכב מדויקים באופן אוטומטי לפי מספר רישוי, למניעת טעויות בהזמנות.
              </p>
            </div>

            <div className="card card-hover group">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">התראות בזמן אמת</h3>
              <p className="text-slate-600 leading-relaxed">
                עדכונים מיידיים ב-WhatsApp ובמערכת על כל בקשה חדשה או הצעת מחיר שהתקבלה.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Stats Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl mix-blend-screen"></div>
          <div className="absolute left-0 bottom-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl mix-blend-screen"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">100%</div>
              <div className="text-slate-300">אמינות ודיוק</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
              <div className="text-slate-300">זמינות המערכת</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">+500</div>
              <div className="text-slate-300">מוסכים וספקים</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-700">CarBot</span>
            <span className="text-slate-400">© 2024</span>
          </div>
          <div className="flex gap-8 text-slate-500 text-sm">
            <Link href="#" className="hover:text-blue-600 transition-colors">תנאי שימוש</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">מדיניות פרטיות</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">צור קשר</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
