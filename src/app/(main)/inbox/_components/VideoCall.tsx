import React, { useState } from "react";
import { VideoCameraAddOutlined } from "@ant-design/icons";
import VideoCallModal from "./videoCallModal";

function VideoCall({userId}: {userId: string}) {
	const [isOpen, setIsOpen] = useState(true);

	const handleOpen = () => {
		setIsOpen(true);
	};

	const handleClose = () => {
		setIsOpen(false);
	};

	return (
		<>
			<VideoCameraAddOutlined style={{ fontSize: 25 }} onClick={handleOpen} />

			{isOpen && <VideoCallModal userId={userId} open={isOpen} onClose={handleClose} />}
		</>
	);
}

export default VideoCall;
