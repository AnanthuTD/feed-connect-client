"use client";
import React from "react";

export default function Loading() {
	return (
		<div className="flex h-screen w-full items-center justify-center bg-black">
			<div className="border-primary h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 text-white"></div>
		</div>
	);
}
