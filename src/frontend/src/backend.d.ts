import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserStats {
    unlockedCertificate: boolean;
    reportsCount: bigint;
}
export interface UserProfile {
    alias: string;
    displayName: string;
    anonymousMode: boolean;
}
export interface MarketRates {
    cng: string;
    lpg: string;
    onion: string;
    petrol: string;
    tomato: string;
    diesel: string;
    potato: string;
}
export interface Issue {
    id: bigint;
    upvotes: bigint;
    photoBlob?: ExternalBlob;
    title: string;
    description: string;
    gpsLocation: string;
    timestamp: bigint;
    category: IssueCategory;
    isVigilance: boolean;
    reporter: Principal;
}
export interface CommunityPost {
    id: bigint;
    likeCount: bigint;
    content: string;
    displayName: string;
    city: string;
    author: Principal;
    mediaBlob?: ExternalBlob;
    timestamp: bigint;
}
export interface PrivateMessage {
    id: bigint;
    content: string;
    sender: Principal;
    mediaBlob?: ExternalBlob;
    timestamp: bigint;
    receiver: Principal;
}
export interface News {
    headline: string;
    timestamp: bigint;
}
export interface Status {
    photoBlob?: ExternalBlob;
    content: string;
    displayName: string;
    city: string;
    author: Principal;
    timestamp: bigint;
}
export enum IssueCategory {
    healthcare = "healthcare",
    publicSafety = "publicSafety",
    other = "other",
    corruption = "corruption",
    sanitation = "sanitation",
    infrastructure = "infrastructure"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addNews(headline: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCommunityPost(city: string, content: string, mediaBlobId: string | null): Promise<bigint>;
    createIssue(title: string, description: string, category: IssueCategory, gpsLocation: string, photoBlobId: string | null, isVigilance: boolean): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommunityPostsByCity(city: string): Promise<Array<CommunityPost>>;
    getConversationHistory(withUser: Principal): Promise<Array<PrivateMessage>>;
    getDisplayName(user: Principal): Promise<string>;
    getMarketRates(): Promise<MarketRates>;
    getNews(): Promise<Array<News>>;
    getPublicIssues(): Promise<Array<Issue>>;
    getStatusesByCity(city: string): Promise<Array<Status>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStats(): Promise<UserStats>;
    isCallerAdmin(): Promise<boolean>;
    likeCommunityPost(postId: bigint): Promise<void>;
    listConversations(): Promise<Array<Principal>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendPrivateMessage(receiver: Principal, content: string, mediaBlobId: string | null): Promise<bigint>;
    setDisplayName(displayName: string, anonymousMode: boolean): Promise<void>;
    setMarketRates(petrol: string, diesel: string, cng: string, lpg: string, onion: string, tomato: string, potato: string): Promise<void>;
    setStatus(city: string, content: string, photoBlobId: string | null): Promise<void>;
    upvoteIssue(issueId: bigint): Promise<void>;
    verifyImage(_blobId: string): Promise<boolean>;
}
