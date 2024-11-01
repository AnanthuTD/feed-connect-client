"use client";
import SeeAll from "./brightBlueButton";
import AccountsSM from "./accounts-sm";
import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { AxiosError } from "axios";
interface SuggestedUser {
	username: string;
	first_name: string;
	last_name: string;
}

function SuggestedForYou() {
	const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSuggestedUsers = async () => {
			try {
				const response = await axios.get("/api/accounts/suggested-users", {
					params: {
						n: 5, // Example: Retrieve details of 5 suggested users
					},
				});

				setSuggestedUsers(response.data.suggested_users);
				setLoading(false);
			} catch (error: AxiosError | any) {
				if (error instanceof AxiosError) {
				  // Handle AxiosError
				  setError(error.response ? error.response.data : error.message);
				} else {
				  // Handle other types of errors
				  setError(error.message);
				}
				setLoading(false);
			 }
		};

		fetchSuggestedUsers();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<>
			<div className="flex">
				<p className="text-sm font-bold text-gray-500">Suggested for you</p>
				<SeeAll text="See All" color="white" />
			</div>
			{suggestedUsers.map((user) => (
				<AccountsSM key={user.username} username={user.username} />
			))}

			<div className="my-5 flex">
				<ul className="flex list-none flex-wrap text-xs text-gray-500">
					<li className="cursor-pointer hover:underline">About</li>
					<li className="mx-1">.</li>
					<li className="cursor-pointer hover:underline">Help</li>
					<li className="mx-1">.</li>
					<li className="cursor-pointer hover:underline">Press</li>
					<li className="mx-1">.</li>
					<li className="cursor-pointer hover:underline">API</li>
					<li className="mx-1">.</li>
					<li className="cursor-pointer hover:underline">Jobs</li>
					<li className="mx-1">.</li>
					<li className="cursor-pointer hover:underline">Privacy</li>
					<li className="mx-1">.</li>
					<li className="cursor-pointer hover:underline">Terms</li>
					<li className="mx-1">.</li>
					<li className="cursor-pointer hover:underline">Locations</li>
					<li className="mx-1">.</li>
					<li className="cursor-pointer hover:underline">Language</li>
					<li className="mx-1">.</li>
					<li className="cursor-pointer hover:underline">English</li>
					<li className="mx-1">.</li>
					<li className="cursor-pointer hover:underline">Meta</li>
					<li className="mx-1">.</li>
					<li className="cursor-pointer hover:underline">Verified</li>
					<li className="mx-1">.</li>
				</ul>
			</div>

			<p className="my-5 text-xs text-gray-500">
				© 2023 INSTAGRAM FROM META
			</p>
		</>
	);
}

export default SuggestedForYou;
