import React, { useState, useRef, useEffect } from "react";
import Post from "./post";

function Create({
	setCreate,
}: {
	setCreate: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	// ref
	const elevatedDiv = useRef<HTMLDivElement | null>(null);
	const [post, setPost] = useState(false);
	const [stories, setStories] = useState(false);
	const mainDivRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(this: Document, ev: MouseEvent) {
			if (
				!elevatedDiv.current?.contains(ev.target as Node) &&
				mainDivRef.current &&
				mainDivRef.current.contains(ev.target as Node)
			) {
				setCreate(false);
			}
		}

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		if (post) setStories(false);
	}, [post]);

	useEffect(() => {
		if (stories) setPost(false);
	}, [stories]);

	return (
		<>
			<div
				className="absolute inset-0 flex items-center justify-center bg-blackBlur"
				style={{
					minHeight: "380px",
					minWidth: "380px",
					height: "100%",
					zIndex: 15,
				}}
				ref={mainDivRef}
			>
				{!(stories || post) ? (
					<>
						<div className="flex flex-col items-center space-y-3 rounded-lg bg-elevated p-5">
							<div
								className="cursor-pointer rounded px-4 py-2 font-bold text-primaryText outline outline-1 outline-border_grey hover:outline-white"
								onClick={() => setPost(true)}
							>
								POST
							</div>
							<div
								className="cursor-pointer rounded px-4 py-2 font-bold text-primaryText outline outline-1 outline-border_grey hover:outline-white"
								onClick={() => setStories(true)}
							>
								STORIES
							</div>
						</div>
					</>
				) : (
					<div
						className="h-5/6 transform overflow-hidden rounded-xl bg-elevated p-0 shadow-md transition-all duration-500"
						ref={elevatedDiv}
					>
						{post || stories? <Post setCreate={setCreate} post={post} stories={stories}/> : null}
						
					</div>
				)}
			</div>
		</>
	);
}

export default Create;
