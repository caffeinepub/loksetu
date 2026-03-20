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
export interface News {
    headline: string;
    timestamp: bigint;
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
export interface UserStats {
    unlockedCertificate: boolean;
    reportsCount: bigint;
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
    createIssue(title: string, description: string, category: IssueCategory, gpsLocation: string, photoBlobId: string | null, isVigilance: boolean): Promise<bigint>;
    getCallerUserRole(): Promise<UserRole>;
    getMarketRates(): Promise<MarketRates>;
    getNews(): Promise<Array<News>>;
    getPublicIssues(): Promise<Array<Issue>>;
    getUserStats(): Promise<UserStats>;
    isCallerAdmin(): Promise<boolean>;
    setMarketRates(petrol: string, diesel: string, cng: string, lpg: string, onion: string, tomato: string, potato: string): Promise<void>;
    upvoteIssue(issueId: bigint): Promise<void>;
    verifyImage(_blobId: string): Promise<boolean>;
}
