"use client";

import SettingsIcon from "../../components/icons/settings";
import { useEffect, useState } from "react";
import Posts from "./components/posts";
import Saved from "./components/saved";
import Tagged from "./components/tagged";
import SettingsPopUp from "./components/settings";
import { useUserContext } from "../../components/context/userContext";
import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { OtherUserProfile, UserState } from "../../../utils/Interfaces";
import Image from "next/image";
import DiscoverPeople from "@/app/components/icons/DiscoverPeople";
import CreateIcon from "@/app/components/icons/Create";
import OptionIcon from "@/app/components/icons/OptionIcon";
import ChevronY from "@/app/components/icons/ChevronY";
import axios from '@/lib/axios';

function Profile() {
	// useStates
	const [post, setPost] = useState(true);
	const [saved, setSaved] = useState(false);
	const [tagged, setTagged] = useState(false);
	const [settings, setSettings] = useState(false);
	const [profile, setProfile] = useState<
		UserState | undefined | OtherUserProfile
	>();
	const [loading, setLoading] = useState(true);

	const router = useRouter();

	/* const OtherUserProfileContext = createContext<OtherUserProfile | undefined>(
		undefined
	); */

	// context
	const { user, setUser } = useUserContext();

	let username = useSearchParams().get("username") || "";

	async function fetchProfile() {
		try {
			const response = await axios.get(
				`/api/accounts/get_profile/${username}/`
			);
			const data = response.data;

			if (data.status) {
				setProfile(data.profile);
			}
		} catch (error) {
			console.error("Error during Axios request:", error);
			// Handle the error here
		}
	}

	useEffect(() => {
		if (username) fetchProfile();
		else setProfile(user);
	}, []);

	useEffect(() => {
		if (profile) setLoading(false);
	}, [profile]);

	const PostStyle = {
		color: post ? "white" : "gray",
		borderTopColor: post ? "white" : "",
		borderTop: post ? "solid 0.1px" : "",
		cursor: "pointer",
		padding: "10px",
	};
	const SavedStyle = {
		color: saved ? "white" : "gray",
		borderTopColor: tagged ? "white" : "",
		borderTop: saved ? "solid 0.1px" : "",
		cursor: "pointer",
		padding: "10px",
	};
	const TaggedStyle = {
		color: tagged ? "white" : "gray",
		borderTopColor: saved ? "white" : "",
		borderTop: tagged ? "solid 0.1px" : "",
		cursor: "pointer",
		padding: "10px",
	};

	async function follow() {
		if (!profile?.id_user) return;

		try {
			const response = await axios.put(
				`/api/accounts/follow/`,
				{
					id_user: profile?.id_user,
				},
			);

			const data = response.data;

			if (data.status) {
				await fetchProfile(); // Wait for fetchProfile to complete
				if (data.user) {
					setUser(data.user);
				}
			}
		} catch (error) {
			console.error("Error during Axios request:", error);
			// Handle the error here
		}
	}

	async function unfollow() {
		if (!profile?.id_user) return;

		try {
			const response = await axios.delete(
				`/api/accounts/${profile.id_user}/follow/`,
			);

			const data = response.data;

			if (data.status) {
				await fetchProfile(); // Wait for fetchProfile to complete
				if (data.user) {
					setUser(data.user);
				}
			}
		} catch (error) {
			console.error("Error during Axios request:", error);
			// Handle the error here
		}
	}

	function message() {
		if (
			user?.id_user &&
			profile?.id_user &&
			profile.id_user !== user?.id_user
		) {
			router.push(`/inbox/?id_user=${profile.id_user}`);
		}
	}

	if (loading) {
		return <div>loading</div>;
	} else if (profile)
		return (
			<div className="flex w-full justify-center bg-black max-lg:flex-col">
				<div className="flex w-full justify-between bg-black p-3 lg:hidden">
					<div className="flex gap-2">
						<span className="font-bold">{profile.username}</span>
						<ChevronY type="down" />
					</div>
					<div className="flex gap-5">
						<CreateIcon />
						<OptionIcon />
					</div>
				</div>
				<div
					className="flex w-full bg-black max-lg:overflow-y-auto"
					style={{ /* minWidth: "600px" ,*/ maxWidth: "1000px" }}>
					<div className="w-full" style={{}}>
						{/* top */}
						<div className="m-3 lg:m-10 lg:p-0 lg:px-2">
							<div className="flex gap-10">
								<div
									style={
										{
											/* marginInline: "4.5rem" */
										}
									}>
									<Image
										alt=""
										src={"/api/media/default_profile.png"}
										width={130}
										height={130}
										className="cursor-pointer rounded-full"
									/>
								</div>
								<div className="space-y-5">
									<div className="hidden items-center lg:flex lg:gap-5">
										<p className="m-0 text-xl font-medium">
											{profile.username}
										</p>

										{user?.id_user === profile.id_user ? (
											<div className="flex gap-2">
												<Link
													type="button"
													href={"/settings"}
													className="cursor-pointer rounded-md bg-white px-4 py-1 text-sm font-bold text-black">
													Edit profile
												</Link>
												<div
													style={{ width: "30px" }}
													className="hidden lg:block"
													onClick={() => setSettings(true)}>
													<SettingsIcon className="cursor-pointer" />
													{settings ? (
														<SettingsPopUp
															settings={settings}
															setSettings={setSettings}
														/>
													) : null}
												</div>
											</div>
										) : (
											<>
												{!user?.following.includes(profile.id_user) ? (
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
												<button
													type="button"
													onClick={() => message()}
													className="cursor-pointer rounded-md bg-white px-4 py-1 text-sm font-bold text-black">
													Message
												</button>
											</>
										)}
									</div>
									<div className="flex gap-10">
										<span className="flex flex-col items-center lg:block">
											<span className="font-bold">{profile.post_count}</span>{" "}
											post
										</span>
										<span
											className="flex cursor-pointer flex-col items-center lg:block"
											// onClick={() => {
												// fetch("accounts/followers/");
											// }}
											>
											<span className="font-bold">
												{profile.followers?.length}
											</span>{" "}
											followers
										</span>
										<span className="flex cursor-pointer flex-col items-center lg:block">
											<span className="font-bold">
												{profile.following?.length}
											</span>{" "}
											following
										</span>
									</div>
									<div className="hidden lg:block">
										<p className="font-bold">
											{profile.first_name + " " + profile.last_name}
										</p>
										<p className="text-sm">{profile.first_name}</p>
									</div>
								</div>
							</div>
							{/* edit and share buttom on small screen */}
							<div className="flex w-full items-center lg:hidden">
								{user?.id_user === profile.id_user ? (
									<div className="flex w-full justify-around gap-2 lg:block">
										<Link
											type="button"
											href={"/settings"}
											className="flex w-36 cursor-pointer justify-center rounded-md bg-nero py-1 text-sm font-bold text-primaryText">
											Edit profile
										</Link>
										<Link
											type="button"
											href={"/settings"}
											className="flex w-36 cursor-pointer justify-center rounded-md bg-nero py-1 text-sm font-bold text-primaryText">
											Share profile
										</Link>

										<Link
											type="button"
											href={"/settings"}
											className="cursor-pointer rounded-md bg-nero px-2 py-1 text-sm font-bold text-primaryText">
											<DiscoverPeople />
										</Link>
									</div>
								) : null}
							</div>
						</div>
						<hr className="" style={{ borderColor: "#363837" }} />
						{/* bottom */}
						<div>
							<div
								className="flex w-full justify-center"
								style={{ height: "fit-content" }}>
								<div className="flex gap-12 text-sm">
									<div
										style={PostStyle}
										onClick={() => {
											setPost(true);
											setSaved(false);
											setTagged(false);
										}}>
										POSTS
									</div>
									<div
										style={SavedStyle}
										onClick={() => {
											setPost(false);
											setSaved(true);
											setTagged(false);
										}}>
										SAVED
									</div>
									<div
										style={TaggedStyle}
										onClick={() => {
											setPost(false);
											setSaved(false);
											setTagged(true);
										}}>
										TAGGED
									</div>
								</div>
							</div>
							<div className="grid w-full justify-between gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
								{post ? (
									<Posts
										otherUser={
											user?.username !== profile.username
												? profile.username
												: undefined
										}
									/>
								) : null}
								{saved ? <Saved /> : null}
								{tagged ? <Tagged /> : null}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
}

export default Profile;
