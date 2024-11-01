"use client";
import React, { useEffect, useState, use } from "react";
import { Avatar, Divider, Button, Card, Row, Col, Typography } from "antd";
import { HeartOutlined, MessageOutlined } from "@ant-design/icons";
import Image from "next/image";
import "./styles.css";
import axiosInstance from "@/lib/axios";

const { Title, Text } = Typography;

interface PostsByHashTagProps {
	params: {
		hashtag: string;
	};
}

interface Posts {
	id: string;
	file_name: string;
	likes: number;
	comments: number;
}
const PostsByHashTag: React.FC<PostsByHashTagProps> = props => {
    const params = use(props.params);
    const [posts, setPosts] = useState<Posts[]>([]);

    async function fetchPosts() {
		const { data } = await axiosInstance.get(
			`/api/search/${params.hashtag}/hashtag`
		);
		setPosts(data.posts);
	}

    useEffect(() => {
		fetchPosts();
	}, []);

    return (
		<div className="w-full">
			<Row
				justify="space-between"
				align="middle"
				style={{ marginBottom: 16 }}
				gutter={[16, 16]}
			>
				<Col>
					<Avatar src="/avatar.jpg" size={150} />
				</Col>
				<Col flex="auto">
					<Row>
						<Title level={1} style={{ marginRight: 8 }}>
							# {params.hashtag}
						</Title>
					</Row>
					<Row>
						<Text style={{ marginRight: 8 }}>{posts.length}</Text>
					</Row>
					<Row>
						<Text style={{ marginRight: 8 }}>Posts</Text>
					</Row>
					<Row>
						<Button type="primary" style={{ width: "100%" }}>
							Follow
						</Button>
					</Row>
				</Col>
			</Row>
			<Divider />
			<Row gutter={[16, 16]}>
				{posts.map((post) => (
					<Col key={post.id} xs={24} sm={12} md={8} lg={8} xl={8}>
						<Card
							// bodyStyle={{ padding: 0 }}
							styles={{body:{
								padding:'0',
							}}}
							hoverable
							className="post-card"
						>
							<div className="image-wrapper">
									<Image
										src={`/api${post.file_name}`}
										alt="Post"
										layout="responsive"
										width={400}
										height={300}
										className="rounded-md"
									/>
									<div className="overlay">
										<div className="overlay-content flex gap-16">
											<div>
												<HeartOutlined
													style={{ fontSize: "large" }}
												/>
												<span style={{ paddingLeft: 8 }}>
													{post.likes}
												</span>
											</div>
											<div>
												<MessageOutlined
													style={{ fontSize: "large" }}
												/>
												<span style={{ paddingLeft: 8 }}>
													{post.comments}
												</span>
											</div>
										</div>
									</div>
								</div>
						</Card>
					</Col>
				))}
			</Row>
		</div>
	);
};

export default PostsByHashTag;
