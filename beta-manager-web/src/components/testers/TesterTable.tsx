import { Link } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../ui/table';
import { Button } from '../ui/button';
import { StageBadge } from './StageBadge';
import type { Tester } from '../../types/tester';

interface TesterTableProps {
  testers: Tester[];
  isLoading?: boolean;
  onStageChange?: (id: number) => void;
  onSendEmail?: (id: number) => void;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateString);
}

export function TesterTable({
  testers,
  isLoading,
  onStageChange,
  onSendEmail,
}: TesterTableProps) {
  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Started</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (testers.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-gray-500">No testers found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Started</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testers.map((tester) => (
            <TableRow key={tester.id}>
              <TableCell className="font-medium">
                <Link
                  to={`/testers/${tester.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {tester.name}
                </Link>
              </TableCell>
              <TableCell className="text-gray-600">{tester.email}</TableCell>
              <TableCell>
                <StageBadge stage={tester.stage} />
              </TableCell>
              <TableCell className="text-gray-600">
                {formatRelativeTime(tester.last_active)}
              </TableCell>
              <TableCell className="text-gray-600">
                {formatDate(tester.started_at)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onStageChange && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStageChange(tester.id)}
                    >
                      Stage
                    </Button>
                  )}
                  {onSendEmail && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSendEmail(tester.id)}
                    >
                      Email
                    </Button>
                  )}
                  <Link
                    to={`/testers/${tester.id}`}
                    className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    View
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
