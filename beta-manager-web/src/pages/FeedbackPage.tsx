import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { FeedbackCard } from '../components/feedback';
import { useFeedbackList, useUpdateFeedback } from '../hooks/useFeedback';
import type { FeedbackStatus, Feedback } from '../types/feedback';

const STATUS_OPTIONS: { value: FeedbackStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In Review' },
  { value: 'addressed', label: 'Addressed' },
  { value: 'closed', label: 'Closed' },
];

export function FeedbackPage() {
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | ''>('');
  const [page, setPage] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const { data, isLoading, error } = useFeedbackList({
    page,
    size: 20,
    status: statusFilter || undefined,
  });

  const updateFeedback = useUpdateFeedback();

  function handleStatusChange(id: number, status: FeedbackStatus) {
    updateFeedback.mutate({ id, data: { status } });
  }

  function handleViewDetails(id: number) {
    const feedback = data?.results.find((f) => f.id === id);
    if (feedback) {
      setSelectedFeedback(feedback);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Feedback</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="w-48">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as FeedbackStatus | '');
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
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          Failed to load feedback. Please try again.
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
            <p className="text-gray-500">No feedback found</p>
          </CardContent>
        </Card>
      )}

      {/* Feedback Grid */}
      {!isLoading && data && data.results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.results.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
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

      {/* Feedback Detail Dialog */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedFeedback.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                  {selectedFeedback.type}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {selectedFeedback.status}
                </span>
                {selectedFeedback.severity && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                    {selectedFeedback.severity}
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Content
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedFeedback.content}
                </p>
              </div>

              {(selectedFeedback.device_info || selectedFeedback.app_version) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Device Info
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedFeedback.device_info}
                    {selectedFeedback.device_info &&
                      selectedFeedback.app_version &&
                      ' | '}
                    {selectedFeedback.app_version &&
                      `v${selectedFeedback.app_version}`}
                  </p>
                </div>
              )}

              {selectedFeedback.admin_notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Admin Notes
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedFeedback.admin_notes}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-400">
                Created: {new Date(selectedFeedback.created_at).toLocaleString()}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFeedback(null)}
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
