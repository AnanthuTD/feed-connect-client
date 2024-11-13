import { useState, useRef, useEffect } from "react";
import SmileIcon from "@/app/components/icons/smileIcon";
import PictureAndVideo from "./pictureAndVideo";
import AvatarUsername from "../../components/avatar_username";
import LocationIcon from "./locationIcon";
import Preview from "./preview";
import React from "react";
import { Checkbox } from "antd";
import { gql, useMutation } from "@apollo/client";

// Define two mutations for post and story
const CREATE_POST_MUTATION = gql`
	mutation createPost(
		$file: Upload!
		$caption: String
		$location: String
		$isPrivate: Boolean
	) {
		createPost(
			file: $file
			caption: $caption
			location: $location
			isPrivate: $isPrivate
		) {
			id
		}
	}
`;

const CREATE_STORY_MUTATION = gql`
	mutation createStory(
		$file: Upload!
		$caption: String
		$location: String
		$isPrivate: Boolean
	) {
		createStory(
			file: $file
			caption: $caption
			location: $location
			isPrivate: $isPrivate
		) {
			id
		}
	}
`;

function Post({
	setCreate,
	post,
	stories,
}: {
	setCreate: React.Dispatch<React.SetStateAction<boolean>>;
	post: boolean;
	stories: boolean;
}) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [caption, setCaption] = useState("");
	const [location, setLocation] = useState("");
	const [privatePost, setPrivatePost] = useState(false);
	const [submit, setSubmit] = useState(false);

	// Choose the mutation based on whether it's a post or a story
	const [uploadFileMutation] = useMutation(
		post ? CREATE_POST_MUTATION : CREATE_STORY_MUTATION
	);

	// refs
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const formSubmitRef = useRef<HTMLFormElement | null>(null);
	const titleRef = useRef<HTMLDivElement | null>(null);
	const boxRef = useRef<HTMLDivElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);

	// handle file input
	const handleClick = () => {
		if (fileInputRef.current) fileInputRef.current.click();
	};

	const handleFileInputChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		if (event.target.files && event.target.files.length > 0) {
			setSelectedFile(event.target.files[0]);
		}
	};

	// Preview the file
	useEffect(() => {
		if (selectedFile) {
			let reader = new FileReader();
			reader.onload = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(selectedFile);
		}
	}, [selectedFile]);

	// Handle submission to GraphQL API
	useEffect(() => {
		async function submitContent() {
			if (selectedFile) {
				try {
					const { data } = await uploadFileMutation({
						variables: {
							file: selectedFile,
							caption,
							location,
							isPrivate: privatePost,
						},
					});

					if (data.createPost?.id || data.createStory?.id) {
						setCreate(false); // Successfully posted or story created
					} else {
						console.error("Error: Content creation failed");
					}
				} catch (error) {
					console.error("Error while uploading file:", error);
				}
			}
		}

		if (selectedFile && submit) {
			console.log(selectedFile, submit)
			submitContent();
		}
	}, [
		submit,
		selectedFile,
		caption,
		location,
		privatePost,
		uploadFileMutation,
	]);

	useEffect(() => {
		if (!boxRef.current?.clientHeight) return;
		const observer = new ResizeObserver((entries) => {
			if (
				!boxRef.current?.clientHeight ||
				!titleRef.current?.clientHeight ||
				!contentRef.current?.clientHeight
			)
				return;
			contentRef.current.style.height = `${
				boxRef.current.clientHeight - titleRef.current.clientHeight
			}px`;
		});

		observer.observe(boxRef.current);

		// Cleanup function to disconnect the observer
		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<div className="h-full" ref={boxRef}>
			{/* header */}
			<div
				className="flex w-full justify-center border-b p-3 font-bold text-white"
				style={{ borderColor: "#3d3d3d" }}
				ref={titleRef}>
				<div className="w-1/4"></div>
				<div className="flex w-2/4 items-center justify-center">
					Create new {post ? "post" : "story"}
				</div>
				<div className="flex w-1/4 justify-end">
					{selectedFile && (
						<button
							className="rounded p-1 text-sm text-blue-500"
							onClick={() => setSubmit(!submit)}
						>
							Next
						</button>
					)}
				</div>
			</div>

			{/* content */}
			<div
				className={["flex", !selectedFile ? "aspect-square" : ""].join(" ")}
				ref={contentRef}>
				<div className="relative flex aspect-square h-full w-full justify-center overflow-hidden">
					{!selectedFile ? (
						<div className="flex flex-col items-center justify-center space-y-3">
							<PictureAndVideo fill="white" />
							<p>Drag photos and videos here</p>
							<button
								className="rounded-lg bg-blue-500 p-2 text-sm font-bold text-white"
								onClick={handleClick}
							>
								Select from computer
							</button>
							<form
								ref={formSubmitRef}
								style={{ visibility: "hidden" }}
								encType="multipart/form-data"
							>
								<input
									ref={fileInputRef}
									type="file"
									name="Select from computer"
									onChange={handleFileInputChange}
								/>
							</form>
						</div>
					) : preview ? (
						<Preview
							preview={preview}
							name={selectedFile.name}
							type={selectedFile.type}
						/>
					) : null}
				</div>

				{selectedFile && (
					<div
						className="space-y-3 border-l p-3"
						style={{ borderColor: "#3d3d3d" }}
					>
						<AvatarUsername
							height={30}
							width={30}
							className="text-sm font-bold text-white"
						/>
						<textarea
							name="caption"
							id="caption"
							cols={30}
							rows={10}
							placeholder="Write a caption..."
							className="resize-none bg-transparent outline-none"
							onChange={(e) => setCaption(e.target.value)}
						></textarea>
						<SmileIcon width={20} height={20} />
						<div className="flex justify-between">
							<input
								type="text"
								placeholder="Add location"
								className="border-none bg-transparent outline-none"
								onChange={(e) => setLocation(e.target.value)}
							/>
							<span>
								<LocationIcon />
							</span>
						</div>
						<div className="py-5">
							<Checkbox onChange={() => setPrivatePost(!privatePost)}>
								Private
							</Checkbox>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default Post;
