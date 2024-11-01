import React, { useEffect, useRef, useState } from "react";
import { Chat } from "@/utils/Interfaces";
import OptionsPopUp from "./optionsPopUp";
import { fetchCSRF } from "@/lib/axios";
import axios from "axios";

function Message({
	position = "right",
	chat,
	displayTime = true,
	endNoneRounded,
}: {
	position?: "right" | "left";
	chat: chat;
	displayTime?: boolean;
	endNoneRounded: boolean[]; // [start-end, end-end]
}) {
	const [options, setOptions] = useState(false);
	const [unmounted, setUnmounted] = useState(false); // State to track if the component should be unmounted
	const messageContainerRef = useRef<HTMLDivElement>(null);
	const messageChildContainerRef = useRef<HTMLDivElement>(null);
	const roundedDivRef = useRef<HTMLDivElement>(null);
	const [rounded, setRounded] = useState("rounded-full");
	const [popupHeight, setPopupHeight] = useState("");

	function getTime(timestamp: Date): React.ReactNode {
		const date = new Date(timestamp);
		return date.toLocaleString("en-IN", {
			hour: "numeric",
			minute: "numeric",
			hour12: true,
		});
	}

	const handleUnsend = async () => {
		try {
			console.log("====================================");
			console.log('chat:', chat);
			console.log("====================================");
			const csrfToken = await fetchCSRF();

			const response = await axios.delete("/api/chat/unsend/", {
				data: { id: chat.id },
				withCredentials: true,
				headers: {
					"X-CSRFToken": csrfToken,
				},
			});
			const responseData = response.data;

			if (responseData.status) {
				setOptions(false);
				setUnmounted(true); // Update the state to indicate that the component should be unmounted
			} else {
				alert("Cannot unsend");
			}
		} catch (error) {
			console.error("Failed to unsend:", error);
		}
	};

	useEffect(() => {
		if (
			messageContainerRef.current &&
			messageChildContainerRef.current &&
			roundedDivRef.current
		) {
			const maxWidth =
				parseFloat(getComputedStyle(messageContainerRef.current).width) / 2;
			const currentWidth = parseFloat(
				getComputedStyle(messageChildContainerRef.current).width
			);
			if (maxWidth === currentWidth) {
				setRounded("rounded-3xl");
			}
			setPopupHeight(getComputedStyle(roundedDivRef.current).height);
		}
	}, []);

	if (unmounted) {
		return null; // Return null to effectively unmount the component
	}

	const classParent = position === "right" ? "flex-row-reverse" : "";
	const classChild = position === "right" ? "items-end" : "";
	let roundedEnd = "";

	if (endNoneRounded[0]) {
		roundedEnd +=
			position === "right" ? " rounded-se-3xl" : " rounded-ss-3xl";
	}
	if (endNoneRounded[1]) {
		roundedEnd +=
			position === "right" ? " rounded-ee-3xl" : " rounded-es-3xl";
	}

	return (
		<div
			className={["my-2 flex h-fit w-full", classParent].join(" ")}
			onMouseOver={() => setOptions(true)}
			onMouseOut={() => setOptions(false)}
			ref={messageContainerRef}
		>
			{/* Message Content */}
			<div
				className={[
					"mt-0 flex h-fit w-fit max-w-1/2 flex-col",
					classChild,
				].join(" ")}
				ref={messageChildContainerRef}
			>
				<div
					className={[
						"mx-3 flex w-fit max-w-full px-3 py-1 outline outline-1 outline-border_grey",
						rounded,
						roundedEnd,
					].join(" ")}
					ref={roundedDivRef}
				>
					<div
						className={[
							"lg:text-md break-normal text-xl text-primaryText",
						].join(" ")}
						style={{ overflowWrap: "anywhere" }}
					>
						<p>{chat.message}</p>
					</div>
				</div>
				{displayTime && (
					<div className="mt-3 flex w-full flex-row-reverse pr-3">
						<span className="h-fit w-fit text-xs text-secondryText">
							{getTime(chat.timestamp)}
						</span>
					</div>
				)}
			</div>

			{/* Options Pop-up */}
			{options && (
				<OptionsPopUp height={popupHeight}>
					<button onClick={handleUnsend}>Unsend</button>
				</OptionsPopUp>
			)}
		</div>
	);
}

export default Message;
