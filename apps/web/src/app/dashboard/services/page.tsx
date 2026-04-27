'use client'

import { useState } from 'react'
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/features/services/hooks'
import type { Service } from '@booking-app/types'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export default function ServicesPage() {
  const token = getToken()
  const { data: services, isLoading, error } = useServices({}, token)
  const createService = useCreateService(token)
  const updateService = useUpdateService(token)
  const deleteService = useDeleteService(token)

  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [form, setForm] = useState({ name: '', duration: 30, price: 0 })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingService) {
      updateService.mutate(
        { id: editingService.id, data: { name: form.name, duration: form.duration, price: form.price } },
        { onSuccess: () => { setShowForm(false); setEditingService(null); resetForm() } }
      )
    } else {
      createService.mutate(
        { name: form.name, duration: form.duration, price: form.price },
        { onSuccess: () => { setShowForm(false); resetForm() } }
      )
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setForm({ name: service.name, duration: service.duration, price: Number(service.price) })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      deleteService.mutate(id)
    }
  }

  const resetForm = () => setForm({ name: '', duration: 30, price: 0 })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the services your business offers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { resetForm(); setEditingService(null); setShowForm(!showForm) }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Service
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingService ? 'Edit Service' : 'New Service'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder="e.g. Haircut"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
              <input
                type="number"
                required
                min={1}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                required
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="sm:col-span-3 flex gap-3">
              <button
                type="submit"
                disabled={createService.isPending || updateService.isPending}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {createService.isPending || updateService.isPending ? 'Saving...' : editingService ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingService(null); resetForm() }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <p className="text-center text-sm text-gray-500">Loading services...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-12">
          <p className="text-center text-sm text-red-600">Failed to load services. Please try again.</p>
        </div>
      )}

      {/* Data Table */}
      {services && services.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.duration} min</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Number(service.price).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleEdit(service)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {services && services.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No services configured</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add your first service to start accepting bookings.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
