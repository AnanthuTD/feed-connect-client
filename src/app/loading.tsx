"use client";
import React from "react";
import Logo from "./components/logo";

export default function Loading() {
	return (
		<div className="flex h-screen w-full items-center justify-center bg-black">
			<div className="text-white">
				<Logo height={"70px"} width={"380px"} />
			</div>
		</div>
	);
}
