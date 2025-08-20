"use client"

import { useEffect, useState } from "react"

export function SystemInfo() {
  const [nodeVersion, setNodeVersion] = useState<string>("")

  useEffect(() => {
    // Só define a versão no cliente para evitar hidratação diferente
    setNodeVersion(process.version)
  }, [])

  return (
    <div>
      <span className="font-medium">Node.js:</span> {nodeVersion || "Carregando..."}
    </div>
  )
}
