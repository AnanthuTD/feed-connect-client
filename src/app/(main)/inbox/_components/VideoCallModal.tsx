"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMutation, useSubscription } from "@apollo/client";
import Modal from "antd/es/modal/Modal";
import { Button, Typography } from "antd";
import {
	SEND_ANSWER,
	SEND_ICE_CANDIDATE,
	SEND_OFFER,
} from "@/graphql/mutation";
import {
	ANSWER_RECEIVED,
	ICE_CANDIDATE_RECEIVED,
} from "@/graphql/subscription";
import FooterControls from "./FooterControls";

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
	type: "call" | "answer";
}

function VideoCallModal({
	onClose,
	offerData = null,
	calleeInfo = null,
	type = "call",
}: VideoCallModalProps) {
	const targetUserId = calleeInfo?.id;

	const myVideoRef = useRef<HTMLVideoElement>(null);
	const peerVideoRef = useRef<HTMLVideoElement>(null);

	const [peerConnection, setPeerConnection] =
		useState<RTCPeerConnection | null>(null);

	const [sendOffer] = useMutation(SEND_OFFER);
	const [sendAnswer] = useMutation(SEND_ANSWER);
	const [sendIceCandidate] = useMutation(SEND_ICE_CANDIDATE);

	/* subscription for answer and ice candidate data */
	const { data: answerData } = useSubscription(ANSWER_RECEIVED, {
		shouldResubscribe: true,
	});
	const { data: iceCandidateData } = useSubscription(ICE_CANDIDATE_RECEIVED);

	/* audio and video tracks */
	const audioTrackRef = useRef<MediaStreamTrack | null>(null);
	const videoTrackRef = useRef<MediaStreamTrack | null>(null);

	/* add track to peer connection and set the stream to the video element */
	async function addTrack(peerConnection: RTCPeerConnection) {
		if (!peerConnection) return;

		const stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		});

		stream.getTracks().forEach((track) => {
			if (
				!peerConnection.getSenders().find((sender) => sender.track === track)
			) {
				peerConnection.addTrack(track, stream);
			}
		});

		audioTrackRef.current = stream.getAudioTracks()[0];
		videoTrackRef.current = stream.getVideoTracks()[0];

		if (myVideoRef.current) {
			myVideoRef.current.srcObject = stream;
		}
	}

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

			if (type === "call") {
				alert("addTrack");

				await addTrack(pc);
			}
		}

		configurePeerConnection();

		return () => {
			peerConnection?.close();
		};
	}, [sendIceCandidate]);

	/* handle offer data */
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

				await addTrack(peerConnection);

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

	/* handle answer data */
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

	/* handle ice candidate data */
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

	/* start call */
	const startCall = async () => {
		const offer = await peerConnection?.createOffer();
		await peerConnection?.setLocalDescription(offer);

		console.log("===============================================");
		console.log("sending offer ...", offer);
		console.log("===============================================");

		// Send the offer to the signaling server
		sendOffer({ variables: { offer: { ...offer, targetUserId } } });
	};

	/* stop call */
	const handleEndCall = () => {
		peerConnection?.close();
		onClose();
	};

	/* audio and video mute states */
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

	return (
		<>
			<Modal
				width={1000}
				open={true}
				footer={
					<FooterControls
						isAudioMuted={isAudioMuted}
						isVideoMuted={isVideoMuted}
						onToggleAudio={toggleAudio}
						onToggleVideo={toggleVideo}
						onEndCall={handleEndCall}
					/>
				}
				closable={false}
			>
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
