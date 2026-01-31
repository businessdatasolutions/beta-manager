import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { IncidentCard } from '../components/incidents';
import { useIncidentsList, useUpdateIncident } from '../hooks/useIncidents';
import type { IncidentStatus, IncidentType, Incident } from '../types/incident';

const STATUS_OPTIONS: { value: IncidentStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
];

const TYPE_OPTIONS: { value: IncidentType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'crash', label: 'Crash' },
  { value: 'bug', label: 'Bug' },
  { value: 'ux_complaint', label: 'UX Complaint' },
  { value: 'dropout', label: 'Dropout' },
  { value: 'uninstall', label: 'Uninstall' },
];

export function IncidentsPage() {
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<IncidentType | ''>('');
  const [page, setPage] = useState(1);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const { data, isLoading, error } = useIncidentsList({
    page,
    size: 20,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });

  const updateIncident = useUpdateIncident();

  function handleStatusChange(id: number, status: IncidentStatus) {
    const updateData: { status: IncidentStatus; resolution_notes?: string } = {
      status,
    };
    if (status === 'resolved') {
      updateData.resolution_notes = 'Resolved via dashboard';
    }
    updateIncident.mutate({ id, data: updateData });
  }

  function handleViewDetails(id: number) {
    const incident = data?.results.find((i) => i.id === id);
    if (incident) {
      setSelectedIncident(incident);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Incidents</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="w-48">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as IncidentStatus | '');
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-48">
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as IncidentType | '');
              setPage(1);
            }}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          Failed to load incidents. Please try again.
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <div className="space-y-3">
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && data?.results.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No incidents found</p>
          </CardContent>
        </Card>
      )}

      {/* Incidents Grid */}
      {!isLoading && data && data.results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.results.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onStatusChange={handleStatusChange}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Showing {data.results.length} of {data.count} items
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm">
              Page {page} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= data.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Incident Detail Dialog */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedIncident.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                  {selectedIncident.type}
                </span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    selectedIncident.status === 'open'
                      ? 'bg-red-100 text-red-800'
                      : selectedIncident.status === 'investigating'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}
                >
                  {selectedIncident.status}
                </span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    selectedIncident.severity === 'critical'
                      ? 'bg-red-100 text-red-800'
                      : selectedIncident.severity === 'major'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {selectedIncident.severity}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Description
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedIncident.description}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Source
                </h4>
                <p className="text-gray-600 capitalize">
                  {selectedIncident.source}
                </p>
              </div>

              {selectedIncident.crash_id && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Crash ID
                  </h4>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {selectedIncident.crash_id}
                  </p>
                </div>
              )}

              {selectedIncident.resolution_notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Resolution Notes
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedIncident.resolution_notes}
                  </p>
                </div>
              )}

              {selectedIncident.resolved_at && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Resolved At
                  </h4>
                  <p className="text-gray-600">
                    {new Date(selectedIncident.resolved_at).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-400">
                Created: {new Date(selectedIncident.created_at).toLocaleString()}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedIncident(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
