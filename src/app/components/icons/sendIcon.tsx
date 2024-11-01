import React from "react";
import { SvgProps } from "@/utils/Interfaces";



function sendIcon({ stroke = "currentColor",
fill = "none",
className = "",}: SvgProps) {
	return (
		<>
			<svg
				aria-label="Share Post"
				className="x1lliihq x1n2onr6"
				color="rgb(168, 168, 168)"
				fill={fill}
				height="24"
				role="img"
				viewBox="0 0 24 24"
				width="24"
			>
				<title>Share Post</title>
				<line
					fill="none"
					stroke={stroke}
					strokeLinejoin="round"
					strokeWidth="2"
					x1="22"
					x2="9.218"
					y1="3"
					y2="10.083"
				></line>
				<polygon
					fill="none"
					points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
					stroke={stroke}
					strokeLinejoin="round"
					strokeWidth="2"
				></polygon>
			</svg>
		</>
	);
}

export default sendIcon;
