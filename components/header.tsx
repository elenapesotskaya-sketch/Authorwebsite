"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  const isProduction = typeof window !== "undefined" && window.location.hostname !== "localhost"
  const buttonText = isProduction ? "Для автора" : "Редактировать"

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif font-bold text-primary">
            НА ГЛАВНУЮ
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/stories">
              <Button variant="ghost">Все рассказы</Button>
            </Link>
            <Link href="/admin">
              <Button variant="default" size="sm">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {buttonText}
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
