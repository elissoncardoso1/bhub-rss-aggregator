'use client'

import { Button } from "@/src/components/ui/button"
import { Share2 } from "lucide-react"

interface ShareButtonProps {
  title: string
  url: string
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: url
      })
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4 mr-2" />
      Compartilhar
    </Button>
  )
}