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
import { gql, useQuery, useMutation } from "@apollo/client";
import Image from "next/image";
import DiscoverPeople from "@/app/components/icons/DiscoverPeople";
import CreateIcon from "@/app/components/icons/Create";
import OptionIcon from "@/app/components/icons/OptionIcon";
import ChevronY from "@/app/components/icons/ChevronY";

// GraphQL Queries and Mutations
const GET_PROFILE = gql`
  query GetProfile($username: String!) {
    userProfile(username: $username) {
      id
      username
      firstName
      lastName
      bio
      profilePicture
      followers {
        id
        username
      }
      following {
        id
        username
      }
      postCount
      posts {
        id
        caption
        fileUrl
        location
      }
    }
  }
`;

const CURRENT_USER_PROFILE = gql`
  query {
    currentUserProfile {
      id
      username
      following {
        id
      }
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

function Profile() {
  const [post, setPost] = useState(true);
  const [saved, setSaved] = useState(false);
  const [tagged, setTagged] = useState(false);
  const [settings, setSettings] = useState(false);

  const { user, setUser } = useUserContext();
  const router = useRouter();
  const username = useSearchParams().get("username") || user?.username || "";

  // Fetch Profile Data
  const { data: profileData, loading: profileLoading, refetch } = useQuery(
    username ? GET_PROFILE : CURRENT_USER_PROFILE,
    {
      variables: username ? { username } : undefined,
      skip: !username,
    }
  );

  // Follow/Unfollow Mutations
  const [followUser] = useMutation(FOLLOW_USER, {
    onCompleted: () => refetch(),
  });

  const [unfollowUser] = useMutation(UNFOLLOW_USER, {
    onCompleted: () => refetch(),
  });

  if (profileLoading) return <div>Loading...</div>;

  const profile = username
    ? profileData?.userProfile
    : profileData?.currentUserProfile;

  const isCurrentUser = profile?.id === user?.id;
  const isFollowing = user?.following.some((f) => f.id === profile?.id);

  // Styling logic
  const tabStyle = (active: boolean) => ({
    color: active ? "white" : "gray",
    borderTopColor: active ? "white" : "",
    borderTop: active ? "solid 0.1px" : "",
    cursor: "pointer",
    padding: "10px",
  });

  // Follow/unfollow logic
  const handleFollow = () => {
    if (profile?.id) followUser({ variables: { id: profile.id } });
  };

  const handleUnfollow = () => {
    if (profile?.id) unfollowUser({ variables: { id: profile.id } });
  };

  const message = () => {
    if (!isCurrentUser && profile?.id) {
      router.push(`/inbox/?id_user=${profile.id}`);
    }
  };

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
        style={{ maxWidth: "1000px" }}
      >
        <div className="w-full">
          {/* Profile Header */}
          <div className="m-3 lg:m-10 lg:p-0 lg:px-2">
            <div className="flex gap-10">
              <Image
                alt=""
                src={profile.profilePicture || "/api/media/default_profile.png"}
                width={130}
                height={130}
                className="cursor-pointer rounded-full"
              />
              <div className="space-y-5">
                <div className="hidden items-center lg:flex lg:gap-5">
                  <p className="m-0 text-xl font-medium">{profile.username}</p>
                  {isCurrentUser ? (
                    <Link
                      href="/settings"
                      className="cursor-pointer rounded-md bg-white px-4 py-1 text-sm font-bold text-black"
                    >
                      Edit profile
                    </Link>
                  ) : (
                    <>
                      {isFollowing ? (
                        <button
                          onClick={handleUnfollow}
                          className="cursor-pointer rounded-md bg-white px-4 py-1 text-sm font-bold text-black"
                        >
                          Unfollow
                        </button>
                      ) : (
                        <button
                          onClick={handleFollow}
                          className="cursor-pointer rounded-md bg-white px-4 py-1 text-sm font-bold text-black"
                        >
                          Follow
                        </button>
                      )}
                      <button
                        onClick={message}
                        className="cursor-pointer rounded-md bg-white px-4 py-1 text-sm font-bold text-black"
                      >
                        Message
                      </button>
                    </>
                  )}
                </div>
                <div className="flex gap-10">
                  <span>
                    <strong>{profile.postCount}</strong> posts
                  </span>
                  <span>
                    <strong>{profile.followers.length}</strong> followers
                  </span>
                  <span>
                    <strong>{profile.following.length}</strong> following
                  </span>
                </div>
              </div>
            </div>
          </div>
          <hr className="border-gray-700" />
          {/* Profile Tabs */}
          <div className="grid gap-4">
            {post && <Posts posts={profile.posts} />}
            {saved && <Saved />}
            {tagged && <Tagged />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

