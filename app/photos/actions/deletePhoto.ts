'use server';
import { UnifiedCDN } from "unified-cdn-api";

export async function deletePhoto({apiUrl, apiKey, fileId}: {apiUrl?: string, apiKey?: string, fileId: string}) {
    const ucdn = new UnifiedCDN({apiUrl, apiKey});
    await ucdn.deleteFile(fileId);
    return true;
}