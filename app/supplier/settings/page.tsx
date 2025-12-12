"use client"

import { useState, useEffect } from "react"
import { Loader2, Save } from "lucide-react"

const MANUFACTURERS = [
  "Mazda", "Toyota", "Honda", "Hyundai", "Mitsubishi",
  "Ford", "Volkswagen", "BMW", "Mercedes", "Audi",
  "Nissan", "Kia", "Subaru", "Volvo", "Peugeot"
]

const REGIONS = [
  "מרכז", "צפון", "דרום", "ירושלים והסביבה", "שרון"
]

export default function SupplierSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState({
    manufacturers: [] as string[],
    models: [] as string[],
    regions: [] as string[],
  })

  useEffect(() => {
    fetch("/api/supplier/preferences")
      .then((res) => res.json())
      .then((data) => {
        setPreferences({
          manufacturers: data.manufacturers || [],
          models: data.models || [],
          regions: data.regions || [],
        })
        setLoading(false)
      })
  }, [])

  const handleManufacturerToggle = (manufacturer: string) => {
    setPreferences((prev) => ({
      ...prev,
      manufacturers: prev.manufacturers.includes(manufacturer)
        ? prev.manufacturers.filter((m) => m !== manufacturer)
        : [...prev.manufacturers, manufacturer],
    }))
  }

  const handleRegionToggle = (region: string) => {
    setPreferences((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/supplier/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        throw new Error("שגיאה בשמירה")
      }

      alert("ההעדפות נשמרו בהצלחה!")
    } catch (error) {
      alert("שגיאה בשמירת ההעדפות. נסה שוב.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">הגדרות העדפות</h1>
        <p className="text-gray-600">
          הגדר את ההעדפות שלך כדי לקבל רק בקשות רלוונטיות
        </p>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">יצרנים מועדפים</h2>
        <p className="text-sm text-gray-600 mb-4">
          בחר את היצרנים שאתה מעוניין לקבל עבורם בקשות. השאר ריק כדי לקבל את כל היצרנים.
        </p>
        <div className="flex flex-wrap gap-2">
          {MANUFACTURERS.map((manufacturer) => (
            <button
              key={manufacturer}
              type="button"
              onClick={() => handleManufacturerToggle(manufacturer)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                preferences.manufacturers.includes(manufacturer)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {manufacturer}
            </button>
          ))}
        </div>
        {preferences.manufacturers.length > 0 && (
          <p className="text-sm text-gray-500 mt-4">
            נבחרו {preferences.manufacturers.length} יצרנים
          </p>
        )}
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">אזורים מועדפים</h2>
        <p className="text-sm text-gray-600 mb-4">
          בחר את האזורים שאתה מעוניין לספק בהם. השאר ריק כדי לספק בכל הארץ.
        </p>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => handleRegionToggle(region)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                preferences.regions.includes(region)
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {region}
            </button>
          ))}
        </div>
        {preferences.regions.length > 0 && (
          <p className="text-sm text-gray-500 mt-4">
            נבחרו {preferences.regions.length} אזורים
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              שומר...
            </>
          ) : (
            <>
              <Save size={20} />
              שמור העדפות
            </>
          )}
        </button>
      </div>
    </div>
  )
}

