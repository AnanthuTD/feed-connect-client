import React, { useEffect, useRef, useState } from "react";
import { PostsInterface } from "@/utils/Interfaces";
import { useRouter } from "next/navigation";
import SaveIcon from "../../../components/icons/saveIcon";
import SendIcon from "../../../components/icons/sendIcon";
import SmileIcon from "@/app/components/icons/smileIcon";
import Rings from "@/app/components/rings";
import CommentIcon from "../../../components/icons/commentIcon";
import ThreeDots from "../../../components/icons/ThreeDots";
import Likes from "./likes";
import Comments from "./comments";
import Heart from "./heart";
import { useUserContext } from "@/app/components/context/userContext";
import timeDifference from "@/utils/time_difference";
import { isImageFile, isVideoFile } from "@/utils/video_or_image";
import Image from "next/image";
import ColorThief from "colorthief";
import { useMutation } from "@apollo/client";
import { TOGGLE_LIKE } from "@/graphql/queries";
import { ADD_COMMENT, EDIT_COMMENT, DELETE_COMMENT } from "@/graphql/mutation";


function Post({ post }: { post: PostsInterface }) {
	const [comment, setComment] = useState("");
	const [like, setLike] = useState(false);
	const [saved, setSaved] = useState(false);
	const [currentPost] = useState(post);
	const [likes, setLikes] = useState(false);
	const [comments, setComments] = useState(false);
	const [playVideo, setPlayVideo] = useState(false);
	const [backgroundColor, setBackgroundColor] = useState("black"); // Default background color
	const imageRef = useRef<HTMLImageElement>(null); // Ref for the image

	// gql
	const [handleLike, { data: likeMutationData }] = useMutation(TOGGLE_LIKE);

	useEffect(() => {
		if (likeMutationData) {
			setLike(likeMutationData.toggleLike);
		}
	}, [likeMutationData]);

	const router = useRouter();
	const { user } = useUserContext();

	const videoRef = useRef<HTMLVideoElement>(null);

    const [newComment, setNewComment] = useState("");

    const [addComment] = useMutation(ADD_COMMENT, {
        onCompleted: (data) => setComments([...comments, data.addComment]),
    });

    const [editComment] = useMutation(EDIT_COMMENT);
    const [deleteComment] = useMutation(DELETE_COMMENT);

	useEffect(() => {
		if (videoRef.current) {
			if (playVideo) videoRef.current.play();
			else videoRef.current.pause();
		}
	}, [playVideo]);

	useEffect(() => {
		if (!videoRef.current) return;
		const handleScroll = () => {
			if (videoRef.current) {
				if (container) {
					const rect = videoRef.current.getBoundingClientRect();
					const containerRect = container.getBoundingClientRect();
					const center = container.offsetHeight / 2;
					const elementTop = rect.top - containerRect.top + rect.height / 2;
					const isCentered =
						Math.abs(center - elementTop) < container.offsetHeight / 4;
					setPlayVideo(isCentered);
				}
			}
		};

		const container = videoRef.current.closest(
			"#main_scrollable"
		) as HTMLElement;

		if (container) {
			container.addEventListener("scroll", handleScroll);
		}

		return () => {
			if (container) {
				container.removeEventListener("scroll", handleScroll);
			}
		};
	}, []);

	function getProfile(username: string): void {
		router.push(`/profile/?username=${username}`);
	}

	useEffect(() => {
		if (currentPost) {
			setLike(currentPost.likedByCurrentUser);
		}
	}, []);

	const handleAddComment = () => {
        if (!newComment.trim()) return;

        addComment({
            variables: {
                postId: post.id,
                content: newComment,
            },
        });

        setNewComment("");
    };

    const handleEditComment = (commentId, content) => {
        editComment({
            variables: { commentId, content },
            onCompleted: (data) => {
                setComments(
                    comments.map((comment) =>
                        comment.id === commentId ? { ...comment, content: data.editComment.content } : comment
                    )
                );
            },
        });
    };

    const handleDeleteComment = (commentId) => {
        deleteComment({
            variables: { commentId },
            onCompleted: () => {
                setComments(comments.filter((comment) => comment.id !== commentId));
            },
        });
    };

	function handleFollow(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		console.log("hi");
	}

	// Extract the dominant color using Color Thief
	const extractColor = () => {
		const colorThief = new ColorThief();
		if (isImageFile(currentPost.file) && imageRef.current) {
			imageRef.current.onload = () => {
				const color = colorThief.getColor(imageRef.current!);
				setBackgroundColor(`rgb(${color.join(",")})`);
			};
		} else if (isVideoFile(currentPost.file) && videoRef.current) {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			canvas.width = videoRef.current.videoWidth;
			canvas.height = videoRef.current.videoHeight;

			videoRef.current.addEventListener("play", () => {
				ctx?.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
				const frameData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
				if (frameData) {
					const color = colorThief.getColorFromImageData(frameData);
					setBackgroundColor(`rgb(${color.join(",")})`);
				}
			});
		}
	};

	// Run color extraction when post file changes
	useEffect(() => {
		extractColor();
	}, [currentPost.file]);

	return (
		<>
			<div
				className="h-full w-full lg:w-[470px] border-b border-[rgb(38,38,38)] pb-4 mb-4"
				key={currentPost.id}
			>
				{/* <div className="h-full w-full lg:w-4/5"> */}
				<div className="aspect-[4/5] w-full">
					<div className="flex items-center justify-between h-fit">
						<div className="flex items-center gap-2">
							<div
								className="flex cursor-pointer items-center gap-2"
								onClick={() => getProfile(currentPost.username)}
							>
								<Rings width={"42px"} />
								<div className="flex flex-col">
									<span className="text-sm font-semibold text-primaryText text-[14px]">
										{currentPost.username}
									</span>
									<span
										id="name"
										className="hidden text-xs text-[rgb(245,245,245)] font-normal"
									>
										small
									</span>
								</div>
							</div>
							<div>
								<svg
									aria-label="Verified"
									className="x1lliihq x1n2onr6"
									fill="rgb(0, 149, 246)"
									height="12"
									role="img"
									viewBox="0 0 40 40"
									width="12"
								>
									<title>Verified</title>
									<path
										d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"
										fillRule="evenodd"
									></path>
								</svg>
							</div>
							<span
								className="rounded-full"
								style={{
									width: "5px",
									height: "5px",
									backgroundColor: "gray",
								}}
							></span>
							<span className="text-xs" style={{ color: "gray" }}>
								{timeDifference(currentPost.createdAt)}
							</span>
							<span
								className="rounded-full"
								style={{
									width: "5px",
									height: "5px",
									backgroundColor: "gray",
								}}
							></span>
							<div
								id="follow"
								data-state="false"
								onClick={(e) => handleFollow(e)}
								className="text-[#008fec] text-sm font-medium"
							>
								Follow
							</div>
						</div>
						<div className="">
							<ThreeDots className="m-1 cursor-pointer" />
						</div>
					</div>

					{/* post */}
					<div
						className="relative mt-2 flex h-full items-center justify-center overflow-hidden lg:rounded-lg"
						style={{ backgroundColor }}
					>
						{isImageFile(currentPost.file) ? (
							<Image
								src={`${currentPost.file}`}
								alt="not found"
								ref={imageRef}
								className="object-contain"
								style={{
									maxWidth: "100%",
									maxHeight: "100%",
								}}
								fill={true}
							/>
						) : isVideoFile(currentPost.file) ? (
							<video
								src={`${currentPost.file}`}
								controls={false}
								muted={true}
								className="object-contain"
								style={{
									maxWidth: "100%",
									maxHeight: "100%",
								}}
								ref={videoRef}
							></video>
						) : null}
					</div>
				</div>
				{/* Other Post Details */}
				<div className="p-2"></div>
				<footer className="w-full space-y-2">
					<div className="flex items-center justify-between h-fit">
						<div className="flex gap-2">
							<div
								onClick={() =>
									handleLike({ variables: { postId: currentPost.id } })
								}
							>
								<Heart className="cursor-pointer" like={like} />
							</div>
							<div onClick={() => setComments(true)}>
								<CommentIcon stroke="white" className="cursor-pointer" />
								{comments ? (
									<Comments
										post_id={currentPost.id}
										setComments={setComments}
									/>
								) : null}
							</div>
							<SendIcon stroke="white" className="cursor-pointer" />
						</div>
						<div onClick={() => setSaved(!saved)}>
							<SaveIcon stroke="white" fill={saved ? "white" : "none"} />
						</div>
					</div>

					<div className="flex cursor-pointer gap-1 text-sm">
						{currentPost.likes.length > 0 &&
						!(
							currentPost.likes.find(
								(obj) => obj.username === user?.username
							) && currentPost.likes.length === 1
						) ? (
							<>
								avatar(3)
								<span>Liked by</span>{" "}
								<span className="cursor-pointer font-bold">
									{currentPost.likes[0].username}
								</span>{" "}
								<span>and</span>
								<span
									className="cursor-pointer font-bold"
									onClick={() => {
										setLikes(true);
									}}
								>
									{currentPost.likes.length - 1} others
									{likes ? (
										<Likes setLikes={setLikes} users={currentPost.likes} />
									) : null}
								</span>
							</>
						) : currentPost.likes.length === 0 ? (
							<>No Likes</>
						) : null}
					</div>
					<div className="flex items-center">
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
									onClick={() => handleAddComment()}
								>
									POST
								</span>
							) : null}
							<SmileIcon />
						</div>
					</div>
				</footer>
				{/* </div> */}
			</div>
		</>
	);
}

export default Post;
