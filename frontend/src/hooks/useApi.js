import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export function useApi(path, initialValue = []) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        const result = await apiGet(path);
        if (!ignore) {
          setData(result);
          setError("");
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [path]);

  return { data, loading, error };
}
