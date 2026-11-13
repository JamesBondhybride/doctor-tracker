'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Pencil, Trash2, Plus } from 'lucide-react';
import api from '@/lib/api';
import { Patient } from '@/types';
import Pagination from '@/components/ui/Pagination';
import EditPatientModal from '@/components/doctors/EditPatientModal';
import AddPatientModal from '@/components/patients/AddPatientModal';

export default function PatientsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [condition, setCondition] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey: ['patients', page, debouncedSearch, condition, startDate, endDate],
    queryFn: async () => {
      const res = await api.get('/patients', {
        params: { page, limit: 8, search: debouncedSearch, condition, startDate, endDate },
      });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/patients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients Management</h1>
          <p className="text-sm text-slate-500">Search, filter, update, and manage all registered patients</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" /> Add Patient
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search patient name or phone..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-teal-600 focus:outline-none"
          />
        </div>
        <input
          type="text"
          value={condition}
          onChange={(e) => {
            setCondition(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by condition..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-6 py-3.5">Patient Name</th>
                <th className="px-6 py-3.5">Age / Gender</th>
                <th className="px-6 py-3.5">Condition</th>
                <th className="px-6 py-3.5">Assigned Doctor</th>
                <th className="px-6 py-3.5">Phone</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading patients...
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No patients found.
                  </td>
                </tr>
              ) : (
                data?.data?.map((patient: Patient) => {
                  const docName =
                    typeof patient.doctorId === 'object' && patient.doctorId !== null
                      ? patient.doctorId.name
                      : 'Unassigned';
                  return (
                    <tr key={patient._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{patient.name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {patient.age} yrs • {patient.gender}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {patient.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{docName}</td>
                      <td className="px-6 py-4 text-slate-600">{patient.phone}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingPatient(patient)}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                            title="Edit patient"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMutation.mutate(patient._id)}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                            title="Delete patient"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 pb-4">
          <Pagination pagination={data?.pagination} onPageChange={setPage} />
        </div>
      </div>

      <AddPatientModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditPatientModal patient={editingPatient} onClose={() => setEditingPatient(null)} />
    </div>
  );
}
