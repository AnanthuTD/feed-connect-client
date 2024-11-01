"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useUserContext } from "../../components/context/userContext";
import axios from '@/lib/axios';
import Link from "next/link";
import { Button } from "antd";

function Settings() {
	// useState
	const [bio, setBio] = useState("");
	const [website, setWebsite] = useState("");
	const [gender, setGender] = useState("");

	// context
	const { user, setUser } = useUserContext();

	async function handleSubmit(): Promise<void> {
		try {

			const response = await axios.post(
				"api/accounts/profile/",
				{
					website: website,
					bio: bio,
					gender: gender,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			// Handle the response data here if needed
		} catch (error) {
			console.error("Error during Axios request:", error);
			// Handle the error here
		}
	}

	useEffect(() => {
		if (!user) return;
		setBio(user.bio);
		setWebsite(user.website);
		setGender(user.gender);
	}, []);

	useEffect(() => {}, []);

	return (
		<>
			<main className="h-full w-full">
				<div className="w-full" style={{ height: "10%" }}>
					<span className="text-2xl font-bold text-white">Settings</span>
				</div>
				<div className="flex h-full w-full items-center justify-center">
					<div className="flex h-4/5 w-5/12 flex-col items-center justify-center">
						<div className="h-full w-full space-y-10">
							<div className="h-fit w-full p-3 text-2xl">
								<div className="flex w-1/5 justify-end">Edit profile</div>
							</div>
							<div>
								<div className="flex space-x-10">
									<div className="flex w-1/5 justify-end">
										<Image
											src="/images/pro-pic.jpg"
											width={40}
											height={40}
											alt=""
											className="aspect-square rounded-full"
											style={{
												height: "40px",
												width: "40px",
											}}
										/>
									</div>
									<div className="w-3/5">
										<p className="flex items-center text-sm">username</p>
										<button className="bg-transparent text-brightBlue">
											Change profile photo
										</button>
									</div>
								</div>
								<div className="mt-5 space-y-3">
									<div className="flex space-x-10">
										<aside className="flex w-1/5 justify-end">
											<label htmlFor="website" className="font-extrabold">
												Website
											</label>
										</aside>
										<div className="w-3/5">
											<input
												className="w-full rounded border bg-transparent p-1"
												type="url"
												name="website"
												id=""
												placeholder="website"
												onChange={(e) => setWebsite(e.target.value)}
												value={website}
											/>
										</div>
									</div>
									<div className="flex space-x-10">
										<aside className="flex w-1/5 justify-end">
											<label htmlFor="bio" className="font-extrabold">
												Bio
											</label>
										</aside>
										<div className="w-3/5">
											<textarea
												className="w-full rounded border bg-transparent p-1"
												name="bio"
												id=""
												placeholder="Bio"
												onChange={(e) => setBio(e.target.value)}
												value={bio}
											/>
										</div>
									</div>
									<div className="flex space-x-10">
										<aside className="flex w-1/5 justify-end">
											<label htmlFor="website" className="font-extrabold">
												Gender
											</label>
										</aside>
										<div className="w-3/5">
											<input
												className="w-full rounded border bg-transparent p-1"
												type="text"
												name="gender"
												id=""
												placeholder="Gender"
												onChange={(e) => setGender(e.target.value)}
												value={gender}
											/>
										</div>
									</div>
									<div className="flex space-x-10">
										<aside className="flex w-1/5 justify-end"></aside>
										<div className="w-3/5">
											<button
												type="submit"
												name="profile"
												className="rounded-lg bg-brightBlue px-3 text-white"
												onClick={() => handleSubmit()}>
												submit
											</button>
										</div>
									</div>
									<Link href={'/interest'}><Button type="primary">Edit Interests</Button></Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}

export default Settings;
