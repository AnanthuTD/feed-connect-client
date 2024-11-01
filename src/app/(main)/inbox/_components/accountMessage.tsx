"use client";
import Image from "next/image";
import React, { Dispatch, SetStateAction } from "react";
interface AccountMessageProps {
	width: number;
	height: number;
	profile_img: URL;
	username: string;
	last_message?: string;
	setSelectChat: Dispatch<SetStateAction<string>>;
	onClick?: () => void;
}
function AccountMessage({
	width = 40,
	height = 40,
	profile_img,
	username,
	last_message,
	setSelectChat,
	onClick,
}: AccountMessageProps) {
	return (
		<>
			<div
				className="m-4 my-3 flex cursor-pointer items-center justify-between"
				onClick={() => {
					setSelectChat(username);
					onClick ? onClick() : null;
				}}>
				<div className="w-1/5">
					<Image
						priority={true}
						src={"/api" + profile_img}
						width={width}
						height={height}
						alt=""
						className="rounded-full "
					/>
				</div>

				<div className="w-4/5 flex-grow" onClick={() => null}>
					<p className="mx-4 flex items-center text-lg text-primaryText ">
						{username}
					</p>
					<div className="overflow-hidden overflow-ellipsis">
						<span
							className="text-md mx-4 items-center overflow-hidden overflow-ellipsis"
							style={{ color: "rgb(168, 168, 168)" }}>
							{last_message}
						</span>
					</div>
				</div>
			</div>
		</>
	);
}

export default AccountMessage;
