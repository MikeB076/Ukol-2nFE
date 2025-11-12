import { useEffect, useState } from "react";
import { usePersistentState } from "./usePersistentState";
import { DEFAULT_DATA } from "./data";
import ListsPage from "./routes/ListsPage";
import ListDetailPage from "./routes/ListDetailPage.jsx";
import "./App.css";

const STORAGE_KEY = "shopping-app@v1";

export default function App() {
  // --- Perzistentní shared state pro celou aplikaci (localStorage)
  const [state, setState] = usePersistentState(STORAGE_KEY, DEFAULT_DATA);

  // --- Jednoduchý router bez knihoven – reaguje na změny URL
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    window.addEventListener("nav", onPop); // vlastní event po pushState
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("nav", onPop);
    };
  }, []);

  // /lists/:id  -> id je v 1. zachycené skupině
  const match = /^\/lists\/([^/]+)$/.exec(path);

  if (match) {
    const id = decodeURIComponent(match[1]);
    return (
      <ListDetailPage
        state={state}
        setState={setState}
        id={id}
        onBack={() => navigate("/lists")}
      />
    );
  }

  // fallback / přehled
  return (
    <ListsPage
      state={state}
      setState={setState}
      onOpen={(id) => navigate(`/lists/${id}`)}
    />
  );
}

function navigate(to) {
  if (to === window.location.pathname) return; // zbytečné přesměrování
  window.history.pushState({}, "", to);
  // vyvoláme vlastní event, aby App přerenderoval podle nové URL
  window.dispatchEvent(new Event("nav"));
}
