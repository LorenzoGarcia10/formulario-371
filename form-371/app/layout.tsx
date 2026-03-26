import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Pré Cadastro | Agropecuária 371",
  description:
    "Pré-cadastro: nome, CPF (opcional), fazenda, cidade e telefone. Agropecuária 371 — Mato Grosso.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="h-dvh max-h-dvh overflow-hidden overscroll-none antialiased">
      <body className={`${inter.variable} ${playfair.variable} h-dvh min-h-0 max-h-dvh overflow-hidden font-sans`}>
        {children}
      </body>
    </html>
  )
}
