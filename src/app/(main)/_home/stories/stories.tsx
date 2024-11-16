import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_STORIES } from "@/graphql/queries";
import ArrowLeft from "./arrowLeft";
import ArrowRight from "./arrowRight";
import Rings from "@/app/components/rings";
import View from "./popup";

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
	const take = 8; // Number of stories to fetch per request
    const [skip, setSkip] = useState(0); // Pagination skip value

    // Fetch stories using GraphQL
    const { data, loading, fetchMore } = useQuery(GET_STORIES, {
        variables: { take, skip },
        notifyOnNetworkStatusChange: true,
    });
	

	useEffect(() => {
        // Update stories when new data is fetched
        if (data?.getStories?.stories) {
            setStories((prevStories) => [...prevStories, ...data.getStories.stories]);

            // Manage scroll buttons
            if (data.getStories.stories.length > 0) {
                setscrollRight(data.getStories.hasMore);
            }
        }
    }, [data]);

	function handleClickRight() {
		const container = document.getElementById("scroll-container");
		const containerWidth = container?.getBoundingClientRect().width || 0;
		const contentWidth = container?.scrollWidth || 0;
		const scrollAmount = containerWidth / 2;

		if (container && contentWidth - container.scrollLeft > containerWidth) {
            container.scrollBy({ left: scrollAmount, behavior: "smooth" });
            setscrollLeft(true);

            // Check if we need to fetch more stories
            if (contentWidth - container.scrollLeft <= 2 * containerWidth && !loading) {
                fetchMore({
                    variables: { take, skip: stories.length },
                });
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
            setscrollRight(true);

            if (container.scrollLeft <= scrollAmount) {
                setscrollLeft(false);
            }
        }
	}

	return (
        <>
            <div className="relative flex h-fit w-full">
                {/* Scroll Left */}
                {scrollLeft && (
                    <div
                        className="hidden lg:flex absolute bottom-0 left-5 top-0 z-10 cursor-pointer items-center"
                        onClick={handleClickLeft}
                    >
                        <ArrowLeft />
                    </div>
                )}

                {/* Stories Container */}
                <div
                    className="overflow-y-hidden overflow-x-scroll no-scrollbar pointer-events-auto h-fit m-w-[685px]"
                    id="scroll-container"
                >
                    <div className="flex" style={{ height: "fit-content" }}>
                        {stories.map((story) => (
                            <React.Fragment key={`RingKey${story.id}`}>
                                <Rings
                                    avatar={story.fileUrl}
                                    onClick={openPopup}
                                    key={`RingKey${story.id}`}
                                />
                                <div className="px-2"></div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Scroll Right */}
                {scrollRight && (
                    <div
                        className="hidden lg:flex absolute bottom-0 right-5 top-0 z-10 cursor-pointer items-center"
                        onClick={handleClickRight}
                    >
                        <ArrowRight />
                    </div>
                )}
            </div>

            {/* Popup */}
            {showPopup && <View stories={stories} onClose={closePopup} />}
        </>
    );
}

export default Stories;
