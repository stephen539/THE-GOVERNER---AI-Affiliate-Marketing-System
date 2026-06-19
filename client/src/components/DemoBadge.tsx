import type { ReactNode } from "react";

export function DemoBanner({ children }: { children: ReactNode }) {
  return (
    <div className="demo-banner" role="status">
      <strong>Demo - Not Connected</strong>
      <span>{children}</span>
    </div>
  );
}

export function SampleTag({ children = "Sample" }: { children?: ReactNode }) {
  return <span className="sample-tag">{children}</span>;
}
