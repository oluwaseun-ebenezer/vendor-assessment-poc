import { Badge } from "@/components/ui/badge";
import { VendorStatus } from "@/types";
import { STATUS_LABELS } from "@/lib/constants";
import { cn, getStatusColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: VendorStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={cn("text-xs", getStatusColor(status))}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
