'use server';
import { UnifiedCDN } from "unified-cdn-api";

export async function renamePhoto({apiUrl, apiKey, fileId, newName}: {apiUrl?: string, apiKey?: string, fileId: string, newName: string}) {
    const ucdn = new UnifiedCDN({apiUrl, apiKey});
    const finalName = await ucdn.renameFile(fileId, newName);
    return finalName;
}