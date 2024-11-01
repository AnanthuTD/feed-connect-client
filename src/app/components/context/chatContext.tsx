"use client";
import React, { useEffect, useState } from "react";
import { ReactNode } from "react";
import Popup from "../popup";

// const ChatContext = createContext();

interface WebSocketData {
	data: string;
}

interface chats {
	message: string;
	timestamp: string;
	sender_username: string;
}

export function ChatContextProvider({ children }: { children: ReactNode }) {
	const [chatSocket, setChatSocket] = useState<WebSocket | null>(null);
	const [chats, setChats] = useState<chats[]>([]);
	const [isPopupOpen, setPopupOpen] = useState(false);

	const openPopup = () => {
		setPopupOpen(true);
	};

	const closePopup = () => {
		setPopupOpen(false);
	};

	useEffect(() => {
		const socket = new WebSocket(`ws://localhost:8000/ws/chat/`);

		// Set the WebSocket object to the state
		setChatSocket(socket);

		// Listen for incoming messages from the server
		socket.addEventListener("message", (event: WebSocketData) => {
			const data = JSON.parse(event.data);

			if (data.hasOwnProperty("status")) return;

			const new_message: chats = data.message;
			setChats((prevChats) => [...prevChats, new_message]);
		});

		// Log an error if the WebSocket connection is closed
		socket.addEventListener("close", () => {
			console.error("Chat socket closed unexpectedly");
		});

		return () => {
			// Close the WebSocket connection when the component unmounts
			socket.close();
		};
	}, []);

	useEffect(() => {
		if (chats.length) openPopup();
	}, [chats]);

	return (
		<>
			<Popup isOpen={isPopupOpen} onClose={closePopup}>
				<div className="w-full p-3">
					<span className="text-black">you have new messages</span>
				</div>
				{chats.map((chat) => {
					return (
						<span className="text-black" key={chat.timestamp}>
							{chat.sender_username}
						</span>
					);
				})}
			</Popup>
			{children}
		</>
	);
}
