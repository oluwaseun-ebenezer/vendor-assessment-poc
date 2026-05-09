import { Badge } from "@/components/ui/badge";
import { RiskFlag } from "@/types";
import { RISK_FLAG_LABELS } from "@/lib/constants";
import { cn, getRiskFlagBgColor, getRiskFlagIcon } from "@/lib/utils";

interface RiskFlagBadgeProps {
  flag?: RiskFlag;
}

export function RiskFlagBadge({ flag }: RiskFlagBadgeProps) {
  if (!flag) {
    return <span className="text-gray-400">N/A</span>;
  }

  return (
    <Badge className={cn("text-xs", getRiskFlagBgColor(flag))}>
      {getRiskFlagIcon(flag)} {RISK_FLAG_LABELS[flag]}
    </Badge>
  );
}
