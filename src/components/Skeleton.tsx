interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
}

export function SkeletonLine({ width = '100%', height = '1em', borderRadius = '4px' }: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius }}
    />
  );
}

export function SkeletonBlock({ width = '100%', height = '80px', borderRadius = '8px' }: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius }}
    />
  );
}
