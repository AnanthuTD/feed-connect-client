import React from "react";
import { Button } from "antd";
import {
	AudioOutlined,
	AudioMutedOutlined,
	VideoCameraOutlined,
	PhoneOutlined,
} from "@ant-design/icons";

const FooterControls = ({
	isAudioMuted,
	isVideoMuted,
	onToggleAudio,
	onToggleVideo,
	onEndCall,
}: {
	isAudioMuted: boolean;
	isVideoMuted: boolean;
	onToggleAudio: () => void;
	onToggleVideo: () => void;
	onEndCall: () => void;
}) => (
	<div className="flex justify-center gap-5">
		<Button
			shape="round"
			danger={isAudioMuted}
			icon={isAudioMuted ? <AudioMutedOutlined /> : <AudioOutlined />}
			onClick={onToggleAudio}
		/>
		<Button
			shape="round"
			danger={isVideoMuted}
			icon={<VideoCameraOutlined />}
			onClick={onToggleVideo}
		/>
		<Button
			shape="round"
			danger
			icon={<PhoneOutlined rotate={225} />}
			onClick={onEndCall}
		/>
	</div>
);

export default FooterControls;
