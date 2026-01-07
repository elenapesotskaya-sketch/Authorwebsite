"use client"

import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchBarProps {
  initialSearch?: string
  initialSort?: string
}

export function SearchBar({ initialSearch, initialSort }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch || "")
  const [sort, setSort] = useState(initialSort || "likes")
  const [isPending, startTransition] = useTransition()

  const handleSearch = (value: string) => {
    setSearch(value)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set("search", value)
      } else {
        params.delete("search")
      }
      router.push(`/?${params.toString()}`)
    })
  }

  const handleSort = (value: string) => {
    setSort(value)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === "date") {
        params.set("sort", "date")
      } else {
        params.delete("sort")
      }
      router.push(`/?${params.toString()}`)
    })
  }

  return (
    <div className="flex gap-4 items-center">
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35" />
        </svg>
        <Input
          type="text"
          placeholder="Поиск по ключевым словам..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      <Select value={sort} onValueChange={handleSort}>
        <SelectTrigger className="w-[200px] h-12">
          <SelectValue placeholder="Сортировка" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Сначала новые</SelectItem>
          <SelectItem value="likes">По популярности</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
