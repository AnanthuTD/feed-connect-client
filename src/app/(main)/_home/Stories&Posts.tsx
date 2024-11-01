"use client";
import { useEffect, useState } from "react";
import Post from "./post/post";
import Stories from "./stories/stories";
import React from "react";
import { PostsInterface } from "@/utils/Interfaces";
import axios from "@/lib/axios";

function StoriesPosts() {
	const [posts, setPosts] = useState<PostsInterface[] | undefined>(undefined);

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await axios.get("/api/post/allPost");
				const data = response.data;
				setPosts(data.posts);
			} catch (error) {
				console.error("Error during Axios request:", error);
				console.error(
					"An error occurred while fetching data. Please try again later."
				);
			}
		}

		fetchData();
	}, []);

	return (
		<>
			<div className="w-full">
				{/* stories */}
				<div className="h-fit">
					<Stories />
				</div>
				{/* posts */}
				<div id="post" className="mt-5 flex items-center flex-col">
					{posts?.map((post) => (
						<Post post={post} key={post.id} />
					))}
				</div>
			</div>
		</>
	);
}

export default StoriesPosts;
