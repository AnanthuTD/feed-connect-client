import React, { useEffect, useRef, useState } from "react";
import { isImageFile, isVideoFile } from "@/utils/video_or_image";
import { Post } from "@/utils/Interfaces";
import Image from "next/image";

function Media({ post }: { post: Post }) {
	const videoRef = useRef<HTMLVideoElement>(null);
	// const imageContainerRef = useRef<HTMLDivElement>(null);
	// const [imageContainer, setImageContainer] = useState<boolean>(false);
	useEffect(() => {
		const videoElement = videoRef.current;

		const handleMouseOver = () => {
			if (videoElement) {
				videoElement.play();
			}
		};

		const handleMouseOut = () => {
			if (videoElement) {
				videoElement.pause();
			}
		};

		if (videoElement) {
			// console.log("in");

			videoElement.addEventListener("mouseover", () =>
				videoElement.play()
			);
			videoElement.addEventListener("mouseout", handleMouseOut);
		}

		return () => {
			if (videoElement) {
				videoElement.removeEventListener("mouseover", handleMouseOver);
				videoElement.removeEventListener("mouseout", handleMouseOut);
			}
		};
	}, []);

	/* useEffect(() => {
		if (imageContainerRef.current) {
			setImageContainer(true);
		}
	}, []); */
	return (
		<div
			key={post.id}
			className="relative flex aspect-square justify-center overflow-hidden rounded"
			/* ref={imageContainerRef} */>
			{isImageFile(post.file) /* && imageContainer */ ? (
				<Image
					src={`/api/media/${post?.file}`}
					alt=""
					// width={imageContainerRef.current.clientWidth+200}
					// height={imageContainerRef.current.clientHeight + 200}
					width={1920}
					height={1080}
					style={{ objectFit: "cover" }}
				/>
			) : null}
			{isVideoFile(post.file) ? (
				<video
					src={`api/media/${post.file}`}
					controls={false}
					muted={true}
					className=""
					style={{ objectFit: "cover" }}
					width={1920}
					height={1080}
					ref={videoRef}></video>
			) : null}
		</div>
	);
}

export default Media;
