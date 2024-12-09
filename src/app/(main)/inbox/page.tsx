"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUserContext } from "@/app/components/context/userContext";
import ArrowLeft from "@/app/components/icons/ArrowLeft";
import { useQuery } from "@apollo/client";
import CreateMessage from "./_components/create";
import DropDown from "./_components/dropdown";
import AccountMessage from "./_components/accountMessage";
import ChatBox from "./_components/chatBox";
import SearchAccounts from "./_components/searchAccounts";
import { GET_CONVERSATIONS, GET_PROFILE_BY_ID } from "@/graphql/queries";
import { useChatLogic } from "./hooks/useChatLogic";
import useConversation from "./hooks/useConversation";
import type { Chat, Conversation } from "@/utils/Interfaces";

type Conversations = Conversation[];

function Messages() {
	const searchParams = useSearchParams();
	const id_user = searchParams.get("id_user");

	// context
	const { user } = useUserContext();

	const [profile, setProfile] = useState<OtherUserProfile | undefined>();
	const [conversations, setConversations] = useState<Conversations | []>([]);
	const [selectedChat, setSelectedChat] = useState("");
	const [isOpenUserSearchBox, setIsOpenUserSearchBox] =
		useState<boolean>(false);

	const conversationsRef = useRef<HTMLDivElement>(null);
	const chatsRef = useRef<HTMLDivElement>(null);
	const boxRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	// Fetch user profile using GraphQL
	const { data: profileData, error: profileError } = useQuery(
		GET_PROFILE_BY_ID,
		{
			variables: { id_user },
			skip: !id_user, // Skip if no user id
		}
	);

	// Fetch conversations using GraphQL
	const { data: conversationsData, error: conversationsError } =
		useQuery(GET_CONVERSATIONS);

	useEffect(() => {
		if (profileData) {
			setProfile(profileData.getProfile);
		}
	}, [profileData]);

	useEffect(() => {
		if (conversationsData) {
			const tempConversations = conversationsData.conversations;
			if (profile) {
				const foundIndex = tempConversations.findIndex(
					(conversation) => conversation.username === profile.username
				);
				if (foundIndex !== -1) {
					const foundConversation = tempConversations.splice(foundIndex, 1)[0];
					setConversations([foundConversation, ...tempConversations]);
				}
			} else {
				setConversations(tempConversations);
			}
			setSelectedChat(profile?.username || tempConversations[0]?.username);
		}
	}, [profile, conversationsData]);

	useEffect(() => {
		function updateContentHeight() {
			if (
				!boxRef.current?.clientHeight ||
				!titleRef.current?.clientHeight ||
				!contentRef.current?.clientHeight
			)
				return;
			contentRef.current.style.height = `${
				boxRef.current.clientHeight - titleRef.current.clientHeight
			}px`;
			observer.observe(boxRef.current);
		}

		if (!boxRef.current?.clientHeight) return;
		const observer = new ResizeObserver((entries) => {
			updateContentHeight();
		});

		observer.observe(boxRef.current);

		window.addEventListener("resize", updateContentHeight);

		// Cleanup function to disconnect the observer
		return () => {
			observer.disconnect();
		};
	}, [contentRef.current]);

	function updateVisibility() {
		if (!chatsRef.current || !conversationsRef.current) return;
		if (getComputedStyle(chatsRef.current).display === "none") {
			chatsRef.current.style.display = "block";
			conversationsRef.current.style.display = "none";
		}
	}

	function handleBack() {
		if (!conversationsRef.current) return;

		if (conversationsRef.current.style.display !== "none") {
			history.back();
		} else if (
			chatsRef.current &&
			getComputedStyle(chatsRef.current).display !== "none"
		) {
			chatsRef.current.style.display = "none";
			conversationsRef.current.style.display = "block";
		}
	}

	useEffect(() => {
		console.log("is open : ", isOpenUserSearchBox);
	}, [isOpenUserSearchBox]);

	const { newChats } = useChatLogic(null, null);

	const { getConversation } = useConversation();

	useEffect(() => {
		alert('new Chat')

		if (newChats.length) {
				handleNewMessage(conversations, newChats[newChats.length - 1], setConversations);
		}
	}, [newChats]);

	// if conversation already exist update the lastMessage, if not the fetch it and add the conversation to the top of the list
	async function handleNewMessage(
		conversations: Conversations,
		newMessage: Chat,
		updateConversations: (updated: Conversations) => void
	) {
		const { conversationId, content } = newMessage;

		console.log(newMessage)

		// Clone conversations to avoid mutating the original state
		const updatedConversations = [...conversations];

		// Find the index of the existing conversation
		const index = updatedConversations.findIndex(
			(conv) => conv.id === conversationId
		);

		if (index !== -1) {
			// Update existing conversation
			updatedConversations[index] = {
				...updatedConversations[index],
				lastMessage: {
					content: content,
				},

			};

			// Move it to the top
			const [updatedConversation] = updatedConversations.splice(index, 1);
			updatedConversations.unshift(updatedConversation);
		} else {
			// Fetch the new conversation details
			const newConvo = await getConversation(conversationId);

			// Add new conversation to the top
			updatedConversations.unshift(newConvo);
		}

		console.log('new Conversations: ', updatedConversations)

		// Update the state
		updateConversations(updatedConversations);
	}

	return (
		<div
			className="relative flex w-full flex-col overflow-hidden rounded bg-black"
			ref={boxRef}
		>
			{/* top */}
			<div className="flex border-b border-border_grey" ref={titleRef}>
				<div className="flex w-1/6 items-center justify-center">
					<ArrowLeft className="lg:hidden" onClick={handleBack} />
				</div>
				<div className="flex w-4/6 justify-center gap-1 p-4 font-bold">
					<span>{user?.username}</span>
					<DropDown className="" stroke="white" />
				</div>
				<div
					className="flex w-1/6 items-center"
					onClick={() => setIsOpenUserSearchBox(true)}
				>
					<CreateMessage stroke="white" className="cursor-pointer" />
				</div>
				{isOpenUserSearchBox && (
					<SearchAccounts
						onCancel={() => {
							setIsOpenUserSearchBox(false);
						}}
					/>
				)}
			</div>
			<div className="flex h-full" ref={contentRef}>
				<div
					className="w-full border-r border-border_grey lg:w-2/5"
					ref={conversationsRef}
				>
					{/* users */}
					<div className="h-full overflow-y-auto">
						{conversations.map((conversation, index: any) => {
							return (
								<AccountMessage
									username={conversation.participant.username}
									profile_img={conversation.participant.avatar || ""}
									last_message={conversation.lastMessage?.content}
									setSelectChat={setSelectedChat}
									width={60}
									height={60}
									key={conversation.participant.username}
									onClick={updateVisibility}
									userId={conversation.participant.id}
								/>
							);
						})}
					</div>
				</div>

				<div
					className="hidden h-full w-full lg:block lg:w-3/5" /* ref={chatsRef} */
				>
					{selectedChat ? <ChatBox recipient={selectedChat} /> : null}
				</div>
			</div>
		</div>
	);
}

export default Messages;
