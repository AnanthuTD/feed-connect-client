"use client";

import React from "react";
import StoriesPosts from "./_home/Stories&Posts";
import Account_suggestion from "./_home/right_pannel/accountSuggestion";
import { useUserContext } from "@/app/components/context/userContext";

function Page() {
	// context
	const { user } = useUserContext();

	let homeComponent = (
		<>
			<div className="flex w-full justify-end lg:py-5 max-w-[630px]">
				<StoriesPosts />
			</div>
			<div className="hidden w-[383px] pl-16 xl:block">
				<Account_suggestion />
			</div>
		</>
	);

	if (user) {
		return homeComponent;
	} else return null;
}

export default Page;
