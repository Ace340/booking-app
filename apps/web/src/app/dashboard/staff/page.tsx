'use client'

import { useState } from 'react'
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from '@/features/staff/hooks'
import type { Staff } from '@booking-app/types'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export default function StaffPage() {
  const token = getToken()
  const { data: staff, isLoading, error } = useStaff({}, token)
  const createStaff = useCreateStaff(token)
  const updateStaff = useUpdateStaff(token)
  const deleteStaff = useDeleteStaff(token)

  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [form, setForm] = useState({ name: '', email: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingStaff) {
      updateStaff.mutate(
        { id: editingStaff.id, data: { name: form.name, email: form.email } },
        { onSuccess: () => { setShowForm(false); setEditingStaff(null); resetForm() } }
      )
    } else {
      createStaff.mutate(
        { name: form.name, email: form.email },
        { onSuccess: () => { setShowForm(false); resetForm() } }
      )
    }
  }

  const handleEdit = (member: Staff) => {
    setEditingStaff(member)
    setForm({ name: member.name, email: member.email })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      deleteStaff.mutate(id)
    }
  }

  const resetForm = () => setForm({ name: '', email: '' })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your team members and their schedules.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { resetForm(); setEditingStaff(null); setShowForm(!showForm) }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Staff
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingStaff ? 'Edit Staff Member' : 'New Staff Member'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder="e.g. Jane Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder="e.g. jane@example.com"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={createStaff.isPending || updateStaff.isPending}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {createStaff.isPending || updateStaff.isPending ? 'Saving...' : editingStaff ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingStaff(null); resetForm() }}
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
          <p className="text-center text-sm text-gray-500">Loading staff...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-12">
          <p className="text-center text-sm text-red-600">Failed to load staff. Please try again.</p>
        </div>
      )}

      {/* Data Table */}
      {staff && staff.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
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
      {staff && staff.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No staff members</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add staff members so you can assign them to appointments.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
