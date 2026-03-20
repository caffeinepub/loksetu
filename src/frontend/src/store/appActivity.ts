// Simple localStorage-backed store for user activity (reports & posts)
// Used by ProfileTab to display all user-created content with media

export interface MyReport {
  id: string;
  title: string;
  category: string;
  city: string;
  description: string;
  mediaUrl?: string;
  mediaType?: "photo" | "video";
  timestamp: number;
}

export interface MyPost {
  id: string;
  text: string;
  community: string;
  city: string;
  mediaUrl?: string;
  mediaType?: "photo" | "video";
  timestamp: number;
}

const REPORTS_KEY = "loksetu_my_reports";
const POSTS_KEY = "loksetu_my_posts";

export function getReports(): MyReport[] {
  try {
    return JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getPosts(): MyPost[] {
  try {
    return JSON.parse(localStorage.getItem(POSTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addReport(r: MyReport): void {
  const all = getReports();
  // Deduplicate by id
  const deduped = all.filter((x) => x.id !== r.id);
  deduped.unshift(r);
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(deduped.slice(0, 200)));
    window.dispatchEvent(new Event("loksetu:activity"));
  } catch {
    // ignore storage errors
  }
}

export function addPost(p: MyPost): void {
  const all = getPosts();
  const deduped = all.filter((x) => x.id !== p.id);
  deduped.unshift(p);
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(deduped.slice(0, 200)));
    window.dispatchEvent(new Event("loksetu:activity"));
  } catch {
    // ignore storage errors
  }
}

export function deleteReport(id: string): void {
  try {
    const all = getReports().filter((r) => r.id !== id);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function deletePost(id: string): void {
  try {
    const all = getPosts().filter((p) => p.id !== id);
    localStorage.setItem(POSTS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}
