import { type ReactNode, createContext, useContext, useState } from "react";
import type { CommunityPost, Issue } from "../hooks/useQueries";

interface AppStore {
  myReports: Issue[];
  myPosts: CommunityPost[];
  addReport: (issue: Issue) => void;
  deleteReport: (id: bigint) => void;
  editReport: (id: bigint, newTitle: string, newDesc: string) => void;
  addPost: (post: CommunityPost) => void;
  deletePost: (id: bigint) => void;
  editPost: (id: bigint, newContent: string) => void;
}

const REPORTS_KEY = "loksetu_myReports";
const POSTS_KEY = "loksetu_myPosts";

function serializeIssue(issue: Issue): any {
  return {
    ...issue,
    id: issue.id.toString(),
    timestamp: issue.timestamp.toString(),
    reporter: issue.reporter ? issue.reporter.toString() : "guest",
    upvotes: issue.upvotes !== undefined ? issue.upvotes.toString() : "0",
    localMediaUrl: (issue as any).localMediaUrl,
    localMediaIsVideo: (issue as any).localMediaIsVideo,
  };
}

function deserializeIssue(obj: any): Issue {
  return {
    ...obj,
    id: BigInt(obj.id),
    timestamp: BigInt(obj.timestamp),
    reporter: obj.reporter as any,
    upvotes: obj.upvotes !== undefined ? BigInt(obj.upvotes) : BigInt(0),
  } as Issue;
}

function serializePost(post: CommunityPost): any {
  return {
    ...post,
    id: post.id.toString(),
    timestamp: post.timestamp.toString(),
    likeCount: post.likeCount !== undefined ? post.likeCount.toString() : "0",
    author: post.author ? post.author.toString() : "guest",
    localMediaUrl: (post as any).localMediaUrl,
    localMediaIsVideo: (post as any).localMediaIsVideo,
  };
}

function deserializePost(obj: any): CommunityPost {
  return {
    ...obj,
    id: BigInt(obj.id),
    timestamp: BigInt(obj.timestamp),
    likeCount: obj.likeCount !== undefined ? BigInt(obj.likeCount) : BigInt(0),
    author: obj.author as any,
  } as CommunityPost;
}

function loadFromStorage<T>(key: string, deserialize: (o: any) => T): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(deserialize);
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, items: T[], serialize: (o: T) => any) {
  try {
    localStorage.setItem(key, JSON.stringify(items.map(serialize)));
  } catch {
    // ignore storage errors
  }
}

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [myReports, setMyReports] = useState<Issue[]>(() =>
    loadFromStorage(REPORTS_KEY, deserializeIssue),
  );
  const [myPosts, setMyPosts] = useState<CommunityPost[]>(() =>
    loadFromStorage(POSTS_KEY, deserializePost),
  );

  const addReport = (issue: Issue) =>
    setMyReports((prev) => {
      const next = [issue, ...prev];
      saveToStorage(REPORTS_KEY, next, serializeIssue);
      return next;
    });

  const deleteReport = (id: bigint) =>
    setMyReports((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveToStorage(REPORTS_KEY, next, serializeIssue);
      return next;
    });

  const editReport = (id: bigint, newTitle: string, newDesc: string) =>
    setMyReports((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, title: newTitle, description: newDesc } : r,
      );
      saveToStorage(REPORTS_KEY, next, serializeIssue);
      return next;
    });

  const addPost = (post: CommunityPost) =>
    setMyPosts((prev) => {
      const next = [post, ...prev];
      saveToStorage(POSTS_KEY, next, serializePost);
      return next;
    });

  const deletePost = (id: bigint) =>
    setMyPosts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveToStorage(POSTS_KEY, next, serializePost);
      return next;
    });

  const editPost = (id: bigint, newContent: string) =>
    setMyPosts((prev) => {
      const next = prev.map((p) =>
        p.id === id ? { ...p, content: newContent } : p,
      );
      saveToStorage(POSTS_KEY, next, serializePost);
      return next;
    });

  return (
    <AppStoreContext.Provider
      value={{
        myReports,
        myPosts,
        addReport,
        deleteReport,
        editReport,
        addPost,
        deletePost,
        editPost,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be inside AppStoreProvider");
  return ctx;
}
