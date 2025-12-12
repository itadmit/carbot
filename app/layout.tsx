import type { Metadata } from "next"
import { Noto_Sans_Hebrew } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const notoSansHebrew = Noto_Sans_Hebrew({ subsets: ["hebrew"] })

export const metadata: Metadata = {
  title: "CarBot - מערכת לניהול חלקי חילוף",
  description: "מערכת SaaS חכמה שמחברת בין מוסכים לספקי חלקי חילוף",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={notoSansHebrew.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

