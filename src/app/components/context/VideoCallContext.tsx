"use client";

import { OFFER_RECEIVED } from "@/graphql/subscription";
import { useSubscription } from "@apollo/client";
import React, {
	useEffect,
	useRef,
	useState,
} from "react";
import { Button, notification } from "antd";
import { NotificationPlacement } from "antd/es/notification/interface";
import { PhoneOutlined } from "@ant-design/icons";
import VideoCallModal from "@/app/(main)/inbox/_components/VideoCallModal";

interface CallerInfo {
	username: string;
	avatar: string;
	fullName: string;
	id: string;
}

function VideoCallContextProvider({ children }: { children: React.ReactNode }) {
	const { data: offerData } = useSubscription(OFFER_RECEIVED);
	const [api, contextHolder] = notification.useNotification();
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isCallAccepted, setIsCallAccepted] = useState(false);

	const closeNotification = () => {
		api.destroy();
	};

	const onCallEnd = () => {
		setIsCallAccepted(false);
		closeNotification();
	};

	const onAnswer = () => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}
		console.log("onAnswer");

		setIsCallAccepted(true);
		closeNotification();
	};

	const onHangup = () => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}
		console.log("onHangup");

		closeNotification();
	};

	const playRingtone = () => {
		if (audioRef.current) {
			audioRef.current.loop = true;
			audioRef.current.play().catch((error) => {
				console.error("Error playing ringtone:", error);
			});
		}
	};

	// Notification
	const openNotification = (
		placement: NotificationPlacement,
		callerInfo: CallerInfo
	) => {
		playRingtone();
		api.info({
			message: `${callerInfo?.fullName} is calling you`,
			description: "Incoming call...",
			placement,
			duration: 0,
			btn: (
				<div className="flex justify-end gap-2 mt-4">
					<Button
						type="primary"
						shape="circle"
						className="bg-green-500 hover:bg-green-600"
						icon={<PhoneOutlined />}
						onClick={onAnswer}
					/>
					<Button
						danger
						shape="circle"
						icon={<PhoneOutlined rotate={225} />}
						onClick={onHangup}
					/>
				</div>
			),
			closable: false,
		});
	};

	useEffect(() => {
		if (offerData) {
			console.log("===============================================");
			console.log("offerData received...", offerData);
			console.log("===============================================");

			openNotification("topRight", offerData?.offerReceived?.callerInfo);
		}
	}, [offerData]);

	return (
		<>
			{/* play ringtone when a new call is received */}
			<audio ref={audioRef} src="/audio/ringtone.mp3" />

			{/* part of notification */}
			{contextHolder}

			{/* Open video call modal on call accepted */}
			{isCallAccepted && (
				<VideoCallModal
					offerData={offerData.offerReceived}
					onClose={onCallEnd}
					calleeInfo={offerData.offerReceived.callerInfo}
					key={offerData.offerReceived.callerInfo.id}
					type="answer"
				/>
			)}

			{children}
		</>
	);
}

export default VideoCallContextProvider;
