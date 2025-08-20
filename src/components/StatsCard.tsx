import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { formatNumber } from "@/src/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: number | string
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: "blue" | "green" | "purple" | "orange" | "red"
  className?: string
}

const colorClasses = {
  blue: {
    icon: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20"
  },
  green: {
    icon: "text-green-600 dark:text-green-400", 
    bg: "bg-green-50 dark:bg-green-900/20"
  },
  purple: {
    icon: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20"
  },
  orange: {
    icon: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20"
  },
  red: {
    icon: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20"
  }
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  color = "blue",
  className 
}: StatsCardProps) {
  const colors = colorClasses[color]
  const formattedValue = typeof value === "number" ? formatNumber(value) : value

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className || ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        {Icon && (
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Icon className={`h-4 w-4 ${colors.icon}`} />
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formattedValue}
          </div>
          
          {trend && (
            <div className={`flex items-center text-sm font-medium ${
              trend.isPositive 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            }`}>
              <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
