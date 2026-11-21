import { Attachment, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle } from "@/components/ui/attachment";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";
import { ChatStatus, UIMessage } from "ai";
import { FileIcon, Lightbulb } from "lucide-react";
import { Streamdown } from 'streamdown';
import { convertMimeToReadable } from "unified-cdn-api/helpers";

import "streamdown/styles.css";
export default function ChatMessage({ message, status, mostRecentMessage }: { message: UIMessage, status: ChatStatus, mostRecentMessage?: boolean }) {
    return <Message align={message.role == "user" ? "end" : "start"}>
        <MessageContent>
            {message.parts.filter((part)=> part.type == "file").length > 0 && <div className="ml-auto overflow-auto flex gap-2 scroll-fade-x no-scrollbar w-max">
                {message.parts.filter((part)=> part.type == "file").map((part, index)=>{
                    return <Attachment state={"done"} key={message.id+"files"+index} orientation={"vertical"}>
                        <AttachmentMedia variant={part.mediaType.startsWith("image/") ? "image" : "icon"}>
                            {part.mediaType.startsWith("image/") ? <img src={part.url} /> : <FileIcon/>}
                        </AttachmentMedia>
                        <AttachmentContent>
                            <AttachmentTitle className="ellipsis max-w-[200px]" title={part.filename}>{part.filename}</AttachmentTitle>
                            <AttachmentDescription>{convertMimeToReadable(part.mediaType)}</AttachmentDescription>
                        </AttachmentContent>
                    </Attachment>
                })}
            </div>}
            <Bubble variant={message.role == "user" ? "muted" : "ghost"} >
                <BubbleContent>
                    {message.role == "assistant" ? <>
                        {message.parts.filter((part)=> part.type == "reasoning").length > 0 && <Trace className="mb-2">
                            {message.parts.filter((part)=> part.type == "reasoning").map((part)=>{
                                return <TraceCollapsible>
                                    <TraceCollapsibleTrigger>
                                        <TraceLine status={part.state == "streaming" ? "running" : undefined }>
                                            <TraceIcon>
                                                <Lightbulb />
                                            </TraceIcon>
                                            <TraceTitle>{part.state == "streaming" ? "Reasoning..." : "Thought"}</TraceTitle>
                                        </TraceLine>
                                    </TraceCollapsibleTrigger>
                                    <TraceCollapsibleContent>
                                        <Streamdown animated isAnimating={part.state == "streaming"} key={message.id+"reasoning"} className="prose prose-sm text-muted-foreground">
                                            {part.text}
                                        </Streamdown>
                                    </TraceCollapsibleContent>
                                </TraceCollapsible>
                            })}
                        </Trace>}
                        {message.parts.filter((part) => part.type == "text").map((part, index)=> {
                            return <Streamdown animated isAnimating={status == "streaming" && mostRecentMessage} key={message.id+index} className="prose dark:prose-invert text-foreground">
                                {part.text}
                            </Streamdown>
                        })}
                    </>
                    : message.role == "user" &&
                        message.parts.filter((part)=> part.type == "text").map((part)=> part.text).join("\n")
                    }
                </BubbleContent>
            </Bubble>
        </MessageContent>
    </Message>

}