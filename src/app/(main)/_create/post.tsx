import { useState, useRef, useEffect } from "react";
import SmileIcon from "@/app/components/icons/smileIcon";
import PictureAndVideo from "./pictureAndVideo";
import AvatarUsername from "../../components/avatar_username";
import LocationIcon from "./locationIcon";
import Preview from "./preview";
import React from "react";
import axios from "@/lib/axios";
import { Checkbox } from "antd";

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
	const [formData, setFormData] = useState<FormData>(new FormData());
	const [location, setLocation] = useState("");
	const [caption, setCaption] = useState("");
	const [submit, setSubmit] = useState(true);
	const [fileAdded, setFileAdded] = useState(false);
	const [privatePost, setPrivatePost] = useState(false);

	// ref
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const formSubmitRef = useRef<HTMLFormElement | null>(null);
	const titleRef = useRef<HTMLDivElement | null>(null);
	const boxRef = useRef<HTMLDivElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);

	const url = post ? "/api/post" : "/api/post/story";

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

	useEffect(() => {
		async function postData() {
			try {

				const response = await axios.post(url, formData, {
					withCredentials: true, // include credentials
				});

				if (response.status === 408) {
					postData(); // Retry on timeout if necessary
					return;
				}

				const data = response.data;

				if (data.status === true) {
					setCreate(false);
				} else {
					console.error("posting failed");
				}
			} catch (error) {
				console.error("Error during Axios request:", error);
				console.error(
					"An error occurred while sending data. Please try again later."
				);
			}
		}

		if (selectedFile && !formData.has("file")) {
			setFileAdded(true);
			formData.append("file", selectedFile);
			return;
		}

		if (formData.has("file")) {
			formData.append("caption", caption);
			formData.append("location", location);
			formData.append("private", privatePost);

			// Posting data to server using Axios
			postData();
		}
	}, [submit, formData]);

	useEffect(() => {}, [formData]);

	useEffect(() => {
		if (selectedFile) {
			let reader = new FileReader();
			reader.onload = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(selectedFile);
		}
	}, [selectedFile]);

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
					Create new post
				</div>
				<div className="flex w-1/4 justify-end">
					{selectedFile ? (
						<button
							className="rounded p-1 text-sm text-blue-500"
							onClick={() => setSubmit(!submit)}>
							Next
						</button>
					) : null}
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
								onClick={handleClick}>
								Select from computer
							</button>
							<form
								ref={formSubmitRef}
								className=""
								style={{ visibility: "hidden" }}
								encType="multipart/form-data">
								<input
									ref={fileInputRef}
									type="file"
									name="Select from computer"
									onChange={handleFileInputChange}
								/>
							</form>
						</div>
					) : // Video preview

					preview ? (
						<Preview
							preview={preview}
							name={selectedFile.name}
							type={selectedFile.type}
						/>
					) : null}
				</div>
				{fileAdded ? (
					<div
						className="space-y-3 border-l p-3"
						style={{
							borderColor: "#3d3d3d",
						}}>
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
							required={false}
							onChange={(e) => setCaption(e.target.value)}></textarea>
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
							<Checkbox onChange={()=>setPrivatePost(!privatePost)}>Private</Checkbox>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}

export default Post;
