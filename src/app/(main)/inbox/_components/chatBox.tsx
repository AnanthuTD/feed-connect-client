"use client";
import React, { useEffect, useRef, useState } from "react";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { message as antdMessage, Button, Input } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import Message from "./message";
import { Chat } from "@/utils/Interfaces";
import { FETCH_MESSAGES, SEND_MESSAGE, SUBSCRIBE_MESSAGE } from "@/graphql/queries";

interface ChatBoxProps {
	recipient: string; // username
}

function ChatBox({ recipient }: ChatBoxProps) {
	const [message, setMessage] = useState("");
	const [skip, setSkip] = useState(0);
	const [take] = useState(20); // Fetch 20 messages at a time
	const [hasMore, setHasMore] = useState(true);
	const chatLogRef = useRef<HTMLDivElement>(null);
	const sentinelRef = useRef(null);

	// Fetch messages with pagination
	const { data, loading, error, fetchMore } = useQuery(FETCH_MESSAGES, {
		variables: { receiverId: recipient, take, skip },
		notifyOnNetworkStatusChange: true,
	});

	const [chats, setChats] = useState<Chat[]>([]);

	useEffect(() => {
		if (data?.getMessages) {
			const { messages, hasMore } = data.getMessages;

			setChats((prev) => [...messages, ...prev]);
			setHasMore(hasMore);
		} else {
			setHasMore(false);
		}
	}, [data?.getMessages]);

	useSubscription(SUBSCRIBE_MESSAGE, {
		onData: ({ data }) => {
			const newMessage = data.data.MessageSubscription;
			if (newMessage) {
				setChats((prev) => [...prev, newMessage]);
			}
		},
		onError: (error) => console.error("Subscription error:", error),
	});

	useEffect(() => {
		console.log(chats);
	}, [chats]);

	const [sendMessage] = useMutation(SEND_MESSAGE, {
		onCompleted: () => {
			setMessage("");
		},
		onError: (err) => {
			antdMessage.error("Failed to send message!");
		},
	});

	// IntersectionObserver to detect when sentinel is in view
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !loading) {
					// Load more messages
					setSkip((prevSkip) => prevSkip + take);
					fetchMore({ variables: { skip: skip + take } });
				}
			},
			{
				root: null, // Observe relative to the viewport
				rootMargin: "0px",
				threshold: 0.1, // Trigger when 10% of the sentinel is visible
			}
		);

		if (sentinelRef.current) {
			observer.observe(sentinelRef.current);
		}

		return () => {
			if (sentinelRef.current) {
				observer.unobserve(sentinelRef.current);
			}
		};
	}, [hasMore, loading, skip, take, fetchMore]);

	const handleSendMessage = () => {
		if (message) {
			sendMessage({
				variables: { receiverId: recipient, content: message },
			});
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleSendMessage();
		}
	};

	// Handle scroll event
	useEffect(() => {
		if (chatLogRef.current) {
			chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
		}
	}, [chats]);

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
		let prevTimestamp = prevChat?.createdAt || undefined;
		let currentTimestamp = currentChat?.createdAt;
		let nextTimestamp = nextChat?.createdAt || undefined;

		let prevMessageSenderUsername = prevChat?.senderId || undefined;
		let currentMessageSenderUsername = currentChat.senderId;
		let nextMessageSenderUsername = nextChat?.senderId || undefined;

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
				<div style={{ height: "100%" }}>
					<div ref={sentinelRef} style={{ height: "20px" }}></div>
					{loading ? (
						<p>Loading messages...</p>
					) : (
						chats?.map((chat: Chat, index: number) => {
							const currentTimeStamp = new Date(chat?.createdAt);

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

							const prevTimestamp = new Date(prevMessage?.createdAt);
							const nextTimestamp = new Date(nextMessage?.createdAt);

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
										position={chat.senderId === recipient ? "left" : "right"}
										key={chat.id}
										displayTime={displayTime}
										endNoneRounded={endNoneRounded}
									/>
								</React.Fragment>
							);
						})
					)}
				</div>
			</div>

			<div className="m-3 flex items-center justify-between gap-3 rounded-full p-3 outline outline-1 outline-border_grey">
				<div className="flex w-full items-center gap-3">
					<SmileOutlined style={{ fontSize: 25, color: "white" }} />
					<Input.TextArea
						className="w-full resize-none bg-transparent text-sm text-primaryText outline-none"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Message"
						rows={1}
						style={{ overflowY: "hidden" }}
					/>
				</div>
				{message && (
					<Button
						type="link"
						onClick={handleSendMessage}
						className="text-sm font-bold text-blue-500"
					>
						Send
					</Button>
				)}
			</div>
		</div>
	);
}

export default ChatBox;
