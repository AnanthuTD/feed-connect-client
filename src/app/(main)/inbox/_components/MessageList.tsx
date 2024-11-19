import React, { useRef, useEffect } from "react";
import { Chat } from "@/utils/Interfaces";
import Message from "./Message";
import {
  shouldDisplayDate,
  shouldDisplayTime,
  shouldRoundTopNone,
} from "../utils/chatUtils";

interface MessageListProps {
  chats: Chat[];
  loading: boolean;
  hasMore: boolean;
  onFetchMore: () => void;
  recipient: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  chats,
  loading,
  hasMore,
  onFetchMore,
  recipient,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const lastScrollHeight = useRef<number>(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onFetchMore();
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [hasMore, loading, onFetchMore]);

  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;

      // Preserve scroll position when new messages are added
      if (lastScrollHeight.current && chats.length > 0) {
        const newScrollHeight = container.scrollHeight;
        const scrollDifference = newScrollHeight - lastScrollHeight.current;
        if (scrollDifference > 0 && container.scrollTop < 50) {
          container.scrollTop += scrollDifference; // Adjust scroll to maintain position
        }
      }

      lastScrollHeight.current = container.scrollHeight;
    }
  }, [chats]);

  return (
    <div
      style={{ height: "100%", overflowY: "auto" }}
      ref={chatContainerRef}
    >
      {chats.length > 0 && <div ref={sentinelRef} style={{ height: "20px" }}></div>}
      {loading && <p>Loading messages...</p>}
      {chats.map((chat, index) => {
        const currentTimestamp = new Date(chat.createdAt);
        const prevChat = index > 0 ? chats[index - 1] : null;
        const nextChat = index < chats.length - 1 ? chats[index + 1] : null;

        const displayDate =
          nextChat &&
          shouldDisplayDate(currentTimestamp, new Date(nextChat.createdAt));
        const displayTime = shouldDisplayTime(
          currentTimestamp,
          nextChat ? new Date(nextChat.createdAt) : currentTimestamp,
          index,
          chats.length
        );
        const endNoneRounded = shouldRoundTopNone(prevChat, chat, nextChat);

        return (
          <React.Fragment key={chat.id}>
            {displayDate && (
              <div className="m-3 flex w-full justify-center">
                <span className="text-secondaryText text-xs">
                  {currentTimestamp.toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
            <Message
              chat={chat}
              position={chat.senderId === recipient ? "left" : "right"}
              displayTime={displayTime}
              endNoneRounded={endNoneRounded}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
};
