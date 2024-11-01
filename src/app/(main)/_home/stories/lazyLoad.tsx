import { isImageFile, isVideoFile } from "@/utils/video_or_image";
import Image from "next/image";
import React, { useState, useCallback, useEffect, useRef } from "react";
import shimmer from "./shimmer.module.css";
import styles from "./InnerCarousel(Arrows&Dots).module.css";
import { clearInterval } from "timers";

type PropType = {
	file: string;
	inView: boolean;
	index: number;
	isInView?: boolean[];
	getProgress?: React.Dispatch<React.SetStateAction<string[]>>;
};

export const LazyLoad: React.FC<PropType> = (props) => {
	const { file, inView, index, isInView, getProgress: setProgress } = props;
	const [hasLoaded, setHasLoaded] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);

	const setLoaded = useCallback(() => {
		if (inView) setHasLoaded(true);
	}, [inView, setHasLoaded]);

	const updateProgressBar = () => {
		if (!setProgress) return;
		if (videoRef.current && isInView) {
			const progress =
				(videoRef.current.currentTime / videoRef.current.duration) *
				100;

			setProgress((prevArray) => {
				let newArray = [...prevArray];
				newArray[index] = `${progress}%`;
				return newArray;
			});
		} else {
			setProgress((prevArray) => {
				let newArray = [...prevArray];
				newArray[index] = "0%";
				return newArray;
			});
		}
	};

	useEffect(() => {
		if (videoRef.current && isInView) {
			videoRef.current.addEventListener("timeupdate", updateProgressBar);
			if (isInView[index]) videoRef.current.play();
			else videoRef.current.pause();
		}
	}, [isInView]);

	useEffect(() => {
		let imageTimer: NodeJS.Timeout | undefined = undefined;

		if (!imageRef.current || !hasLoaded || !setProgress || !isInView)
			return;

		if (isInView[index]) {
			let countDown = 0;
			imageTimer = setInterval(() => {
				if (countDown === 5) {
					clearInterval(imageTimer);
					return;
				}
				setProgress((prevArray) => {
					const newArray = [...prevArray];
					newArray[index] = `${(100 / 5) * countDown}%`;
					return newArray;
				});
				countDown++;
			}, 1000);
			setTimeout(() => {
				if (imageTimer) {
					clearTimeout(imageTimer);
					imageTimer = undefined;
				}
			}, 5000);
		} else {
			if (imageTimer) {
				clearTimeout(imageTimer);
				imageTimer = undefined;
			}
		}

		return () => {
			if (imageTimer) {
				clearTimeout(imageTimer);
				imageTimer = undefined;
			}
		};
	}, [hasLoaded, isInView]);

	return (
		<div
			className={[
				styles.embla__slide,
				"direction-col flex items-center justify-center rounded-md",
				hasLoaded ? "" : shimmer.shimmer,
			].join(" ")}>
			{isImageFile(file) ? (
				<Image
					className={[styles.embla__lazy_load__img, "rounded"].join(
						" "
					)}
					alt="unable to load image"
					src={inView ? file : ""}
					onLoad={setLoaded}
					width={500}
					height={500}
					loading="lazy"
					ref={imageRef}
				/>
			) : null}

			{isVideoFile(file) ? (
				<video
					src={inView ? file : ""}
					controls={false}
					onLoad={setLoaded}
					muted={false}
					className={[styles.embla__lazy_load__img, "rounded"].join(
						" "
					)}
					width={500}
					height={undefined}
					ref={videoRef}
					onLoadedData={setLoaded}></video>
			) : null}
		</div>
	);
};
