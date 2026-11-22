import { useAPIContext } from "@/components/providers/api-provider";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/toast";
import { Globe, RotateCcw } from "lucide-react";
import { useState } from "react";
import { UnifiedCDN } from "unified-cdn-api";
import { UnifiedCDNClient } from "unified-cdn-api/client";
import { APIError } from "unified-cdn-api/errors";

export default function APIServerSwitcher(){
    const api = useAPIContext();
    const [apiUrl, setApiUrl] = useState(api.apiUrl);
    const [apiKey, setApiKey] = useState(api.apiKey);
    const [checking, setChecking] = useState(false);
    return <Popover>
        <PopoverTrigger render={
            <button className={`w-9 sm:w-max sm:px-4 py-2 rounded-full text-sm cursor-pointer relative text-muted-foreground hover:bg-accent/50 aria-expanded:bg-accent aria-expanded:text-foreground active:text-foreground active:bg-accent flex items-center justify-center gap-2 h-9`} title="Change the server Playground connects to">
                <Globe className="size-4"/>
                <span className="hidden sm:block">{(api.apiUrl && api.apiKey) ? "Custom server" : "Demo server"}</span>
            </button>
        }/>
        <PopoverContent align="start" className="w-xs" sideOffset={8}>
            <div className='flex gap-2 justify-between'>
            <PopoverHeader>
                <PopoverTitle>API Server</PopoverTitle>
                <PopoverDescription>Change where Playground sends requests to</PopoverDescription>
            </PopoverHeader>
            <Button size="icon-sm" variant="ghost" title="Reset to default" type="button" disabled={!apiUrl && !apiKey} onClick={()=>{
                setApiUrl("");
                setApiKey("");
                api.setApiUrl("");
                api.setApiKey("");
            }}>
                <RotateCcw/>
            </Button>
            </div>
            <form className="contents" onSubmit={async (e)=>{
                e.preventDefault();
                if (!apiUrl || !apiKey) return;
                if (checking) return;
                setChecking(true);
                try {
                    const testUcdn = new UnifiedCDN({apiKey, apiUrl})
                    await testUcdn.getAllFiles();
                    api.setApiUrl(apiUrl);
                    api.setApiKey(apiKey);
                    toast.add({
                        title: "API server updated",
                        description: `Playground is now using ${apiUrl} with the provided API key.`,
                        type: "success",
                    })
                } catch (error) {
                    if (error instanceof APIError){
                        toast.add({
                            title: "Check Error",
                            description: `${error.name}: ${error.message}`,
                            type: "error",
                        })
                    } else {
                        console.error("Error checking API server:", error);
                        toast.add({
                            title: "Check Error",
                            description: `An error occurred${error instanceof Error ? ": " + error.message : " while checking the API server."} `,
                            type: "error",
                        });
                    }
                } finally {
                    setChecking(false);
                }
            }}>
                <Field>
                    <FieldLabel>
                        API Server URL
                    </FieldLabel>
                    <Input required type="url" value={apiUrl} placeholder="https://demo.unified-cdn.ngqian.com" onChange={(e)=>{
                        setApiUrl(e.target.value);
                    }}/>
                    <FieldDescription>
                        Where your Unified CDN is hosted.
                    </FieldDescription>
                </Field>
                <Field>
                    <FieldLabel>
                        API Key
                    </FieldLabel>
                    <Input required type="text" value={apiKey} onChange={(e)=>{
                        setApiKey(e.target.value);
                    }}/>
                    <FieldDescription>
                        Key from an application.
                    </FieldDescription>
                </Field>
                <Button type="submit" disabled={checking}>Save</Button>
            </form>
        </PopoverContent>
    </Popover>
}