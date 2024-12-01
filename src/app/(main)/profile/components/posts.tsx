import React, { useEffect, useState, useCallback } from "react";
import Media from "./Media";
import { gql, useQuery } from "@apollo/client";
import { Post } from "@/utils/Interfaces";

interface PostsProps {
	userId?: string;
}

const GET_POSTS = gql`
	query getPosts($id: ID, $take: Int, $skip: Int) {
		posts(id: $id, take: $take, skip: $skip) {
			posts {
				id
				caption
				file
				location
			}
			totalCount
			hasMore
		}
	}
`;

const Posts: React.FC<PostsProps> = ({ userId }) => {
	const [posts, setPosts] = useState<Post[]>([]);
	const [skip, setSkip] = useState(0);
	const take = 10; // Number of posts to fetch per query

	// Fetch posts with Apollo
	const { data, loading, error, fetchMore } = useQuery(GET_POSTS, {
		variables: { id: userId, take, skip: 0 }, // Initial fetch
		skip: !userId, // Skip query if userId is undefined
		fetchPolicy: "cache-and-network",
	});

	// Load more posts
	const loadMorePosts = useCallback(() => {
		if (!data?.posts.hasMore || loading) return; // Prevent unnecessary fetches

		fetchMore({
			variables: { id: userId, take, skip: posts.length },
		}).then((newData) => {
			setPosts((prevPosts) => [...prevPosts, ...newData.data.posts.posts]);
			setSkip(posts.length + take);
		});
	}, [data, loading, fetchMore, posts.length, userId]);

	// Update posts when initial data loads
	useEffect(() => {
		if (data?.posts.posts) {
			setPosts(data.posts.posts);
		}
	}, [data]);

	// Infinite scroll handler
	useEffect(() => {
		const handleScroll = () => {
			if (
				window.innerHeight + document.documentElement.scrollTop >=
				document.documentElement.offsetHeight - 100
			) {
				loadMorePosts();
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [loadMorePosts]);

	if (loading && posts.length === 0) return <p>Loading posts...</p>;
	if (error) return <p>Error fetching posts: {error.message}</p>;
	if (!posts.length) return <p>No posts available.</p>;

	return loading ? (
		<p>Loading more posts...</p>
	) : (
		posts.map((post) => <Media post={post} key={post.id} />)
	);
};

export default Posts;
