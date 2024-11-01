import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel, {
	EmblaCarouselType,
	EmblaOptionsType,
} from "embla-carousel-react";
import { DotButton, PrevButton, NextButton } from "./ArrowsDotsButtons";
import { StoryItem } from "../../../../utils/Interfaces";
import { LazyLoad } from "./lazyLoad";
import { flushSync } from "react-dom";
import styles from "./InnerCarousel(Arrows&Dots).module.css";

type PropType = {
	stories: StoryItem[];
	options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = (props) => {
	const { stories, options } = props;
	const [emblaRef, emblaApi] = useEmblaCarousel({ watchDrag: false });
	const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
	const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
	const [slidesInView, setSlidesInView] = useState<number[]>([]);
	const falseArray = Array(stories.length).fill(false);
	const [isInView, setIsInView] = useState<boolean[]>(() => {
		let initialArray = [...falseArray];
		initialArray[0] = true;
		return initialArray;
	});
	// const [playVideo, setPlayVideo] = useState<boolean[]>([...falseArray][0]=true)
	const [progress, setProgress] = useState<string[]>(
		Array(stories.length).fill("0%")
	);

	const updateSlidesInView = useCallback((emblaApi: EmblaCarouselType) => {
		setSlidesInView((slidesInView) => {
			if (slidesInView.length === emblaApi.slideNodes().length) {
				emblaApi.off("select", updateSlidesInView);
			}

			const inView = emblaApi
				.slidesInView(true)
				.filter((index) => !slidesInView.includes(index));
			return slidesInView.concat(inView);
		});
	}, []);

	const scrollPrev = useCallback(
		() => emblaApi && emblaApi.scrollPrev(),
		[emblaApi]
	);
	const scrollNext = useCallback(
		() => emblaApi && emblaApi.scrollNext(),
		[emblaApi]
	);
	const scrollTo = useCallback(
		(index: number) => emblaApi && emblaApi.scrollTo(index),
		[emblaApi]
	);

	const onInit = useCallback((emblaApi: EmblaCarouselType) => {
		setScrollSnaps(emblaApi.scrollSnapList());
	}, []);

	const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
		setSelectedIndex(emblaApi.selectedScrollSnap());
		setPrevBtnEnabled(emblaApi.canScrollPrev());
		setNextBtnEnabled(emblaApi.canScrollNext());
	}, []);

	useEffect(() => {
		if (!emblaApi) return;

		onInit(emblaApi);
		onSelect(emblaApi);
		updateSlidesInView(emblaApi);
		emblaApi.on("reInit", onInit);
		emblaApi.on("reInit", onSelect);
		emblaApi.on("select", onSelect);
		emblaApi.on("select", updateSlidesInView);
		emblaApi.on("reInit", updateSlidesInView);
	}, [emblaApi, onInit, onSelect, updateSlidesInView]);

	const onScroll = useCallback(() => {
		if (!emblaApi) return;

		let currentSlideIndex = emblaApi.selectedScrollSnap();
		let playVideoArray = [...falseArray]; // Create a new array with the same values as falseArray
		playVideoArray[currentSlideIndex] = true;

		setIsInView(playVideoArray);
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return;

		// Call the `onScroll` function once to initialize the state.
		onScroll();

		// Add an event listener to the `scroll` event.
		emblaApi.on("scroll", () => {
			flushSync(() => onScroll());
		});

		// Add an event listener to the `reInit` event.
		emblaApi.on("reInit", onScroll);
	}, [emblaApi, onScroll]);

	useEffect(() => {
		console.log("slidesInView = ", slidesInView);
	}, [slidesInView]);

	return (
		<>
			<div className={[styles.embla].join(" ")}>
				<div
					className={[styles.embla__viewport].join(" ")}
					ref={emblaRef}>
					<div className={[styles.embla__container].join(" ")}>
						{stories.map((story, index) => (
							<div
								className={[styles.embla__slide, 'rounded-md overflow-hidden'].join(" ")}
								key={story.story_id}>
								<LazyLoad
									key={story.story_id}
									index={index}
									file={`/api${story.story}`}
									inView={slidesInView.indexOf(index) > -1}
									isInView={isInView}
									getProgress={setProgress}
								/>
							</div>
						))}
					</div>
				</div>

				<PrevButton onClick={scrollPrev} enabled={prevBtnEnabled} />
				<NextButton onClick={scrollNext} enabled={nextBtnEnabled} />

				<div className={[styles.embla__dots].join(" ")}>
					{scrollSnaps.map((_, index) => (
						<DotButton
							key={index}
							selected={index === selectedIndex}
							onClick={() => scrollTo(index)}
							progress={progress}
							index={index}
						/>
					))}
				</div>
			</div>
		</>
	);
};

export default EmblaCarousel;
