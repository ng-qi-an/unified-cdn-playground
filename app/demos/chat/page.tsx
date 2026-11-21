'use client';
import { useChat } from "@ai-sdk/react";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { MessageCircleDashed } from "lucide-react";
import ChatInput from "./ChatInput";
import { DefaultChatTransport } from "ai";
import ChatMessage from "./ChatMessage";
import { Spinner } from "@/components/ui/spinner";

export default function ChatPage(){
    const { messages, sendMessage, status, stop } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
        })
    });
    
    return <div className="flex h-screen min-h-0 w-screen flex-col items-center overflow-hidden pt-24 pb-4">
        <div className="flex w-full flex-1 min-h-0 justify-center overflow-hidden">
            {messages.length > 0 ? <MessageScrollerProvider scrollPreviousItemPeek={64} autoScroll>
                    <MessageScroller>
                        <MessageScrollerViewport>
                            <MessageScrollerContent className="mx-auto w-full max-w-[800px]">
                                {messages.map((message) => (
                                    <MessageScrollerItem
                                        key={message.id}
                                        messageId={message.id}
                                        scrollAnchor={message.role === "user"}
                                    >
                                        <ChatMessage message={message} status={status} mostRecentMessage={message.id === messages[messages.length - 1].id}/>
                                    </MessageScrollerItem>
                                ))}
                                {status == "submitted" && <p className="shimmer text-muted-foreground flex items-center gap-2 text-sm"><Spinner/> Pending...</p>}
                            </MessageScrollerContent>
                        </MessageScrollerViewport>
                        <MessageScrollerButton />
                    </MessageScroller>
                </MessageScrollerProvider>
            : <Empty className="h-full">
                <EmptyMedia variant="icon" className="size-14">
                    <MessageCircleDashed className="size-7"/>
                </EmptyMedia>
                <EmptyHeader>
                    <EmptyTitle className="text-4xl font-semibold">Chat</EmptyTitle>
                    <EmptyDescription className="text-base">Upload photos and files with your messages</EmptyDescription>
                </EmptyHeader>
            </Empty>
            }
        </div>
        <ChatInput sendMessage={sendMessage} status={status} stop={stop}/>
    </div>
}