import React from "react";
import { useEffect, useState } from "react";
import Media from "./Media";
import { Post } from "@/utils/Interfaces";
import axios from '@/lib/axios';

interface postsInterface {
	status: boolean;
	posts: Post[];
}

function Posts({ otherUser }: { otherUser: string | undefined }) {
	const [posts, setPosts] = useState<any[]>([]);
	const [data, setData] = useState<postsInterface | null>(null);
	const [initial, setInitial] = useState(true);

	async function fetchData() {
		setInitial(false);
		let url = "/api/post";
		if (otherUser) url = `api/post/${otherUser}/posts/`;

		try {
			const response = await axios.get(url);

			const data = response.data;

			if (data.status === true) {
				setData(data);
			}
		} catch (error) {
			console.error("Error during Axios request:", error);
			// Handle the error here
		}
	}

	if (initial) fetchData();

	useEffect(() => {
		if (data?.posts) {
			setPosts(data.posts);
		}
	}, [data]);

	return (
		<>
			{posts ? posts.map((post) => <Media post={post} key={post.id} />) : null}
		</>
	);
}

export default Posts;
