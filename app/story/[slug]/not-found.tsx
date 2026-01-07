import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <h1 className="text-4xl font-serif font-bold text-primary">Рассказ не найден</h1>
          <p className="text-xl text-muted-foreground">Кажется, этот рассказ ещё не написан...</p>
          <Link href="/">
            <Button size="lg">Вернуться к рассказам</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
