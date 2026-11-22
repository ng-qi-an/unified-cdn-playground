'use client';
import { APIContextType } from "@/components/providers/api-provider";
import { toast } from "@/components/ui/toast";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { useTheme } from "next-themes";
import { APIError } from "unified-cdn-api/errors";

export default function Editor({api}: {api: APIContextType}){
    const ucdnClient = api.ucdnClient; // You should typically be importing ucdnClient directly from a ucdnClient.ts file, but since this playground allows u to change api key and url, we stored the client in React Context instead of a file.
    const { resolvedTheme } = useTheme();
    const editor = useCreateBlockNote({
        uploadFile: async (file: File)=>{
            if (!ucdnClient) {
                toast.add({
                    title: "Upload failed",
                    description: "No API client available.",
                    type: "error",
                })
                throw new Error("No API client available.");
            }
            try {
                const { uploads, failed } = await ucdnClient.uploadFiles([file]);
                if (failed.length > 0) {
                    toast.add({
                        title: "Upload failed",
                        description: `Failed to upload ${failed.length} files.`,
                        type: "error",
                    })
                    throw new Error(`Failed to upload ${failed.length} files.`);
                }
                return uploads[0].viewUrl;
            } catch (error) {
                if (error instanceof APIError){
                    toast.add({
                        title: "Upload failed",
                        description: `${error.name}: ${error.message}`,
                        type: "error",
                    })
                } else if (error instanceof Error){
                    console.error("Error uploading file:", error);
                    toast.add({
                        title: "Upload failed",
                        description: "An error occurred while uploading the file.",
                        type: "error",
                    });
                }
                throw error;
            }
        }
    });
    return <BlockNoteView
        editor={editor}
        theme={resolvedTheme == "dark" ? "dark" : "light"}
    />
}