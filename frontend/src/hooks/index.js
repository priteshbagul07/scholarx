import { useState, useCallback, useEffect, useRef } from "react";
import api from "../services/api";

export const useToast = () => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  return { toast, showToast, clearToast };
};

export const useFetch = (url, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get(url);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { fetch(); }, [fetch, ...deps]);

  return { data, loading, error, refetch: fetch, setData };
};

export const useConfirm = () => {
  const [confirm, setConfirm] = useState(null);

  const askConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirm({ message, resolve });
    });
  }, []);

  const handleConfirm = () => {
    confirm?.resolve(true);
    setConfirm(null);
  };

  const handleCancel = () => {
    confirm?.resolve(false);
    setConfirm(null);
  };

  return { confirm, askConfirm, handleConfirm, handleCancel };
};
