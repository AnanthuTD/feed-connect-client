"use client";

import { JSX, useEffect, useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserContext } from "../../components/context/userContext";
import Image from "next/image";
import Link from "next/link";
import Posts from "./components/posts";
import Saved from "./components/saved";
import Tagged from "./components/tagged";
import CreateIcon from "@/app/components/icons/Create";
import OptionIcon from "@/app/components/icons/OptionIcon";
import ChevronY from "@/app/components/icons/ChevronY";
import DiscoverPeople from "@/app/components/icons/DiscoverPeople";
import SettingsPopUp from "./components/settings";
import SettingsIcon from "../../components/icons/settings";

const GET_PROFILE = gql`
	query GetProfile($username: String!) {
		userProfile(username: $username) {
			id
			username
			fullName
			bio
			avatar
			followedBy {
				id
			}
			following {
				id
			}
			postCount
		}
	}
`;

const CURRENT_USER_PROFILE = gql`
	query {
		user {
			id
			username
			fullName
			bio
			avatar
			following {
				id
			}
			followedBy {
				id
			}
			postCount
		}
	}
`;

const FOLLOW_USER = gql`
	mutation FollowUser($id: ID!) {
		followUser(id: $id) {
			status
			user {
				id
				following {
					id
				}
			}
		}
	}
`;

const UNFOLLOW_USER = gql`
	mutation UnfollowUser($id: ID!) {
		unfollowUser(id: $id) {
			status
			user {
				id
				following {
					id
				}
			}
		}
	}
`;

// TypeScript types
interface User {
	id: string;
	username: string;
	fullName: string;
	bio: string | null;
	avatar: string | null;
	followedBy: { id: string }[];
	following: { id: string }[];
	postCount: number;
}

interface ProfileData {
	userProfile?: User;
	user?: User;
}

type Tab = "posts" | "saved" | "tagged";

const Profile = () => {
	const [activeTab, setActiveTab] = useState<Tab>("posts");
	const [profile, setProfile] = useState<User | null>(null);
	const [settings, setSettings] = useState(false);
	const { user } = useUserContext();
	const router = useRouter();
	const username = useSearchParams().get("username") || "";

	const { data, loading, error, refetch } = useQuery<ProfileData>(
		username ? GET_PROFILE : CURRENT_USER_PROFILE,
		{ variables: username ? { username } : undefined }
	);

	const [followUser] = useMutation(FOLLOW_USER, {
		onCompleted: () => refetch(),
	});
	const [unfollowUser] = useMutation(UNFOLLOW_USER, {
		onCompleted: () => refetch(),
	});

	useEffect(() => {
		setProfile(data?.userProfile || data?.user || null);
	}, [data]);

	if (loading) return <div className="text-white">Loading...</div>;
	if (error) return <div className="text-red-500">Error loading profile.</div>;
	if (!profile) return <div className="text-gray-400">No user found!</div>;

	const isCurrentUser = profile.id === user?.id;
	const isFollowing = user
		? profile?.following?.some((f) => f.id === user.id)
		: false;

	const tabs: Record<Tab, JSX.Element> = {
		posts: <Posts userId={profile.id} />,
		saved: <Saved />,
		tagged: <Tagged />,
	};

	const tabClass = (isActive: boolean) =>
		`text-sm cursor-pointer py-2 px-4 ${
			isActive ? "text-white border-t-2 border-white" : "text-gray-400"
		}`;

	return (
		<div className="flex w-full justify-center bg-black max-lg:flex-col">
			<div className="flex w-full justify-between bg-black p-3 lg:hidden">
				<div className="flex gap-2">
					<span className="font-bold text-white">{profile.username}</span>
					<ChevronY type="down" />
				</div>
				<div className="flex gap-5">
					<CreateIcon />
					<OptionIcon />
				</div>
			</div>
			<div
				className="flex w-full bg-black max-lg:overflow-y-auto"
				style={{ maxWidth: "1000px" }}
			>
				<div className="w-full">
					<div className="m-3 lg:m-10 lg:p-0 lg:px-2">
						<div className="flex gap-10">
							<Image
								src={profile.avatar || "/default_profile.png"}
								alt={`${profile.username}'s avatar`}
								width={130}
								height={130}
								className="rounded-full"
							/>
							<div className="text-white space-y-5">
								<div className="hidden items-center lg:flex lg:gap-5">
									<h1 className="text-xl font-bold">{profile.username}</h1>
									{isCurrentUser ? (
										<div className="flex gap-2">
											<Link
												href={"/settings"}
												className="cursor-pointer rounded-md bg-white px-4 py-1 text-sm font-bold text-black"
											>
												Edit profile
											</Link>
											<div
												style={{ width: "30px" }}
												onClick={() => setSettings(true)}
											>
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
											{isFollowing ? (
												<button
													onClick={() =>
														unfollowUser({ variables: { id: profile.id } })
													}
													className="rounded-md bg-white px-4 py-1 text-sm font-bold text-black"
												>
													Unfollow
												</button>
											) : (
												<button
													onClick={() =>
														followUser({ variables: { id: profile.id } })
													}
													className="rounded-md bg-white px-4 py-1 text-sm font-bold text-black"
												>
													Follow
												</button>
											)}
											<button
												onClick={() =>
													router.push(`/inbox/?id_user=${profile.id}`)
												}
												className="rounded-md bg-white px-4 py-1 text-sm font-bold text-black"
											>
												Message
											</button>
										</>
									)}
								</div>
								<div className="flex gap-10">
									<p>
										<strong>{profile.postCount}</strong> posts
									</p>
									<p>
										<strong>{profile.followedBy.length}</strong> followers
									</p>
									<p>
										<strong>{profile.following.length}</strong> following
									</p>
								</div>
								<p className="text-gray-400">{profile.bio}</p>
							</div>
						</div>
						<hr className="border-gray-700 my-5" />
						<div className="flex w-full max-w-3xl justify-around">
							{Object.keys(tabs).map((tab) => (
								<div
									key={tab}
									className={tabClass(activeTab === tab)}
									onClick={() => setActiveTab(tab)}
								>
									{tab.toUpperCase()}
								</div>
							))}
						</div>
						<div className="grid w-full justify-between gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
							{tabs[activeTab]}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
