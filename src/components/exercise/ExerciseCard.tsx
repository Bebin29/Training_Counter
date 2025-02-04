import { ProgressBar as BootstrapProgressBar } from "react-bootstrap";

interface ProgressBarProps {
  value: number;
  max: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning";
}

export function ProgressBar({
  value,
  max,
  showLabel = true,
  size = "md",
  variant = "default",
}: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100);

  const sizeClass = size === "sm" ? "progress-sm" : size === "lg" ? "progress-lg" : "";

  const variantClass = variant === "success" ? "bg-success" : variant === "warning" ? "bg-warning" : "bg-primary";

  return (
    <div className="mb-3">
      {showLabel && (
        <div className="d-flex justify-content-between small mb-1">
          <span className="text-muted">Progress</span>
          <span className="fw-medium">{percentage}%</span>
        </div>
      )}
      <BootstrapProgressBar
        now={percentage}
        max={100}
        className={`${sizeClass} ${variantClass}`}
      />
      {showLabel && (
        <div className="d-flex justify-content-between small mt-1">
          <span className="fw-medium">{value}</span>
          <span className="text-muted">/ {max}</span>
        </div>
      )}
    </div>
  );
}
