import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: "GARAGE" | "SUPPLIER" | "ADMIN"
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: "GARAGE" | "SUPPLIER" | "ADMIN"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "GARAGE" | "SUPPLIER" | "ADMIN"
  }
}

