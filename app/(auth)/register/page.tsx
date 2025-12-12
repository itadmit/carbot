"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, User, Mail, Phone, Lock, Wrench, Truck, ArrowLeft, Check } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    role: "GARAGE" as "GARAGE" | "SUPPLIER",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("הסיסמאות אינן תואמות")
      return
    }

    if (formData.password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone || undefined,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "שגיאה בהרשמה")
        setLoading(false)
        return
      }

      router.push("/login?registered=true")
    } catch (err) {
      setError("שגיאה בהרשמה. נסה שוב.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 py-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              CarBot
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">יצירת חשבון חדש</h2>
          <p className="text-slate-600 mt-2">הצטרף לקהילת הרכב המובילה בישראל</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-4 text-center">
                בחר את סוג החשבון שלך
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 ${
                  formData.role === "GARAGE"
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}>
                  <input
                    type="radio"
                    value="GARAGE"
                    checked={formData.role === "GARAGE"}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as "GARAGE" })}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`p-3 rounded-full ${formData.role === "GARAGE" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                      <Wrench size={24} />
                    </div>
                    <div>
                      <span className={`block font-bold ${formData.role === "GARAGE" ? "text-blue-900" : "text-slate-900"}`}>מוסך</span>
                      <span className="text-xs text-slate-500">אני מעוניין לקנות חלקים</span>
                    </div>
                  </div>
                  {formData.role === "GARAGE" && (
                    <div className="absolute top-3 right-3 text-blue-600">
                      <Check size={16} />
                    </div>
                  )}
                </label>

                <label className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 ${
                  formData.role === "SUPPLIER"
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}>
                  <input
                    type="radio"
                    value="SUPPLIER"
                    checked={formData.role === "SUPPLIER"}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as "SUPPLIER" })}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`p-3 rounded-full ${formData.role === "SUPPLIER" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                      <Truck size={24} />
                    </div>
                    <div>
                      <span className={`block font-bold ${formData.role === "SUPPLIER" ? "text-blue-900" : "text-slate-900"}`}>ספק</span>
                      <span className="text-xs text-slate-500">אני מעוניין למכור חלקים</span>
                    </div>
                  </div>
                  {formData.role === "SUPPLIER" && (
                    <div className="absolute top-3 right-3 text-blue-600">
                      <Check size={16} />
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  שם העסק / שם מלא
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input pr-10"
                    placeholder="שם העסק"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                  טלפון (אופציונלי)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input pr-10"
                    placeholder="050-0000000"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  כתובת אימייל
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="input pr-10"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  סיסמה
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="input pr-10"
                    placeholder="לפחות 6 תווים"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                  אימות סיסמה
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="input pr-10"
                    placeholder="הזן סיסמה שוב"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  יוצר חשבון...
                </>
              ) : (
                <>
                  צור חשבון
                  <ArrowLeft size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-600">
            יש לך כבר חשבון?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
              התחבר כאן
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
