import React from "react";
import ArrowLeft from "./arrowLeft";
import ArrowRight from "./arrowRight";
import Rings from "@/app/components/rings";
import View from "./popup";
import { useEffect, useState } from "react";
import { Story } from "@/utils/Interfaces";
import axios from "@/lib/axios";

function Stories() {
	const [scrollLeft, setscrollLeft] = useState(false);
	const [scrollRight, setscrollRight] = useState(false);
	const [stories, setStories] = useState<Story[]>([]);

	const [showPopup, setShowPopup] = useState(false);

	const openPopup = () => {
		setShowPopup(true);
	};

	const closePopup = () => {
		setShowPopup(false);
	};

	useEffect(() => {
		if (stories.length > 8) {
			setscrollRight(true);
		}

		async function fetchStories() {
			try {
				const response = await axios.get("api/post/stories/");
				const data = response.data;
				setStories(data.stories);
			} catch (error) {
				console.error("Error during Axios request:", error);
				// Handle the error here
			}
		}

		fetchStories();
	}, []);

	function handleClickRight() {
		const container = document.getElementById("scroll-container");
		const containerWidth = container?.getBoundingClientRect().width || 0;
		const contentWidth = container?.scrollWidth || 0;
		const scrollAmount = containerWidth / 2;

		if (container && contentWidth - container.scrollLeft > containerWidth) {
			container.scrollBy({ left: scrollAmount, behavior: "smooth" });
			if (scrollLeft !== true) {
				setscrollLeft(true);
			}
			if (contentWidth - container.scrollLeft === contentWidth) {
				setscrollRight(false);
			}
		}
	}

	function handleClickLeft() {
		const container = document.getElementById("scroll-container");
		const containerWidth = container?.getBoundingClientRect().width || 0;
		const contentWidth = container?.scrollWidth || 0;
		const scrollAmount = containerWidth / 2;

		if (container && container.scrollLeft !== 0) {
			container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
			if (scrollRight !== true) {
				setscrollRight(true);
			}

			if (container.scrollLeft + containerWidth >= contentWidth) {
				setscrollLeft(false);
			}
		}
	}

	return (
		<>
			<div className="relative flex h-fit w-full">
				{/* scroll left */}
				{scrollLeft ? (
					<div
						className="hidden lg:flex absolute bottom-0 left-5 top-0 z-10 cursor-pointer items-center"
						onClick={() => {
							handleClickLeft();
						}}
					>
						{stories.length > 8 ? <ArrowLeft /> : null}
					</div>
				) : null}
				{/* stories */}
				<div
					className="overflow-y-hidden overflow-x-scroll no-scrollbar pointer-events-auto h-fit m-w-[685px]"
					id="scroll-container"
				>
					<div className="flex" style={{ height: "fit-content" }}>
						{stories.map((story) => {
							return (
								<React.Fragment key={`RingKey${story.user_id}`}>
									<Rings
										key={`RingKey${story.user_id}`}
										avatar={"api/" + story.profile_img}
										onClick={() => openPopup()}
									/>
									<div className="px-2"></div>
								</React.Fragment>
							);
						})}
					</div>
				</div>
				{/* more stories... */}
				{scrollRight ? (
					<div
						className="hidden lg:flex absolute bottom-0 right-5 top-0 z-10 cursor-pointer items-center"
						onClick={() => {
							handleClickRight();
						}}
					>
						{stories.length > 8 ? <ArrowRight /> : null}
					</div>
				) : null}
			</div>
			{/* Render the popup */}
			{showPopup && <View stories={stories} onClose={closePopup} />}
		</>
	);
}

export default Stories;
