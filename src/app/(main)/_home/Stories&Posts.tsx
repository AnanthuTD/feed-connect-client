"use client";
import React, { useEffect, useState, useCallback } from "react";
import Post from "./post/post";
import Stories from "./stories/stories";
import { PostsInterface } from "@/utils/Interfaces";
import { GET_POSTS } from "@/graphql/queries";
import { useQuery } from "@apollo/client";

function StoriesPosts() {
	const [posts, setPosts] = useState<PostsInterface[]>([]);
	const [skip, setSkip] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const take = 10;

	// GraphQL query to fetch posts
	const { data, loading, fetchMore } = useQuery(GET_POSTS, {
		variables: { take, skip },
	});

	// Append new posts when `data` changes
	useEffect(() => {
		if (data?.getPosts?.posts) {
			setPosts((prev) => [...prev, ...data.getPosts.posts]);
			setHasMore(data.getPosts.hasMore);
		}
	}, [data]);

	// Update `skip` based on the number of loaded posts
	useEffect(() => {
		setSkip(posts?.length);
	}, [posts]);

	// Fetch more posts when near the bottom of the container
	const handleScroll = useCallback(() => {
		if (loading || !hasMore) return;

		const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
		const scrollThreshold = document.documentElement.offsetHeight - 500; // Trigger fetch 500px before the bottom

		if (scrollPosition >= scrollThreshold) {
			fetchMore({
				variables: { take, skip },
			});
		}
	}, [loading, hasMore, fetchMore, skip]);

	// Attach scroll event listener
	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	return (
		<div className="w-full">
			{/* Stories */}
			<div className="h-fit">
				<Stories />
			</div>
			{/* Posts */}
			<div id="post" className="mt-5 flex flex-col items-center">
				{posts?.map((post) => (
					<Post post={post} key={post.id} />
				))}
				{/* Loader */}
				{loading && (
					<div className="my-5 text-gray-500">
						Loading more posts...
					</div>
				)}
				{/* No more posts */}
				{!hasMore && !loading && (
					<div className="my-5 text-gray-500">
						You have reached the end!
					</div>
				)}
			</div>
		</div>
	);
}

export default StoriesPosts;
