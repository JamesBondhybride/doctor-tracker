'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Trash2, UserPlus, Users } from 'lucide-react';
import api from '@/lib/api';
import { Doctor, Patient } from '@/types';

interface DoctorPatientsModalProps {
  doctorId: string | null;
  onClose: () => void;
}

export default function DoctorPatientsModal({ doctorId, onClose }: DoctorPatientsModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', age: '', gender: 'Male', phone: '', condition: '' });

  const { data: doctor, isLoading } = useQuery({
    queryKey: ['doctor-details', doctorId],
    queryFn: async () => {
      const res = await api.get(`/doctors/${doctorId}`);
      return res.data.data as Doctor;
    },
    enabled: !!doctorId,
  });

  const addMutation = useMutation({
    mutationFn: () => api.post('/patients', { ...form, age: Number(form.age), doctorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-details', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setForm({ name: '', age: '', gender: 'Male', phone: '', condition: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (patientId: string) => api.delete(`/patients/${patientId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-details', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  if (!doctorId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {doctor ? `${doctor.name} — Patients` : 'Loading...'}
            </h2>
            {doctor && (
              <p className="text-xs text-slate-500">
                {doctor.specialization} • {doctor.hospital}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addMutation.mutate();
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <UserPlus className="h-4 w-4 text-teal-600" /> Assign New Patient
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
              <input
                required
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <input
                required
                type="number"
                min={0}
                max={150}
                placeholder="Age"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                required
                placeholder="Condition"
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={addMutation.isPending}
                className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
              >
                {addMutation.isPending ? 'Adding...' : 'Add Patient'}
              </button>
            </div>
          </form>

          <div>
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <Users className="h-4 w-4 text-blue-600" /> Assigned Patients ({doctor?.patients?.length ?? 0})
            </h3>
            {isLoading ? (
              <p className="py-6 text-center text-sm text-slate-500">Loading patients...</p>
            ) : doctor?.patients?.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
                No patients assigned yet.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                    <tr>
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Age / Gender</th>
                      <th className="px-4 py-2.5">Condition</th>
                      <th className="px-4 py-2.5">Phone</th>
                      <th className="px-4 py-2.5 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {doctor?.patients?.map((patient: Patient) => (
                      <tr key={patient._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{patient.name}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {patient.age} yrs • {patient.gender}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {patient.condition}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{patient.phone}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => deleteMutation.mutate(patient._id)}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
