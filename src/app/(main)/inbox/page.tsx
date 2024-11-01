"use client";
import CreateMessage from "./_components/create";
import DropDown from "./_components/dropdown";
import AccountMessage from "./_components/accountMessage";
import React, { useEffect, useRef, useState } from "react";
import ChatBox from "./_components/chatBox";
import { useSearchParams } from "next/navigation";
import { OtherUserProfile } from "@/utils/Interfaces";
import { useUserContext } from "@/app/components/context/userContext";
import ArrowLeft from "@/app/components/icons/ArrowLeft";
import axios from "@/lib/axios";
import SearchAccounts from "./_components/searchAccounts";

interface conversations {
	last_message: string;
	profile_img: URL;
	updated_at?: string;
	username: string;
}

function Messages() {
	const searchParams = useSearchParams();
	const id_user = searchParams.get("id_user");

	// context
	const { user } = useUserContext();

	const [profile, setProfile] = useState<OtherUserProfile | undefined>();
	const [conversations, setConversations] = useState<conversations[] | []>([]);
	const [selectedChat, setSelectedChat] = useState("");
	const [isOpenUserSearchBox, setIsOpenUserSearchBox] =
		useState<boolean>(false);

	const conversationsRef = useRef<HTMLDivElement>(null);
	const chatsRef = useRef<HTMLDivElement>(null);
	const boxRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		async function fetchProfile() {
			try {
				const response = await axios.get(
					`/api/accounts/get_profile/${id_user}/`
				);
				const data = response.data;

				if (data.status) {
					setProfile(data.profile);
				}
			} catch (error) {
				console.error("Error during Axios request:", error);
				// Handle the error here
			}
		}

		if (id_user) {
			fetchProfile();
		}
	}, [id_user]);

	useEffect(() => {
		const fetchConversations = async () => {
			try {
				if (profile) {
					// Set up initial conversation with user's own profile
					setConversations([
						{
							username: profile.username,
							profile_img: profile.profile_img,
							last_message: "",
						},
					]);
				}

				if (!profile || (!id_user && profile)) {
					// Fetch all conversations
					const response = await axios.get<{
						conversations: conversations[];
						message: string;
						status: boolean;
					}>("/api/chat/conversations/");

					const tempConversations = response.data.conversations;

					// If profile exists, find and move its conversation to the top
					if (profile) {
						const foundIndex = tempConversations.findIndex(
							(conversation) =>
								conversation.username === profile.username
						);
						if (foundIndex !== -1) {
							const foundConversation = tempConversations.splice(
								foundIndex,
								1
							)[0];
							setConversations([
								foundConversation,
								...tempConversations,
							]);
						}
					} else {
						// Add all conversations if profile doesn't exist
						setConversations(tempConversations);
					}

					// Set selected chat to profile's username or the first conversation
					setSelectedChat(
						profile?.username || tempConversations[0]?.username
					);
				}
			} catch (error) {
				console.error("Error during Axios request:", error);
			}
		};

		fetchConversations();
	}, [profile]);

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
	}, [contentRef.current]); // trigger useEffect when this exist

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
		// window.addEventListener("resize", updateVisibility);
	}, []);

	useEffect(() => {
		console.log("is open : ", isOpenUserSearchBox);
	}, [isOpenUserSearchBox]);

	return (
		<div
			className="relative flex w-full flex-col overflow-hidden rounded bg-black"
			ref={boxRef}
		>
			{/* top */}
			<div className="flex border-b border-border_grey" ref={titleRef}>
				<div className="flex w-1/6 items-center justify-center">
					{/* <Link href={"/inbox"} className="lg:hidden"> */}
					<ArrowLeft className="lg:hidden" onClick={handleBack} />{" "}
					{/* </Link> */}
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
				{isOpenUserSearchBox ? (
					<SearchAccounts
						onCancel={() => {
							setIsOpenUserSearchBox(false);
						}}
					/>
				) : null}
			</div>
			<div className="flex h-full" ref={contentRef}>
				<div
					className="w-full border-r border-border_grey lg:w-2/5"
					ref={conversationsRef}
				>
					{/* users */}
					<div className="h-full overflow-y-auto">
						{conversations.map(
							(
								user: {
									username: React.Key | null | undefined;
									profile_img: URL;
									last_message: string | undefined;
								},
								index: any
							) => (
								<>
									<AccountMessage
										username={user.username}
										profile_img={user.profile_img}
										last_message={user.last_message}
										setSelectChat={setSelectedChat}
										width={60}
										height={60}
										key={user.username}
										onClick={updateVisibility}
									/>
								</>
							)
						)}
					</div>
				</div>

				<div
					className="hidden h-full w-full lg:block lg:w-3/5"
					ref={chatsRef}
				>
					{selectedChat ? <ChatBox recipient={selectedChat} /> : null}
				</div>
			</div>
		</div>
	);
}

export default Messages;
