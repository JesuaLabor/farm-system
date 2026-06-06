import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a Philippine Peso value */
export function formatPHP(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Format a date string into a readable format */
export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...options,
    });
  } catch {
    return dateStr;
  }
}

/** Format a date string as relative time (e.g. "2 hours ago") */
export function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr, { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

/** Generate a short reference number */
export function generateRef(): string {
  return `REF-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;
}

/** Get price trend direction */
export function getPriceTrend(
  current: number,
  previous?: number
): "up" | "down" | "neutral" {
  if (!previous) return "neutral";
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "neutral";
}

/** Get trend color classes */
export function getTrendColor(trend: "up" | "down" | "neutral"): string {
  if (trend === "up") return "text-green-600";
  if (trend === "down") return "text-red-600";
  return "text-muted-foreground";
}

/** Map application status to a readable label + color */
export function getApplicationStatusMeta(status: string): {
  label: string;
  color: string;
} {
  const map: Record<string, { label: string; color: string }> = {
    submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700" },
    under_review: { label: "Under Review", color: "bg-yellow-100 text-yellow-700" },
    approved: { label: "Approved", color: "bg-green-100 text-green-700" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
    resubmit: { label: "Resubmit Required", color: "bg-orange-100 text-orange-700" },
  };
  return map[status] ?? { label: status, color: "bg-muted text-muted-foreground" };
}

/** Map order status to label + color */
export function getOrderStatusMeta(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
    confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
    ready: { label: "Ready for Pickup", color: "bg-purple-100 text-purple-700" },
    completed: { label: "Completed", color: "bg-green-100 text-green-700" },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
  };
  return map[status] ?? { label: status, color: "bg-muted text-muted-foreground" };
}

/** Map product status to label + color */
export function getProductStatusMeta(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: "Active", color: "bg-green-500 text-white" },
    sold: { label: "Sold Out", color: "bg-gray-500 text-white" },
    expired: { label: "Expired", color: "bg-red-400 text-white" },
    draft: { label: "Draft", color: "bg-yellow-400 text-black" },
  };
  return map[status] ?? { label: status, color: "bg-muted text-muted-foreground" };
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Truncate text */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}
