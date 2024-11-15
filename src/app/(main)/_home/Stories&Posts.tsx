"use client";
import { useEffect, useState } from "react";
import Post from "./post/post";
import Stories from "./stories/stories";
import React from "react";
import { PostsInterface } from "@/utils/Interfaces";
import {GET_POSTS} from '@/graphql/queries'
import axios from "@/lib/axios";
import { useQuery } from "@apollo/client";

function StoriesPosts() {
	const [posts, setPosts] = useState<PostsInterface[] | undefined>([]);
	const [skip, setSkip] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const take = 10
	const { data, loading, fetchMore } = useQuery(GET_POSTS, {
        variables: { take, skip },
    })
	useEffect(() => {
        if (data?.getPosts?.posts) {
            setPosts((prev) => [...prev, ...data.getPosts.posts])
            setHasMore(data.getPosts.hasMore)
        }
    }, [data])

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
