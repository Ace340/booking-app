interface StatCardProps {
  title: string
  value: string
  description: string
  icon: JSX.Element
}

export function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50 text-primary-600">
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}
