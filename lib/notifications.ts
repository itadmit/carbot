import { sendWhatsApp, formatPhoneNumber } from "./whatsapp"
import { prisma } from "./prisma"

export async function notifyRequestCreated(requestId: string): Promise<void> {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: {
      garage: true,
      vehicle: true,
    },
  })

  if (!request) return

  // Notify garage
  if (request.garage.phone) {
    const message = `✅ הבקשה שלך נוצרה בהצלחה!\nמספר בקשה: ${requestId.substring(0, 8)}\nרכב: ${request.vehicle.manufacturer} ${request.vehicle.model}`
    await sendWhatsApp(formatPhoneNumber(request.garage.phone), message)
  }

  // Find matching suppliers and notify them
  const matchingSupplierIds = await import("./matching").then(m => 
    m.findMatchingSuppliers({ manufacturer: request.vehicle.manufacturer })
  )

  for (const supplierId of matchingSupplierIds) {
    const supplier = await prisma.user.findUnique({
      where: { id: supplierId },
    })

    if (supplier?.phone) {
      const message = `🔔 בקשה חדשה!\nרכב: ${request.vehicle.manufacturer} ${request.vehicle.model}\nמספר רישוי: ${request.vehicle.licensePlate}\nכניסה לדשבורד לפרטים נוספים`
      await sendWhatsApp(formatPhoneNumber(supplier.phone), message)
    }
  }
}

export async function notifyOfferSent(offerId: string): Promise<void> {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      request: {
        include: {
          garage: true,
        },
      },
      supplier: true,
    },
  })

  if (!offer) return

  // Notify garage about new offer
  if (offer.request.garage.phone) {
    const message = `💰 הצעה חדשה התקבלה!\nספק: ${offer.supplier.name}\nמחיר כולל: ₪${offer.totalPrice}\nכניסה לדשבורד לפרטים`
    await sendWhatsApp(formatPhoneNumber(offer.request.garage.phone), message)
  }
}

