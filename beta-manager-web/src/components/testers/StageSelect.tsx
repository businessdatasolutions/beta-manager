import { Select } from '../ui/select';
import { TESTER_STAGES, STAGE_LABELS } from '../../lib/constants';
import type { TesterStage } from '../../types/tester';

interface StageSelectProps {
  value: TesterStage | '';
  onChange: (stage: TesterStage) => void;
  disabled?: boolean;
  includeAll?: boolean;
  className?: string;
}

export function StageSelect({
  value,
  onChange,
  disabled,
  includeAll = false,
  className,
}: StageSelectProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as TesterStage)}
      disabled={disabled}
      className={className}
    >
      {includeAll && <option value="">All Stages</option>}
      {TESTER_STAGES.map((stage) => (
        <option key={stage} value={stage}>
          {STAGE_LABELS[stage]}
        </option>
      ))}
    </Select>
  );
}
