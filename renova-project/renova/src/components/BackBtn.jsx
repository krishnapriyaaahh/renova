export default function BackBtn({ goBack, canGoBack, style = {} }) {
  if (!canGoBack) return null;
  return (
    <button className="btn-back" style={{ borderRadius: 3, ...style }} onClick={goBack}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M8 2L3 6.5L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}
