'use server';

import { UnifiedCDN } from "unified-cdn-api";

export async function getPhotos({apiUrl, apiKey}: {apiUrl?: string, apiKey?: string}) {
    const ucdn = new UnifiedCDN({apiUrl, apiKey});
    const photos = await ucdn.getAllFiles();
    console.log("Photos", photos);
    return photos.map((file)=> file.toJSON()).filter((file)=> file.contentType.startsWith("image/")).sort((a, b)=>  b.updatedAt.getTime() - a.updatedAt.getTime());
}