import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/card';
import {
  StageBadge,
  StageSelect,
  TesterTimeline,
} from '../components/testers';
import { SendEmailDialog } from '../components/email';
import {
  useTester,
  useTesterTimeline,
  useUpdateTesterStage,
  useDeleteTester,
} from '../hooks/useTesters';
import { TEST_DURATION_DAYS } from '../lib/constants';
import type { TesterStage } from '../types/tester';

export function TesterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const testerId = Number(id);

  const [showStageDialog, setShowStageDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newStage, setNewStage] = useState<TesterStage | ''>('');

  const { data: tester, isLoading, error } = useTester(testerId);
  const { data: timeline, isLoading: timelineLoading } =
    useTesterTimeline(testerId);
  const updateStage = useUpdateTesterStage();
  const deleteTester = useDeleteTester();

  function handleStageUpdate() {
    if (newStage) {
      updateStage.mutate(
        { id: testerId, stage: newStage as TesterStage },
        {
          onSuccess: () => {
            setShowStageDialog(false);
            setNewStage('');
          },
        }
      );
    }
  }

  function handleDelete() {
    deleteTester.mutate(testerId, {
      onSuccess: () => {
        navigate('/testers');
      },
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !tester) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/testers" className="text-blue-600 hover:underline">
            &larr; Back to Testers
          </Link>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-600">
              Failed to load tester. The tester may have been deleted.
            </p>
            <Button className="mt-4" onClick={() => navigate('/testers')}>
              Return to Testers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Link to="/testers" className="text-blue-600 hover:underline">
            &larr; Back
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">{tester.name}</h1>
          <StageBadge stage={tester.stage} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmailDialog(true)}
          >
            Send Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewStage(tester.stage);
              setShowStageDialog(true);
            }}
          >
            Change Stage
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tester Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{tester.email}</p>
              </div>
              {tester.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{tester.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="font-medium capitalize">{tester.source}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Days in Test</p>
                  <p className="text-2xl font-bold">{tester.days_in_test}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Days Remaining</p>
                  <p className="text-2xl font-bold">
                    {Math.max(0, tester.days_remaining)}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (tester.days_in_test / TEST_DURATION_DAYS) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                {tester.days_in_test} of {TEST_DURATION_DAYS} days completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Feedback</p>
                  <p className="text-2xl font-bold">{tester.feedback_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Incidents</p>
                  <p className="text-2xl font-bold">{tester.incident_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {tester.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {tester.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Communications, feedback, and incidents for this tester
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TesterTimeline
                items={timeline || []}
                isLoading={timelineLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Stage Dialog */}
      {showStageDialog && (
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
                      setShowStageDialog(false);
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

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm mx-4">
            <CardHeader>
              <CardTitle>Delete Tester</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete {tester.name}? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteTester.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteTester.isPending}
                >
                  {deleteTester.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
              {deleteTester.error && (
                <p className="text-sm text-red-600 mt-4">
                  Failed to delete tester. Please try again.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Send Email Dialog */}
      {showEmailDialog && (
        <SendEmailDialog
          tester={tester}
          onClose={() => setShowEmailDialog(false)}
        />
      )}
    </div>
  );
}
