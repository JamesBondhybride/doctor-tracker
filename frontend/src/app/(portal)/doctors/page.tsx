'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Eye, Building2, Phone, Mail } from 'lucide-react';
import api from '@/lib/api';
import { Doctor } from '@/types';
import Pagination from '@/components/ui/Pagination';
import AddDoctorModal from '@/components/doctors/AddDoctorModal';
import DoctorPatientsModal from '@/components/doctors/DoctorPatientsModal';

export default function DoctorsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey: ['doctors', page, debouncedSearch, specialization, startDate, endDate],
    queryFn: async () => {
      const res = await api.get('/doctors', {
        params: { page, limit: 8, search: debouncedSearch, specialization, startDate, endDate },
      });
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctors Directory</h1>
          <p className="text-sm text-slate-500">Manage registered doctors and their assigned patients</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" /> Add Doctor
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, hospital, email..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-teal-600 focus:outline-none"
          />
        </div>
        <input
          type="text"
          value={specialization}
          onChange={(e) => {
            setSpecialization(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by specialization..."
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
                <th className="px-6 py-3.5">Doctor</th>
                <th className="px-6 py-3.5">Specialization</th>
                <th className="px-6 py-3.5">Hospital</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5 text-right">Patients</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Loading doctors...
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No doctors found matching your criteria.
                  </td>
                </tr>
              ) : (
                data?.data?.map((doc: Doctor) => (
                  <tr key={doc._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{doc.name}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                        {doc.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-slate-400" /> {doc.hospital}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-slate-400" /> {doc.phone}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-slate-400" /> {doc.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedDoctorId(doc._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5 text-teal-600" /> Manage Patients
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 pb-4">
          <Pagination pagination={data?.pagination} onPageChange={setPage} />
        </div>
      </div>

      {/* Extracted Modals */}
      <AddDoctorModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <DoctorPatientsModal doctorId={selectedDoctorId} onClose={() => setSelectedDoctorId(null)} />
    </div>
  );
}
