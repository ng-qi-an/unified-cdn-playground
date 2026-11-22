import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockLine, CodeBlockTitle } from "@/components/ui/code-block";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { useHighlightedCode } from "@/hooks/use-highlighted-code";
import SiGithub from "@icons-pack/react-simple-icons/icons/SiGithub";
import { ExternalLink, FileIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";



const snippets = [
{
    file: "/app/demos/photos/page.tsx",
    pathname: "/demos/photos",
    href: "https://github.com/ng-qi-an/unified-cdn-playground/blob/master/app/demos/photos/page.tsx",
    startLine: 42,
    code: `/* ... */
try {
    const response = await api.ucdnClient.uploadFiles(files);
    setPhotos((prev)=> [...response.uploads, ...prev])
    resolve(response);
} catch (error){
    if (error instanceof APIError){
        reject(\`\${error.name}: \${error.message}\`);
    } else {
        console.error("Error uploading file:", error);
        reject(\`Error uploading file: \${error instanceof Error ? error.message : "Unknown error"}\`);
    }
}
/* ... */`,
    highlighted: [3]
},
{
    file: "/app/demos/editor/Editor.tsx",
    pathname: "/demos/editor",
    href: "https://github.com/ng-qi-an/unified-cdn-playground/blob/master/app/demos/editor/Editor.tsx",
    startLine: 22,
    code: `/* ... */
try {
    const { uploads, failed } = await ucdnClient.uploadFiles([file]);
    if (failed.length > 0) {
        toast.add({
            title: "Upload failed",
            description: \`Failed to upload \${failed.length} files.\`,
            type: "error",
        })
        throw new Error(\`Failed to upload \${failed.length} files.\`);
    }
    return uploads[0].viewUrl;
}
/* ... */`,
    highlighted: [3]
},
{
    file: "/app/demos/chat/ChatInput.tsx",
    pathname: "/demos/chat",
    href: "https://github.com/ng-qi-an/unified-cdn-playground/blob/master/app/demos/chat/ChatInput.tsx",
    startLine: 116,
    code: `/* ... */
setFiles((prev)=> [...prev, ...files.map((file)=> ({status: "loading", id: generateId(), name: file.name, size: file.size, contentType: file.type, viewUrl: ""}))]);
try {
    const {uploads, failed} = await ucdnClient.uploadFiles(files, {apiUrl: api.apiKey, apiKey: api.apiKey});
    if (failed.length > 0){
        toast.add({
            title: "Error uploading files",
            description: \`Failed to upload \${failed.length} files.\`,
            type: "error",
        });
    }
    setFiles((prev)=> prev.map((file)=> {
        if (uploads.some((upload)=> upload.name == file.name)) {
            const upload = uploads.find((upload)=> upload.name == file.name);
            return {...upload!, status: "done"};
        } else if (failed.some((fail)=> fail.filename == file.name)) {
            return  {...file, status: "failed"};
        } else {
            return {...file}
        }
    }));
} catch (error){
    setFiles((prev)=> prev.map((file)=> files.some((x)=> x.name == file.name) ? {...file, status: "failed"} : file));
/* ... */`,
    highlighted: [4]
}
]

export default function SourcePopup(){
    const pathname = usePathname();
    const selectedSnippet = snippets.find((s)=> s.pathname == pathname);
    const lines = useHighlightedCode(selectedSnippet?.code || "", "tsx");
    return <Popover>
        <PopoverTrigger render={
            <button className={`w-9 sm:w-max sm:px-4 py-2 rounded-full text-sm cursor-pointer relative text-muted-foreground hover:bg-accent/50 aria-expanded:bg-accent aria-expanded:text-foreground active:text-foreground active:bg-accent flex items-center justify-center gap-2 h-9`} title="Change the server Playground connects to">
                <SiGithub className="size-4"/>
                <span className="hidden sm:block">Source</span>
            </button>
        }/>
        <PopoverContent align="start" className="w-[90vw] sm:w-xl" sideOffset={8}>
            <div className='flex gap-2 justify-between'>
                <PopoverHeader>
                    <PopoverTitle>Source code</PopoverTitle>
                    <PopoverDescription>Snippets are from this page, using the Unified CDN SDK (Node.js).</PopoverDescription>
                </PopoverHeader>
            </div>
            {selectedSnippet && <CodeBlock size="sm">
                <CodeBlockHeader>
                    <FileIcon className="size-4"/>
                    <CodeBlockTitle>{selectedSnippet.file}</CodeBlockTitle>
                    <CodeBlockActions>
                        <CodeBlockCopyButton value={selectedSnippet.code} />
                        <Link href={selectedSnippet.href+"#L"+ Number(selectedSnippet.startLine + 1)} target="_blank">
                            <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground">
                                <ExternalLink />
                            </Button>
                        </Link>
                    </CodeBlockActions>
                </CodeBlockHeader>
                <CodeBlockContent lineNumbers startLine={selectedSnippet.startLine}>
                    {lines.map((line, index)=>{
                        return <CodeBlockLine key={index} variant={selectedSnippet.highlighted.includes(index + 1) ? "highlighted" : "default"}>
                            {line}
                        </CodeBlockLine>
                    })}
                </CodeBlockContent>
            </CodeBlock>}
        </PopoverContent>
    </Popover>
}