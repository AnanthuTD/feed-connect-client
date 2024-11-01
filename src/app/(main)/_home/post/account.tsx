import Image from "next/image";
import React from "react";
import axios from "@/lib/axios";
import { useUserContext } from "@/app/components/context/userContext";
import { UUID } from "crypto";
interface AccountProps {
	width?: number;
	height?: number;
	user: {
		username: string;
		first_name: string;
		last_name: string;
		profile_img: string;
		id_user: UUID;
	};
}
function Account({ width = 40, height = 40, user }: AccountProps) {
	// context
	const { user: currentUser, setUser } = useUserContext();

	async function follow() {
		if (!user?.id_user) return;

		try {

			const response = await axios.put(
				`/api/accounts/follow/`,
				{
					id_user: user?.id_user,
				},
			);

			const data = response.data;

			if (data.status) {
				if (data.user) {
					setUser(data.user);
				}
			}
		} catch (error) {
			console.error("Error during Axios request:", error);
			console.error(
				"An error occurred while processing the follow action. Please try again later."
			);
		}
	}

	async function unfollow() {
		if (!user?.id_user) return;

		try {

			const response = await axios.delete(
				`/api/accounts/${user.id_user}/follow/`,
			);

			const data = response.data;

			if (data.status) {
				if (data.user) {
					setUser(data.user);
				}
			}
		} catch (error) {
			console.error("Error during Axios request:", error);
			console.error(
				"An error occurred while processing the unfollow action. Please try again later."
			);
		}
	}

	return (
		<>
			<div className="m-4 my-3 flex cursor-pointer items-center justify-between">
				<div className="flex">
					<Image
						src={`/api/media/${user.profile_img}`}
						width={width}
						height={height}
						alt=""
						className="rounded-full"
					/>

					<div style={{ height: "fit-content" }} onClick={() => null}>
						<p className="mx-4 flex items-center text-sm text-primaryText">
							{user.username}
						</p>
						<p
							className="mx-4 flex items-center text-sm "
							style={{ color: "rgb(168 168 168)" }}>
							{[user.first_name, user.last_name].join(" ")}
						</p>
					</div>
				</div>
				<div>
					{!currentUser?.following.includes(user.id_user) ? (
						<button
							type="button"
							onClick={() => follow()}
							className="cursor-pointer rounded-md bg-white px-4 py-1 text-sm font-bold text-black">
							Follow
						</button>
					) : (
						<button
							type="button"
							onClick={() => unfollow()}
							className="cursor-pointer rounded-md bg-white px-4 py-1 text-sm font-bold text-black">
							Unfollow
						</button>
					)}
				</div>
			</div>
		</>
	);
}

export default Account;
