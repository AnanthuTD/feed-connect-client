import React from "react";
import { SvgProps } from "@/utils/Interfaces";

function optionsIcon({
	stroke = "currentColor",
	fill = "none",
	className = "",
}: SvgProps) {
	return (
		<>
			
			<svg
				aria-label="Settings"
				className="block relative"
				color="rgb(245, 245, 245)"
				fill="rgb(245, 245, 245)"
				height="24"
				role="img"
				viewBox="0 0 24 24"
				width="24">
				<path d="M3.5 6.5h17a1.5 1.5 0 0 0 0-3h-17a1.5 1.5 0 0 0 0 3Zm17 4h-17a1.5 1.5 0 0 0 0 3h17a1.5 1.5 0 0 0 0-3Zm0 7h-17a1.5 1.5 0 0 0 0 3h17a1.5 1.5 0 0 0 0-3Z"></path>
			</svg>
		</>
	);
}

export default optionsIcon;
