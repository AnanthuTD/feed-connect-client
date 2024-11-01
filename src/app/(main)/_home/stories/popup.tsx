import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Story } from "@/utils/Interfaces";
import Carousel from "./Carousel";
import { EmblaOptionsType } from "embla-carousel-react";

interface StoriesView {
	stories: Story[];
	onClose: () => void;
}

function Popup({ stories, onClose }: StoriesView) {
	const [isOpen, setIsOpen] = useState(true);
	const OPTIONS: EmblaOptionsType = { align: "center" };

	const handleClose = () => {
		setIsOpen(false);
		onClose();
	};

	return (
		<Transition.Root show={isOpen} as={React.Fragment}>
			<Dialog
				as="div"
				className="fixed inset-0 z-50 w-full"
				onClose={handleClose}>
				{/* The backdrop, rendered as a fixed sibling to the panel container */}
				<div className="fixed inset-0 bg-black" aria-hidden="true">
					{/* Full-screen container to center the panel */}
					<div className="fixed inset-0 flex items-center justify-center p-4 h-full">
						<Dialog.Panel className="flex h-full items-center">
							<button
								className="absolute right-0 top-0 m-4 rounded p-1 text-white outline outline-2 outline-red-700 hover:bg-red-700 hover:text-white"
								onClick={handleClose}>
								Close
							</button>
							<Carousel stories={stories} options={OPTIONS} />
						</Dialog.Panel>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	);
}

export default Popup;
