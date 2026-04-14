import { format, formatDistanceToNow, isPast } from "date-fns";

export const formatDate = (date) => format(new Date(date), "MMM d, yyyy");

export const formatDateTime = (date) => format(new Date(date), "MMM d, yyyy 'at' h:mm a");

export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const isOverdue = (date) => isPast(new Date(date));

export const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
};

export const isYouTubeUrl = (url) => {
  return url?.includes("youtube.com") || url?.includes("youtu.be");
};

export const getApiBaseUrl = () => import.meta.env.VITE_API_URL || "http://localhost:5050";

export const buildFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${getApiBaseUrl()}${path}`;
};

export const getInitials = (name) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

export const truncate = (str, len = 80) =>
  str?.length > len ? str.slice(0, len) + "…" : str;
