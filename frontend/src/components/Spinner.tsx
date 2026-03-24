type SpinnerProps = {
  label?: string;
};

export function Spinner({ label = "Loading..." }: SpinnerProps) {
  return (
    <div className="spinner" aria-live="polite">
      <span className="spinner__dot" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}