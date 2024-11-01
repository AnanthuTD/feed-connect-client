import React from "react";

interface SwitchButtonProps {
	text?: string;
	color?: string;
	className?: string;
}
function SwitchButton({
	text = "",
	color = "#00c2f7",
	className = "",
}: SwitchButtonProps) {
	return (
		<>
			<button
				className={[`ml-auto text-xs font-medium text-instaBlue`, className].join(" ")}
				style={{ color: color }}>
				{text}
			</button>
		</>
	);
}

export default SwitchButton;
