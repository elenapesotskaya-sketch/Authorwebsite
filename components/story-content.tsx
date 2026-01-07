import type React from "react"
interface StoryContentProps {
  content: string
}

function parseMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let currentIndex = 0

  // Regular expressions for bold (**text**) and italic (*text*)
  const boldRegex = /\*\*(.+?)\*\*/g
  const italicRegex = /\*(.+?)\*/g

  // First pass: find all bold and italic markers
  const markers: Array<{ type: "bold" | "italic"; start: number; end: number; text: string }> = []

  let match
  while ((match = boldRegex.exec(text)) !== null) {
    markers.push({
      type: "bold",
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
    })
  }

  while ((match = italicRegex.exec(text)) !== null) {
    // Check if this asterisk is not part of a bold marker
    const isBold = markers.some((m) => m.type === "bold" && match.index >= m.start && match.index < m.end)
    if (!isBold) {
      markers.push({
        type: "italic",
        start: match.index,
        end: match.index + match[0].length,
        text: match[1],
      })
    }
  }

  // Sort markers by position
  markers.sort((a, b) => a.start - b.start)

  // Build the result with formatted text
  markers.forEach((marker, index) => {
    // Add text before this marker
    if (marker.start > currentIndex) {
      parts.push(text.substring(currentIndex, marker.start))
    }

    // Add formatted text
    if (marker.type === "bold") {
      parts.push(<strong key={`bold-${index}`}>{marker.text}</strong>)
    } else {
      parts.push(<em key={`italic-${index}`}>{marker.text}</em>)
    }

    currentIndex = marker.end
  })

  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex))
  }

  return parts.length > 0 ? parts : [text]
}

export function StoryContent({ content }: StoryContentProps) {
  return (
    <div className="prose prose-lg max-w-none">
      {content.split("\n\n").map((paragraph, index) => (
        <p key={index} className="mb-6 leading-relaxed text-foreground">
          {parseMarkdown(paragraph)}
        </p>
      ))}
    </div>
  )
}
