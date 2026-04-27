export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account and business preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Business Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="business-name" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                id="business-name"
                type="text"
                placeholder="Your Business Name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="business-email" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                id="business-email"
                type="email"
                placeholder="contact@business.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
          <div className="space-y-3">
            {[
              { id: 'email-bookings', label: 'Email notifications for new bookings', defaultChecked: true },
              { id: 'email-cancellations', label: 'Email notifications for cancellations', defaultChecked: true },
              { id: 'email-reminders', label: 'Send booking reminders to customers', defaultChecked: false },
            ].map((option) => (
              <label key={option.id} htmlFor={option.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  id={option.id}
                  type="checkbox"
                  defaultChecked={option.defaultChecked}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">
            These actions are permanent and cannot be undone.
          </p>
          <button
            type="button"
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            Delete Business Account
          </button>
        </div>
      </div>
    </div>
  )
}
