type SupabaseQueryBuilder = {
  select: (columns?: string) => SupabaseQueryBuilder
  insert: (data: any) => SupabaseQueryBuilder
  update: (data: any) => SupabaseQueryBuilder
  delete: () => SupabaseQueryBuilder
  eq: (column: string, value: any) => SupabaseQueryBuilder
  order: (column: string, options?: { ascending?: boolean }) => SupabaseQueryBuilder
  ilike: (column: string, value: string) => SupabaseQueryBuilder
  or: (query: string) => SupabaseQueryBuilder
  single: () => Promise<{ data: any; error: any }>
  then: (resolve: (result: { data: any; error: any }) => void) => Promise<any>
}

class SupabaseClient {
  private url: string
  private key: string
  private query: {
    table?: string
    method?: string
    columns?: string
    data?: any
    filters?: string[]
    orderBy?: string
    limit?: number
  }

  constructor(url: string, key: string) {
    this.url = url
    this.key = key
    this.query = {}
  }

  from(table: string): SupabaseQueryBuilder {
    this.query = { table, filters: [] }

    const builder: any = {
      select: (columns = "*") => {
        if (!this.query.method) {
          this.query.method = "GET"
        }
        this.query.columns = columns
        return builder
      },
      insert: (data: any) => {
        this.query.method = "POST"
        this.query.data = data
        return builder
      },
      update: (data: any) => {
        this.query.method = "PATCH"
        this.query.data = data
        return builder
      },
      delete: () => {
        this.query.method = "DELETE"
        return builder
      },
      eq: (column: string, value: any) => {
        this.query.filters?.push(`${column}=eq.${value}`)
        return builder
      },
      order: (column: string, options?: { ascending?: boolean }) => {
        const direction = options?.ascending ? "asc" : "desc"
        this.query.orderBy = `${column}.${direction}`
        return builder
      },
      ilike: (column: string, value: string) => {
        this.query.filters?.push(`${column}=ilike.${value}`)
        return builder
      },
      or: (query: string) => {
        this.query.filters?.push(`or=(${query})`)
        return builder
      },
      single: async () => {
        const result = await this.execute()
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          return { data: result.data[0], error: null }
        }
        return { data: null, error: result.error || new Error("No data returned") }
      },
      then: (resolve: any) => {
        return this.execute().then(resolve)
      },
    }

    return builder
  }

  private async execute(): Promise<{ data: any; error: any }> {
    try {
      console.log("[v0] Executing query:", {
        table: this.query.table,
        method: this.query.method,
        data: this.query.data,
        filters: this.query.filters,
      })

      const headers: Record<string, string> = {
        apikey: this.key,
        Authorization: `Bearer ${this.key}`,
        "Content-Type": "application/json",
      }

      if (this.query.method !== "DELETE") {
        headers.Prefer = "return=representation"
      }

      let url = `${this.url}/rest/v1/${this.query.table}`

      if (this.query.method === "GET" && this.query.columns) {
        const params = new URLSearchParams()
        params.append("select", this.query.columns)

        if (this.query.filters && this.query.filters.length > 0) {
          this.query.filters.forEach((filter) => {
            const [key, value] = filter.split("=")
            params.append(key, value)
          })
        }

        if (this.query.orderBy) {
          params.append("order", this.query.orderBy)
        }

        url += "?" + params.toString()
      } else if (this.query.filters && this.query.filters.length > 0) {
        const params = new URLSearchParams()
        this.query.filters.forEach((filter) => {
          const [key, value] = filter.split("=")
          params.append(key, value)
        })
        url += "?" + params.toString()
      }

      const options: RequestInit = {
        method: this.query.method || "GET",
        headers,
      }

      if (this.query.data && (this.query.method === "POST" || this.query.method === "PATCH")) {
        options.body = JSON.stringify(this.query.data)
      }

      console.log("[v0] Final request:", { url, method: options.method, hasBody: !!options.body })

      const response = await fetch(url, options)

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] Error response:", errorText)
        return { data: null, error: new Error(`Supabase error: ${response.status} - ${errorText}`) }
      }

      if (this.query.method === "DELETE") {
        console.log("[v0] DELETE successful, returning null data")
        return { data: null, error: null }
      }

      const responseText = await response.text()
      console.log("[v0] Raw response:", responseText.substring(0, 200))

      if (!responseText || responseText.trim() === "") {
        return { data: null, error: null }
      }

      const data = JSON.parse(responseText)
      console.log("[v0] Parsed data:", Array.isArray(data) ? `Array with ${data.length} items` : typeof data)
      return { data, error: null }
    } catch (error) {
      console.log("[v0] Execute error:", error)
      return { data: null, error }
    }
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return new SupabaseClient(url, key)
}
