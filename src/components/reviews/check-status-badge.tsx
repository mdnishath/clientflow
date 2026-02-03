/**
 * Check Status Badge Component
 *
 * Displays the live check status for a review
 */

"use client";

import { format } from "date-fns";
import { CheckCircle2, XCircle, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CheckStatusBadgeProps {
  checkStatus: string | null;
  lastCheckedAt: string | null;
  screenshotPath: string | null;
}

export function CheckStatusBadge({
  checkStatus,
  lastCheckedAt,
  screenshotPath,
}: CheckStatusBadgeProps) {
  if (!checkStatus) {
    return null;
  }

  const statusConfig: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    LIVE: {
      label: "Live ✓",
      color: "bg-green-600 text-white",
      icon: <CheckCircle2 size={12} />,
    },
    MISSING: {
      label: "Missing",
      color: "bg-red-600 text-white",
      icon: <XCircle size={12} />,
    },
    ERROR: {
      label: "Error",
      color: "bg-orange-600 text-white",
      icon: <AlertCircle size={12} />,
    },
    CHECKING: {
      label: "Checking...",
      color: "bg-blue-600 text-white animate-pulse",
      icon: <Loader2 size={12} className="animate-spin" />,
    },
  };

  const config = statusConfig[checkStatus] || {
    label: checkStatus,
    color: "bg-slate-600 text-white",
    icon: null,
  };

  const hasDetails = lastCheckedAt || screenshotPath;

  const badge = (
    <Badge className={`${config.color} text-xs font-medium transition-all duration-300`}>
      <span className="flex items-center gap-1 transition-all duration-300">
        {config.icon}
        {config.label}
      </span>
    </Badge>
  );

  if (!hasDetails) {
    return badge;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="cursor-pointer">{badge}</span>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-slate-800 border-slate-700" align="end">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-white mb-2">Check Details</h4>
            {lastCheckedAt && (
              <p className="text-sm text-slate-400">
                Last checked:{" "}
                <span className="text-slate-300">
                  {format(new Date(lastCheckedAt), "MMM d, yyyy h:mm a")}
                </span>
              </p>
            )}
          </div>

          {screenshotPath && (
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <ImageIcon size={14} />
                Screenshot
              </div>
              <img
                src={screenshotPath}
                alt="Review screenshot"
                className="w-full rounded border border-slate-600"
              />
              <a
                href={screenshotPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block"
              >
                View full size →
              </a>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
