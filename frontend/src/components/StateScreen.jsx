export function Loader() {
  return <div className="state-screen" role="status" aria-label="Loading"><span className="loader-mark">M<i>.</i></span></div>;
}
export function ErrorScreen({ message, onRetry }) {
  return (
    <div className="state-screen">
      <div>
        <p className="state-title">The site could not load</p>
        <p className="muted">{message}</p>
        {onRetry && <button type="button" className="btn primary" onClick={onRetry}>Try again</button>}
      </div>
    </div>
  );
}
