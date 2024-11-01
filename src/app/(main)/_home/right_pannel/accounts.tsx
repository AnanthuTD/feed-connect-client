"use client";
import Image from "next/image";
import SwitchButton from "./brightBlueButton";
import React from "react";
import { useUserContext } from "@/app/components/context/userContext";

function Accounts() {
	const userContext = useUserContext();

	const { user } = userContext;
	let username = user?.username;
	return (
		<>
			<div className="flex cursor-pointer">
				<Image
					src="/images/pro-pic.jpg"
					width={44}
					height={44}
					alt=""
					className="rounded-full"
				/>
				<p className="mx-4 flex items-center">{username}</p>
				<SwitchButton text="Switch" />
			</div>
		</>
	);
}

export default Accounts;
