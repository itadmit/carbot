import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role === "GARAGE") {
    redirect("/garage")
  }

  if (session.user.role === "SUPPLIER") {
    redirect("/supplier")
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin")
  }

  return null
}

