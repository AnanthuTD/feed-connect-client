"use client";
import React, { useEffect, useRef, useState } from "react";
import SmileIcon from "@/app/components/icons/smileIcon";
import Message from "./message";
import { Chat } from "@/utils/Interfaces";
import axios from "@/lib/axios";
import { message as antdMessage } from "antd";

interface WebSocketData {
	data: string;
}

interface ChatBoxProps {
	recipient: string; // username
}

function ChatBox({ recipient }: ChatBoxProps) {
	const chatLogRef = useRef<HTMLDivElement>(null);
	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	const [chatSocket, setChatSocket] = useState<WebSocket | null>(null);
	const [chats, setChats] = useState<Chat[]>([]);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const socket = new WebSocket(`ws://localhost:8000/ws/chat/${recipient}/`);

		setChatSocket(socket);

		socket.addEventListener("message", (event: WebSocketData) => {
			const data = JSON.parse(event.data);
			if (data.hasOwnProperty("status")) return;

			const newMessage: Chat = data.message;
			setChats((prevChats) => [...prevChats, newMessage]);

			if (chatLogRef.current) {
				chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
			}
		});

		socket.addEventListener("close", () => {
			console.error("Chat socket closed unexpectedly");
		});

		return () => {
			socket.close();
		};
	}, [recipient]);

	useEffect(() => {
		const fetchMessages = async () => {
			try {
				if (!recipient) return;

				const { data }: { data: { message_list: [] } } = await axios.get(
					`/api/chat/${recipient}/load_messages/`
				);
				setChats(data.message_list);
				console.log("================message_list====================");
				console.log(data.message_list);
				console.log("====================================");
			} catch (error) {
				console.error("Error during Axios request:", error);
				antdMessage.warning("Unable to load messages!");
			}
		};

		fetchMessages();
	}, [recipient]);

	const handleSendMessage = () => {
		if (chatSocket && chatSocket.readyState === WebSocket.OPEN && message) {
			chatSocket.send(JSON.stringify({ message }));
			setMessage("");
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter") {
			handleSendMessage();
		}
	};

	useEffect(() => {
		if (chatLogRef.current) {
			chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
		}
	}, [chats]);

	useEffect(() => {
		if (textAreaRef && textAreaRef.current) {
			const lineHeight = parseFloat(
				getComputedStyle(textAreaRef.current).lineHeight
			);
			textAreaRef.current.style.maxHeight = lineHeight * 4 + "px";
			const scrollHeight = textAreaRef.current.scrollHeight;
			if (lineHeight * 4 >= scrollHeight) {
				textAreaRef.current.style.height = scrollHeight + "px";
			} else {
				textAreaRef.current.style.overflowY = "scroll";
			}
		}
	}, [message]);

	const shouldDisplayDate = (currentTimestamp: Date, nextTimestamp: Date) => {
		return nextTimestamp.getDate() !== currentTimestamp.getDate();
	};

	const formatTimestamp = (timestamp: Date | string) => {
		const options: Intl.DateTimeFormatOptions = {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "numeric",
			minute: "numeric",
		};

		return new Date(timestamp).toLocaleString("en-IN", options);
	};

	const shouldDisplayTime = (
		currentTimestamp: Date,
		nextTimestamp: Date,
		index: number
	) => {
		const currentTimestampString = formatTimestamp(currentTimestamp);

		const nextTimestampString = formatTimestamp(nextTimestamp);

		return (
			currentTimestampString !== nextTimestampString ||
			index === chats.length - 1
		);
	};

	const shouldRoundTopNone = (
		prevChat: Chat,
		currentChat: Chat,
		nextChat: Chat
	) => {
		let prevTimestamp = prevChat?.timestamp || undefined;
		let currentTimestamp = currentChat.timestamp;
		let nextTimestamp = nextChat?.timestamp || undefined;

		let prevMessageSenderUsername = prevChat?.sender_username || undefined;
		let currentMessageSenderUsername = currentChat.sender_username;
		let nextMessageSenderUsername = nextChat?.sender_username || undefined;

		const prevTimestampString = formatTimestamp(prevTimestamp);

		const nextTimestampString = formatTimestamp(nextTimestamp);

		const currentTimestampString = formatTimestamp(currentTimestamp);

		let returnArray = [false, false];

		returnArray[0] =
			prevMessageSenderUsername === currentMessageSenderUsername &&
			prevTimestampString === currentTimestampString;

		returnArray[1] =
			nextMessageSenderUsername === currentMessageSenderUsername &&
			nextTimestampString === currentTimestampString;

		return returnArray;
	};

	return (
		<div className="flex h-full w-full flex-col justify-between">
			<div className="h-full overflow-y-auto" ref={chatLogRef}>
				{chats.map((chat, index) => {
					const currentTimeStamp = new Date(chat.timestamp);

					let prevMessage: Chat;
					let nextMessage: Chat;

					if (index > 0) {
						prevMessage = chats[index - 1];
					} else {
						prevMessage = chat;
					}

					if (index === chats.length - 1) {
						nextMessage = chat;
					} else {
						nextMessage = chats[index + 1];
					}

					const prevTimestamp = new Date(prevMessage.timestamp);
					const nextTimestamp = new Date(nextMessage.timestamp);

					const displayDate = shouldDisplayDate(
						currentTimeStamp,
						nextTimestamp
					);
					const displayTime = shouldDisplayTime(
						currentTimeStamp,
						nextTimestamp,
						index
					);
					const endNoneRounded = shouldRoundTopNone(
						chats[index - 1],
						chat,
						chats[index + 1]
					);

					return (
						<React.Fragment key={chat.id}>
							{displayDate && (
								<div className="m-3 flex w-full justify-center">
									<span className="text-secondaryText text-xs">
										{currentTimeStamp.toLocaleString("en-IN", {
											day: "numeric",
											month: "short",
											year: "numeric",
											hour: "numeric",
											minute: "numeric",
											hour12: true,
										})}
									</span>
								</div>
							)}
							<Message
								chat={chat}
								position={
									chat.sender_username === recipient ? "left" : "right"
								}
								key={chat.id}
								displayTime={displayTime}
								endNoneRounded={endNoneRounded}
							/>
						</React.Fragment>
					);
				})}
			</div>

			<div>
				<div className="m-3 flex items-center justify-between gap-3 rounded-full p-3 outline outline-1 outline-border_grey">
					<div className="flex w-full items-center gap-3">
						<SmileIcon fill="white" width={25} height={25} />
						<textarea
							id="chat-message-input"
							className="w-full resize-none bg-transparent text-sm text-primaryText outline-none"
							onKeyDown={handleKeyDown}
							onChange={(e) => setMessage(e.target.value)}
							value={message}
							placeholder="Message"
							rows={1}
							ref={textAreaRef}
							style={{ overflowY: "hidden" }}
						/>
					</div>
					{message && (
						<button
							id="chat-message-submit"
							onClick={handleSendMessage}
							className="text-sm font-bold text-blue-500"
						>
							Send
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

export default ChatBox;
