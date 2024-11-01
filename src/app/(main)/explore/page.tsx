"use client";
import React, { useEffect, useState, useRef } from "react";
import { Card, Modal } from "antd";
import Image from "next/image";
import ReactPlayer from "react-player";
import axios from "@/lib/axios";

interface Post {
	id: string;
	file: string;
	caption: string;
	likes: { id: string; username: string }[];
	username: string;
	type: "image" | "video";
}

const ExplorePage: React.FC = () => {
	const [posts, setPosts] = useState<Post[]>([]);
	const [selectedPost, setSelectedPost] = useState<Post | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const observer = useRef<IntersectionObserver>();
	const playerRef = useRef<ReactPlayer>(null);

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const response = await axios.get<{ posts: Post[] }>(
					"/api/post/allPost"
				);
				setPosts(response.data.posts);
			} catch (error) {
				console.error("Error fetching posts:", error);
			}
		};

		fetchPosts();
	}, []);

	useEffect(() => {
		observer.current = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const player: any = playerRef.current;
						if (player) {
							player.seekTo(0);
							player.play(); 
						}
						observer.current!.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.5 }
		);

		return () => observer.current?.disconnect();
	}, []);

	const handleCardClick = (post: Post) => {
		setSelectedPost(post);
		setModalVisible(true);
	};

	return (
		<div className="bg-black min-h-screen py-10">
			<div className="container mx-auto">
				<h1 className="text-white text-3xl font-semibold mb-6">Explore</h1>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{posts.map((post) => (
						<Card
							key={post.id}
							className="rounded-lg shadow-md p-4"
							onClick={() => handleCardClick(post)}
						>
							{post.type === "video" ? (
								<ReactPlayer
									url={`/api/media/${post.file}`}
									width="100%"
									height="auto"
									controls
									playing={false}
									muted
									ref={playerRef}
								/>
							) : (
								<Image
									src={`/api/media/${post.file}`}
									alt="Post"
									width={300}
									height={200}
									className="w-full rounded-lg mb-4"
								/>
							)}
						</Card>
					))}
				</div>
			</div>
			<Modal
				visible={modalVisible}
				onCancel={() => setModalVisible(false)}
				footer={null}
				width={800}
			>
				{selectedPost && selectedPost.type === "video" ? (
					<ReactPlayer
						url={`/api/media/${selectedPost.file}`}
						width="100%"
						height="auto"
						controls
						playing={true}
						ref={playerRef}
					/>
				) : (
					<Image
						src={`/api/media/${selectedPost?.file}`}
						alt="Post"
						width={800}
						height={600}
						className="w-full rounded-lg mb-4"
					/>
				)}
				{selectedPost && (
					<div className="text-gray-700">
						<p>{selectedPost.caption}</p>
						{selectedPost.likes && (
							<p>Likes: {selectedPost.likes.length}</p>
						)}
						<p>Posted by: {selectedPost.username}</p>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default ExplorePage;
