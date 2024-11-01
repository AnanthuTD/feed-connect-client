import React from "react";
import { SvgProps } from "../../../../utils/Interfaces";

function DropDown({
	stroke = "currentColor",
	fill = "none",
	className = "",
}: SvgProps) {
	return (
		<>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill={fill}
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke={stroke}
				className={["h-6 w-6", className].join(" ")}>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M19.5 8.25l-7.5 7.5-7.5-7.5"
				/>
			</svg>
		</>
	);
}

export default DropDown;
