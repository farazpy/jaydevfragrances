sed -i '86,88c\
  useEffect(() => {\
    window.scrollTo({ top: 0, behavior: "smooth" });\
    \
    // Track Page View\
    fetch("/api/track", {\
      method: "POST",\
      headers: { "Content-Type": "application/json" },\
      body: JSON.stringify({ type: "view" })\
    }).catch(e => console.error("Tracking error:", e));\
  }, [currentPage, currentSlug]);\
\
  useEffect(() => {\
    // Track Session on App Load\
    fetch("/api/track", {\
      method: "POST",\
      headers: { "Content-Type": "application/json" },\
      body: JSON.stringify({ type: "session" })\
    }).catch(e => console.error("Session tracking error:", e));\
  }, []);\
' src/App.tsx
