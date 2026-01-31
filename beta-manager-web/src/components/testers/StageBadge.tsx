import { cn } from '../../lib/utils';
import { STAGE_LABELS, STAGE_COLORS } from '../../lib/constants';
import type { TesterStage } from '../../types/tester';

interface StageBadgeProps {
  stage: TesterStage;
  className?: string;
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        STAGE_COLORS[stage],
        className
      )}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}
