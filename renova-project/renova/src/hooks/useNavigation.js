import { useState, useCallback } from "react";

export function useNavigation(initial = "landing") {
  const [page, setPage] = useState(initial);
  const [history, setHistory] = useState([]);

  const navigate = useCallback((p) => {
    setHistory((h) => [...h, page]);
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const goBack = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setPage(prev);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [history]);

  const resetTo = useCallback((p) => {
    setHistory([]);
    setPage(p);
  }, []);

  return { page, navigate, goBack, resetTo, canGoBack: history.length > 0 };
}
