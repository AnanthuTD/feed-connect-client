"use client";
import React, { useRef } from "react";
import { SmileOutlined } from "@ant-design/icons";
import { Input, Button } from "antd";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChatLogic } from "../hooks/useChatLogic";

interface ChatBoxProps {
	recipient: string; // username
}

function ChatBox({ recipient }: ChatBoxProps) {
	const chatLogRef = useRef<HTMLDivElement>(null);
	const {
		chats,
		loading,
		hasMore,
		handleFetchMore,
		handleSendMessage,
		setMessage,
		message,
	} = useChatLogic(recipient, chatLogRef);

	return (
		<div className="flex h-full w-full flex-col justify-between">
			<div className="h-full overflow-y-auto" ref={chatLogRef}>
				<MessageList
					chats={chats}
					loading={loading}
					hasMore={hasMore}
					onFetchMore={handleFetchMore}
					recipient={recipient}
				/>
			</div>
			<MessageInput
				message={message}
				setMessage={setMessage}
				handleSendMessage={handleSendMessage}
				icon={<SmileOutlined style={{ fontSize: 25, color: "white" }} />}
			/>
		</div>
	);
}

export default ChatBox;
