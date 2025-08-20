import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Middleware adicional pode ser adicionado aqui
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protege rotas admin
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "ADMIN"
        }
        
        // Outras rotas são públicas
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Only match admin routes to avoid interfering with NextAuth
     */
    '/admin/:path*',
  ],
}
