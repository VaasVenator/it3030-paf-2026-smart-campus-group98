import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

export function useApi(path, initialValue = []) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        const result = await apiGet(path, user);
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
  }, [path, user]);

  return { data, loading, error };
}
