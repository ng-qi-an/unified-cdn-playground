import { NextRequest } from "next/server";
import { toNextHandler } from "unified-cdn-api/handlers/nextjs";
import { UnifiedCDN } from "unified-cdn-api" 
export const POST = async(res: NextRequest, ctx: RouteContext<"/api/unified-cdn/[...all]">)=> { 
    const data = await res.clone().json();
    let apiKey = data.apiKey;
    let apiUrl = data.apiUrl;
    if (!apiKey && !apiUrl) {
        apiKey = process.env.UNIFIED_CDN_API_KEY;
        apiUrl = process.env.UNIFIED_CDN_API;
    } else if (!apiKey || !apiUrl) {
        return new Response("Missing apiKey or apiUrl", { status: 400 });
    }
    const cdn = new UnifiedCDN({ apiKey, apiUrl });
    return toNextHandler(cdn, {
        client: {
            uploads: {
                calculateFileCount: (count)=>{
                    if (count > 10) {
                        throw new Error("You can only upload up to 10 files at a time.");
                    } else {
                        return count;
                    }
                }
            }
        }
    })(res, ctx)
}