export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Konstantin Polunin. Все права защищены.
          </p>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Самолётные рассказы — это короткие истории, рождающиеся между взлётом и посадкой, где бытовые сцены превращаются в философские путешествия. Все  герои вымышленные, совпадения случайны.
          </p>
        </div>
      </div>
    </footer>
  )
}
