import React from "react";
import { SvgProps } from "@/utils/Interfaces";

export default function ThreeDots({ className = "" }: SvgProps) {
	return (
		<span>
			<svg
				aria-label="More Options"
				className={"relative block " + className}
				color="rgb(245, 245, 245)"
				fill="rgb(245, 245, 245)"
				height="24"
				role="img"
				viewBox="0 0 24 24"
				width="24">
				<circle cx="12" cy="12" r="1.5"></circle>
				<circle cx="6" cy="12" r="1.5"></circle>
				<circle cx="18" cy="12" r="1.5"></circle>
			</svg>
		</span>
	);
}
