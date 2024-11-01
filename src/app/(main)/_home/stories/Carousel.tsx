import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel, {
	EmblaCarouselType,
	EmblaOptionsType,
} from "embla-carousel-react";
import { Story } from "../../../../utils/Interfaces";
import { flushSync } from "react-dom";
import ArrowDotSlide from "./InnerCarousel(Arrows&Dot)";
import styles from './Carousel.module.css'

const TWEEN_FACTOR = 0.7; // adjust opacity

const numberWithinRange = (number: number, min: number, max: number): number =>
	Math.min(Math.max(number, min), max);

/**
 * The `EmblaCarousel` component.
 *
 * This component uses the `useEmblaCarousel` hook to create a carousel.
 * The `onScroll` function is used to calculate the opacity of all slides
 * and update the state.
 */
type PropType = {
	stories: Story[];
	options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = (props) => {
	const { stories, options } = props;
	const [emblaRef, emblaApi] = useEmblaCarousel(options);
	const [tweenValues, setTweenValues] = useState<number[]>([]);
	const [slidesInView, setSlidesInView] = useState<number[]>([]);
	const falseArray = Array(stories.length).fill(false);

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

	useEffect(() => {
		if (!emblaApi) return;

		updateSlidesInView(emblaApi);
		emblaApi.on("select", updateSlidesInView);
		emblaApi.on("reInit", updateSlidesInView);
	}, [emblaApi, updateSlidesInView]);

	/**
	 * Calculates the opacity of all slides and updates the state.
	 */
	const onScroll = useCallback(() => {
		if (!emblaApi) return;

		let currentSlideIndex = emblaApi.selectedScrollSnap();
		let playVideoArray = [...falseArray]; // Create a new array with the same values as falseArray
		playVideoArray[currentSlideIndex] = true;

		// setPlayVideo(playVideoArray);

		const scrollProgress = emblaApi.scrollProgress();

		// Calculate the opacity of each slide.
		const styles = emblaApi.scrollSnapList().map((scrollSnap, index) => {
			let diffToTarget = scrollSnap - scrollProgress;
			const tweenValue = 1 - Math.abs(diffToTarget * TWEEN_FACTOR);
			return numberWithinRange(tweenValue, 0, 1);
		});

		// Update the state with the new opacity values.
		setTweenValues(styles);
	}, [emblaApi, setTweenValues]);

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

	return (
		<div className={styles.embla}>
			<div className={styles.embla__viewport} ref={emblaRef}>
				<div className={styles.embla__container}>
					{stories.map((story, index) => (
						<div
							className={styles.embla__slide}
							key={index}
							style={{
								// Set the opacity of the slide to the value from the state.
								opacity: tweenValues.length
									? tweenValues[index]
									: undefined,
							}}>
							<ArrowDotSlide stories={story.stories} key={story.user_id} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default EmblaCarousel;
