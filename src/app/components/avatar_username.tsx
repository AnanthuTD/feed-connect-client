import Image from "next/image";
import React from "react";
import { useUserContext } from "./context/userContext";

interface AvatarUsernameProps {
	height: number;
	width: number;
	className: string;
}

function AvatarUsername({
	height = 60,
	width = 60,
	className = "",
}: AvatarUsernameProps) {
	const { user } = useUserContext();
	let username = user?.username;
	return (
		<>
			<div className="flex cursor-pointer">
				<Image
					src="/images/pro-pic.jpg"
					width={width}
					height={height}
					alt=""
					className="rounded-full"
				/>
				<p className={`mx-4 flex items-center ${className}`}>
					{username}
				</p>
			</div>
		</>
	);
}

export default AvatarUsername;
