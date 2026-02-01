import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { TesterTable, TesterForm, StageSelect } from '../components/testers';
import { useTesters, useCreateTester, useUpdateTesterStage } from '../hooks/useTesters';
import type { TesterStage, CreateTesterInput } from '../types/tester';

export function TestersPage() {
  const [stageFilter, setStageFilter] = useState<TesterStage | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [changeStageForTester, setChangeStageForTester] = useState<number | null>(null);
  const [newStage, setNewStage] = useState<TesterStage | ''>('');

  const { data, isLoading, error } = useTesters({
    page,
    size: 20,
    stage: stageFilter || undefined,
    search: searchQuery || undefined,
  });

  const createTester = useCreateTester();
  const updateStage = useUpdateTesterStage();

  function handleCreateTester(input: CreateTesterInput) {
    createTester.mutate(input, {
      onSuccess: () => {
        setShowAddDialog(false);
      },
    });
  }

  function handleStageChange(id: number) {
    setChangeStageForTester(id);
    const tester = data?.results.find((t) => t.id === id);
    if (tester) {
      setNewStage(tester.stage);
    }
  }

  function handleStageUpdate() {
    if (changeStageForTester && newStage) {
      updateStage.mutate(
        { id: changeStageForTester, stage: newStage as TesterStage },
        {
          onSuccess: () => {
            setChangeStageForTester(null);
            setNewStage('');
          },
        }
      );
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Testers</h1>
        <Button onClick={() => setShowAddDialog(true)}>Add Tester</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 sm:max-w-sm">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-48">
          <StageSelect
            value={stageFilter}
            onChange={(stage) => {
              setStageFilter(stage);
              setPage(1);
            }}
            includeAll
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          Failed to load testers. Please try again.
        </div>
      )}

      {/* Testers Table */}
      <TesterTable
        testers={data?.results || []}
        isLoading={isLoading}
        onStageChange={handleStageChange}
      />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
          <p className="text-sm text-gray-600 text-center sm:text-left">
            Showing {data.results.length} of {data.count} testers
          </p>
          <div className="flex justify-center gap-2">
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

      {/* Add Tester Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add New Tester</CardTitle>
            </CardHeader>
            <CardContent>
              <TesterForm
                onSubmit={handleCreateTester}
                onCancel={() => setShowAddDialog(false)}
                isSubmitting={createTester.isPending}
              />
              {createTester.error && (
                <p className="text-sm text-red-600 mt-4">
                  Failed to create tester. Please try again.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Change Stage Dialog */}
      {changeStageForTester && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm mx-4">
            <CardHeader>
              <CardTitle>Change Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <StageSelect
                  value={newStage}
                  onChange={(stage) => setNewStage(stage)}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setChangeStageForTester(null);
                      setNewStage('');
                    }}
                    disabled={updateStage.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStageUpdate}
                    disabled={updateStage.isPending || !newStage}
                  >
                    {updateStage.isPending ? 'Updating...' : 'Update Stage'}
                  </Button>
                </div>
                {updateStage.error && (
                  <p className="text-sm text-red-600">
                    Failed to update stage. Please try again.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
