"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMutation, useSubscription } from "@apollo/client";
import { useUserContext } from "@/app/components/context/userContext";
import Modal from "antd/es/modal/Modal";
import { Button, Typography } from "antd";
import {
	AudioOutlined,
	VideoCameraOutlined,
	AudioMutedOutlined,
	PhoneOutlined,
} from "@ant-design/icons";
import {
	SEND_ANSWER,
	SEND_ICE_CANDIDATE,
	SEND_OFFER,
} from "@/graphql/mutation";
import {
	ANSWER_RECEIVED,
	ICE_CANDIDATE_RECEIVED,
} from "@/graphql/subscription";

interface VideoCallModalProps {
	onClose: () => void;
	offerData: {
		offer: RTCSessionDescriptionInit;
		callerInfo: {
			username: string;
			avatar: string;
			fullName: string;
			id: string;
		};
	} | null;
	calleeInfo: {
		username: string;
		avatar: string;
		fullName: string;
		id: string;
	} | null;
}

function VideoCallModal({
	onClose,
	offerData = null,
	calleeInfo = null,
}: VideoCallModalProps) {
	const targetUserId = calleeInfo?.id;

	const myVideoRef = useRef<HTMLVideoElement>(null);
	const peerVideoRef = useRef<HTMLVideoElement>(null);

	const [peerConnection, setPeerConnection] =
		useState<RTCPeerConnection | null>(null);

	const [sendOffer] = useMutation(SEND_OFFER);
	const [sendAnswer] = useMutation(SEND_ANSWER);
	const [sendIceCandidate] = useMutation(SEND_ICE_CANDIDATE);

	const { data: answerData } = useSubscription(ANSWER_RECEIVED, {
		shouldResubscribe: true,
	});
	const { data: iceCandidateData } = useSubscription(ICE_CANDIDATE_RECEIVED);

	const audioTrackRef = useRef<MediaStreamTrack | null>(null);
	const videoTrackRef = useRef<MediaStreamTrack | null>(null);

	useEffect(() => {
		async function configurePeerConnection() {
			const pc = new RTCPeerConnection({
				iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
			});

			pc.onicecandidate = (event) => {
				if (event.candidate) {
					console.log("===============================================");
					console.log("sending ice candidate...", event.candidate);
					console.log("===============================================");

					sendIceCandidate({
						variables: {
							candidate: {
								candidate: event.candidate.candidate,
								sdpMid: event.candidate.sdpMid,
								sdpMLineIndex: event.candidate.sdpMLineIndex,
								targetUserId,
							},
						},
					});
				}
			};

			pc.ontrack = (event) => {
				if (peerVideoRef.current) {
					peerVideoRef.current.srcObject = event.streams[0];
				}
			};

			setPeerConnection(pc);

			/* get user media */
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});

			audioTrackRef.current = stream.getAudioTracks()[0];
			videoTrackRef.current = stream.getVideoTracks()[0];

			// Add tracks to the peer connection
			stream.getTracks().forEach((track) => {
				pc.addTrack(track, stream);
			});

			console.log("===============================================");
			console.log("senders...", pc?.getSenders().length);
			console.log("===============================================");

			// Set local video stream
			if (myVideoRef.current) {
				myVideoRef.current.srcObject = stream;
			}
		}

		configurePeerConnection();
	}, [sendIceCandidate]);

	useEffect(() => {
		if (offerData) {
			console.log("===============================================");
			console.log("offerData received...", offerData);
			console.log("===============================================");

			const handleOffer = async () => {
				if (!peerConnection) return;
				console.log("===============================================");
				console.log("senders...", peerConnection?.getSenders().length);
				console.log("===============================================");

				// Set the remote description
				await peerConnection.setRemoteDescription(
					new RTCSessionDescription(offerData.offer)
				);

				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true,
				});

				// Add tracks to the peer connection
				stream.getTracks().forEach((track) => {
					if (
						!peerConnection
							.getSenders()
							.find((sender) => sender.track === track)
					) {
						peerConnection.addTrack(track, stream);
					}
				});

				console.log("===============================================");
				console.log("senders...", peerConnection?.getSenders().length);
				console.log("===============================================");

				// Create and send the answer
				const answer = await peerConnection.createAnswer();
				await peerConnection.setLocalDescription(answer);

				console.log("===============================================");
				console.log("sending answer...", answer);
				console.log("===============================================");

				sendAnswer({
					variables: { answer: { ...answer, targetUserId } },
				});
			};

			handleOffer();
		}
	}, [offerData, peerConnection, sendAnswer]);

	useEffect(() => {
		if (answerData) {
			console.log("===============================================");
			console.log("answerData received...", answerData);
			console.log("===============================================");

			peerConnection?.setRemoteDescription(
				new RTCSessionDescription(answerData.answerReceived)
			);
		}
	}, [answerData, peerConnection]);

	useEffect(() => {
		if (iceCandidateData) {
			console.log("===============================================");
			console.log("iceCandidateData received...", iceCandidateData);
			console.log("===============================================");

			peerConnection?.addIceCandidate(
				new RTCIceCandidate(iceCandidateData.iceCandidateReceived)
			);
		}
	}, [iceCandidateData, peerConnection]);

	const startCall = async () => {
		const offer = await peerConnection?.createOffer();
		await peerConnection?.setLocalDescription(offer);

		console.log("===============================================");
		console.log("sending offer ...", offer);
		console.log("===============================================");

		// Send the offer to the signaling server
		sendOffer({ variables: { offer: { ...offer, targetUserId } } });
	};

	const FooterButtonShape = "round";

	const handleEndCall = () => {
		/* stop call */
		peerConnection?.close();
		onClose();
	};

	const EndCallButton = () => {
		return (
			<div className="flex justify-end">
				<Button
					shape={FooterButtonShape}
					danger
					onClick={handleEndCall}
					icon={<PhoneOutlined />}
				></Button>
			</div>
		);
	};

	const [isAudioMuted, setIsAudioMuted] = useState(false);
	const [isVideoMuted, setIsVideoMuted] = useState(false);

	const toggleAudio = () => {
		if (audioTrackRef.current) {
			audioTrackRef.current.enabled = !audioTrackRef.current.enabled;
		}
		setIsAudioMuted(!isAudioMuted);
	};

	const toggleVideo = () => {
		if (videoTrackRef.current) {
			videoTrackRef.current.enabled = !videoTrackRef.current.enabled;
		}
		setIsVideoMuted(!isVideoMuted);
	};

	const ToggleAudioButton = () => {
		return (
			<div className="flex justify-end">
				<Button
					shape="round"
					danger={isAudioMuted}
					icon={isAudioMuted ? <AudioMutedOutlined /> : <AudioOutlined />}
					onClick={toggleAudio}
				></Button>
			</div>
		);
	};

	const ToggleVideoButton = () => {
		return (
			<div className="flex justify-end">
				<Button
					shape={FooterButtonShape}
					danger={isVideoMuted}
					icon={
						isVideoMuted ? <VideoCameraOutlined /> : <VideoCameraOutlined />
					}
					onClick={toggleVideo}
				></Button>
			</div>
		);
	};

	const Footer = () => {
		return (
			<div className="flex justify-center gap-5">
				<ToggleAudioButton />
				<ToggleVideoButton />
				<EndCallButton />
			</div>
		);
	};

	return (
		<>
			<Modal width={1000} open={true} footer={Footer} closable={false}>
				<div className="flex w-full h-full gap-3 relative">
					<Typography.Title
						level={5}
						className="absolute top-0 left-1/2 transform -translate-x-1/2"
					>
						{offerData
							? `Call from ${offerData?.callerInfo?.fullName}`
							: `Calling ${calleeInfo?.fullName}`}
						...
					</Typography.Title>

					<Button onClick={startCall}>Start Call</Button>

					<video
						ref={myVideoRef}
						autoPlay
						playsInline
						muted
						className="w-1/4 h-auto z-10 absolute right-0 bottom-0"
					/>

					{/* peer video */}
					<div className="w-full h-full">
						<video
							ref={peerVideoRef}
							autoPlay
							playsInline
							className="w-full h-full"
						/>
						{!peerVideoRef.current?.srcObject && offerData && (
							<img
								src={offerData.callerInfo.avatar || "/default-avatar.png"}
								alt={offerData.callerInfo.fullName}
								className="w-full h-full object-cover"
							/>
						)}
					</div>
				</div>
			</Modal>
		</>
	);
}

export default VideoCallModal;
