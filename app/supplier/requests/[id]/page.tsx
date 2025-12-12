"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Plus, X, Loader2 } from "lucide-react"

interface RequestData {
  id: string
  vehicle: {
    manufacturer: string
    model: string
    licensePlate: string
  }
  garage: {
    name: string
    phone?: string
    email: string
  }
  parts: string
  description?: string
  createdAt: string
  offers: Array<{
    id: string
    parts: string
    totalPrice?: number
    notes?: string
    status: string
    createdAt: string
  }>
}

interface PartOffer {
  name: string
  price: number
  available: boolean
}

export default function SupplierRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [request, setRequest] = useState<RequestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [parts, setParts] = useState<PartOffer[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    fetch(`/api/supplier/requests/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setRequest(data)
        const requestParts = JSON.parse(data.parts) as string[]
        setParts(
          requestParts.map((name) => ({
            name,
            price: 0,
            available: true,
          }))
        )
        setLoading(false)
      })
  }, [params.id])

  useEffect(() => {
    const total = parts
      .filter((p) => p.available)
      .reduce((sum, p) => sum + p.price, 0)
    setTotalPrice(total)
  }, [parts])

  const handlePartChange = (index: number, field: keyof PartOffer, value: any) => {
    const newParts = [...parts]
    newParts[index] = { ...newParts[index], [field]: value }
    setParts(newParts)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/supplier/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: params.id,
          parts,
          totalPrice,
          notes,
        }),
      })

      if (!response.ok) {
        throw new Error("שגיאה בשליחת הצעה")
      }

      router.push("/supplier/offers?success=true")
    } catch (error) {
      alert("שגיאה בשליחת הצעה. נסה שוב.")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    )
  }

  if (!request) {
    return <div>בקשה לא נמצאה</div>
  }

  const requestParts = JSON.parse(request.parts) as string[]
  const hasExistingOffer = request.offers.length > 0

  return (
    <div>
      <Link
        href="/supplier/requests"
        className="inline-flex items-center text-green-600 hover:text-green-700 mb-6"
      >
        <ArrowRight className="ml-2" size={18} />
        חזרה לבקשות
      </Link>

      <div className="card mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {request.vehicle.manufacturer} {request.vehicle.model}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">מספר רישוי:</span> {request.vehicle.licensePlate}
          </div>
          <div>
            <span className="font-medium">מוסך:</span> {request.garage.name}
          </div>
          {request.garage.phone && (
            <div>
              <span className="font-medium">טלפון:</span> {request.garage.phone}
            </div>
          )}
          <div>
            <span className="font-medium">אימייל:</span> {request.garage.email}
          </div>
        </div>
        {request.description && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">תיאור נוסף:</p>
            <p className="text-gray-600">{request.description}</p>
          </div>
        )}
      </div>

      {hasExistingOffer ? (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ההצעה שלך</h2>
          <div className="space-y-3">
            {JSON.parse(request.offers[0].parts).map((part: PartOffer, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">{part.name}</span>
                {part.available ? (
                  <span className="text-gray-700">₪{part.price.toLocaleString()}</span>
                ) : (
                  <span className="badge badge-warning">לא זמין</span>
                )}
              </div>
            ))}
            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
              <span className="font-semibold text-lg">סה״כ:</span>
              <span className="text-2xl font-bold text-green-600">
                ₪{request.offers[0].totalPrice?.toLocaleString()}
              </span>
            </div>
            {request.offers[0].notes && (
              <div className="mt-3 p-3 bg-blue-50 rounded">
                <p className="text-sm font-medium text-gray-700 mb-1">הערות:</p>
                <p className="text-gray-600 text-sm">{request.offers[0].notes}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">שלח הצעה</h2>

          <div className="space-y-4 mb-6">
            {parts.map((part, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={part.available}
                      onChange={(e) =>
                        handlePartChange(index, "available", e.target.checked)
                      }
                      className="ml-2"
                    />
                    <span className="font-medium text-gray-900">{part.name}</span>
                  </label>
                </div>
                {part.available && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      מחיר (₪)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={part.price || ""}
                      onChange={(e) =>
                        handlePartChange(index, "price", parseFloat(e.target.value) || 0)
                      }
                      className="input"
                      required={part.available}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">מחיר כולל:</span>
              <span className="text-3xl font-bold text-green-600">
                ₪{totalPrice.toLocaleString()}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                הערות (אופציונלי)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input"
                placeholder="הוסף הערות או פרטים נוספים..."
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || totalPrice === 0}
              className="btn-primary flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  שולח...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  שלח הצעה
                </>
              )}
            </button>
            <Link href="/supplier/requests" className="btn-secondary">
              ביטול
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}

