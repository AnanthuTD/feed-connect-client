import React from "react";
import { SvgProps } from "../../../utils/Interfaces";

function Search({
	stroke = "currentColor",
	fill = "none",
	className = "",
}: SvgProps) {
	return (
		<>
			<svg
				aria-label="Search"
				className="relative block"
				color="rgb(245, 245, 245)"
				fill="rgb(245, 245, 245)"
				height="24"
				role="img"
				viewBox="0 0 24 24"
				width="24">
				<path
					d="M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z"
					fill="none"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"></path>
				<line
					fill="none"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					x1="16.511"
					x2="22"
					y1="16.511"
					y2="22"></line>
			</svg>
		</>
	);
}

export default Search;
