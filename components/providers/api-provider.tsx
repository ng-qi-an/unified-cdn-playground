'use client';
import { UnifiedCDNClient } from "unified-cdn-api/client";
import { createContext, useContext, useEffect, useState } from "react";

export type APIContextType = {
    apiUrl: string | undefined;
    setApiUrl: (url: string) => void;
    apiKey: string | undefined;
    setApiKey: (key: string) => void;
    ucdnClient: UnifiedCDNClient | null;
    setUcdnClient: (client: UnifiedCDNClient | null) => void;
}

const APIContext = createContext<APIContextType>({
    apiUrl: undefined,
    setApiUrl: (url: string) => {},
    apiKey: undefined,
    setApiKey: (key: string) => {},
    ucdnClient: null,
    setUcdnClient: (client: UnifiedCDNClient | null) => {}

})

export const useAPIContext = ()=> useContext(APIContext);

export function APIProvider({children}: {children: React.ReactNode}){
    const [apiUrl, setApiUrl] = useState<string | undefined>();
    const [apiKey, setApiKey] = useState<string | undefined>();
    const [ucdnClient, setUcdnClient] = useState<UnifiedCDNClient | null>(null);
    useEffect(()=>{
        setUcdnClient(new UnifiedCDNClient({apiUrl: apiUrl || undefined}));
    }, [apiUrl, apiKey])
    useEffect(()=>{
        console.log("API provider mounted, setting up ucdn client.")
        setUcdnClient(new UnifiedCDNClient({apiUrl: apiUrl || undefined}));
    }, [])
    return <APIContext.Provider value={{apiUrl, setApiUrl, apiKey, setApiKey, ucdnClient, setUcdnClient}}>
        {children}
    </APIContext.Provider>
}