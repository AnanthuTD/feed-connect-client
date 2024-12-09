"use client";
import React, { useEffect, useState } from "react";
import { ReactNode } from "react";
import Popup from "../popup";
import { useChatLogic } from "@/app/(main)/inbox/hooks/useChatLogic";

// const ChatContext = createContext();

interface chats {
	message: string;
	timestamp: string;
	sender_username: string;
}

export function ChatContextProvider({ children }: { children: ReactNode }) {
	const [isPopupOpen, setPopupOpen] = useState(false);
	const {
		chats,
	} = useChatLogic(null, null);

	const openPopup = () => {
		setPopupOpen(true);
	};

	const closePopup = () => {
		setPopupOpen(false);
	};

	useEffect(() => {
		console.log('newMessage notification!! ===========================')
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
						<span className="text-black" key={chat.id}>
							{chat.senderId}
						</span>
					);
				})}
			</Popup>
			{children}
		</>
	);
}
