import { UUID } from "crypto";
import React, { useEffect, useRef, useState } from "react";
import { Url } from "url";
import Image from "next/image";
import timeDifference from "@/utils/time_difference";
import SmileIcon from "@/app/components/icons/smileIcon";
import axios from "@/lib/axios";

interface commentsInterface {
	id: UUID;
	author: string;
	comment: string;
	time_stamp: Date;
	profile_img: Url;
}

interface WebSocketData {
	data: string;
}

function Comments({
	post_id,
	setComments: viewComments,
}: {
	post_id: UUID;
	setComments: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const elevatedDiv = useRef<HTMLDivElement | null>(null);
	const [currentComments, setCurrentComments] = useState<commentsInterface[]>(
		[]
	);
	const [commentSocket, setCommentSocket] = useState<WebSocket | null>();
	const commentLogRef = useRef<HTMLDivElement>(null);
	const [comment, setComment] = useState("");
	const headingRef = useRef<HTMLDivElement>(null);
	const bodyRef = useRef<HTMLDivElement>(null);
	const commentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const socket = new WebSocket(
			// `ws://localhost:8000/ws/post/comment/${post_id.toString()}/`
		);

		setCommentSocket(socket);

		socket.addEventListener("message", (event: WebSocketData) => {
			const data = JSON.parse(event.data);

			if (data.hasOwnProperty("status")) return;

			const newMessage: commentsInterface = data.message;

			setCurrentComments((prevComments) => [...prevComments, newMessage]);

			if (commentLogRef.current) {
				commentLogRef.current.scrollTop = commentLogRef.current.scrollHeight;
			}
		});

		socket.addEventListener("close", () => {
			console.error("Chat socket closed unexpectedly");
		});

		return () => {
			// socket.close();
		};
	}, []);

	async function getComments() {
		try {
			const response = await axios.get(
				`/api/post/comments/?post_id=${post_id}`
			);

			const data = response.data;

			if (data.status) {
				// comments retrieved successfully, do something with the comment data
				setCurrentComments(data.comments);
			} else {
				// error retrieving comments, handle the error
				console.error(data.message);
			}
		} catch (error) {
			console.error("Error retrieving comments:", error);
		}
	}

	useEffect(() => {
		getComments();
		function handleClickOutside(this: Document, ev: MouseEvent) {
			const targetElement = ev.target as HTMLElement;

			if (
				elevatedDiv &&
				!elevatedDiv.current?.contains(ev.target as Node) &&
				targetElement.id !== "post"
			) {
				viewComments(false);
			}
		}

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

	const handlePostComment = async () => {
		if (
			!comment &&
			commentSocket &&
			commentSocket.readyState === WebSocket.OPEN
		)
			return;

		commentSocket?.send(JSON.stringify({ comment }));

		setComment("");
	};

	useEffect(() => {
		const handleResize = () => {
			if (
				bodyRef.current &&
				elevatedDiv.current &&
				commentRef.current &&
				headingRef.current
			) {
				const parentHeight = elevatedDiv.current?.clientHeight;
				const headerHeight = headingRef.current?.clientHeight;
				const footerHeight = commentRef.current?.clientHeight;
				const middleDivHeight = parentHeight - headerHeight - footerHeight;
				bodyRef.current.style.height = `${middleDivHeight}px`;
			}
		};

		// Initial calculation of the height
		handleResize();

		// Add event listener for window resize
		window.addEventListener("resize", handleResize);

		// Clean up the event listener on component unmount
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<>
			<div
				className="absolute inset-0 flex items-center justify-center bg-blackBlur"
				style={{
					zIndex: 15,
				}}>
				<div
					className="h-4/5 w-1/4 transform overflow-hidden rounded-xl bg-elevated p-0 shadow-md transition-all duration-500"
					ref={elevatedDiv}>
					{/* header */}
					<div
						className="flex w-full justify-center border-b p-3 font-bold text-white"
						style={{ borderColor: "#3d3d3d" }}
						ref={headingRef}>
						<div className="w-1/4"></div>
						<div className="flex w-2/4 items-center justify-center">
							Comments
						</div>
						<div className="w-1/4"></div>
					</div>
					<div
						className="flex flex-grow flex-col justify-between overflow-hidden"
						ref={bodyRef}>
						<div className="flex-grow overflow-auto">
							{currentComments?.map((comment) => (
								<div className="flex py-2" key={comment.id}>
									<div className="flex items-start justify-center px-5">
										<Image
											src={`/api${comment.profile_img}`}
											alt=""
											className="aspect-square rounded-full"
											width={35}
											height={35}
										/>
									</div>
									<div>
										<span className="text-base">
											<span className="font-bold">{comment.author}</span>{" "}
											{comment.comment}
										</span>
										<footer className="text-xs">
											{timeDifference(new Date(comment.time_stamp)) === "0s"
												? "now"
												: timeDifference(comment.time_stamp)}
										</footer>
									</div>
								</div>
							))}
						</div>
					</div>
					<div className="flex items-center p-3" ref={commentRef}>
						<input
							type="text"
							className="w-full border-none bg-transparent text-sm outline-none"
							placeholder="Add a comment..."
							onChange={(e) => setComment(e.target.value)}
							value={comment}
						/>
						<div className="flex cursor-pointer gap-2">
							{comment ? (
								<span
									className="text-xs font-bold text-brightBlue"
									id="post"
									onClick={() => handlePostComment()}>
									POST
								</span>
							) : null}
							<SmileIcon />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default Comments;
