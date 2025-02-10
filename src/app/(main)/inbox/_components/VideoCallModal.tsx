"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMutation, useSubscription } from "@apollo/client";
import Modal from "antd/es/modal/Modal";
import { Button, Typography } from "antd";
import {
	END_CALL,
	SEND_ANSWER,
	SEND_ICE_CANDIDATE,
	SEND_OFFER,
} from "@/graphql/mutation";
import {
	ANSWER_RECEIVED,
	CALL_ENDED,
	ICE_CANDIDATE_RECEIVED,
} from "@/graphql/subscription";
import FooterControls from "./FooterControls";
import addTrackToPeerConnection from "../utils/addTrackToPeerConnection";

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

	/* video elements */
	const myVideoRef = useRef<HTMLVideoElement>(null);
	const peerVideoRef = useRef<HTMLVideoElement>(null);

	/* peer connection */
	const [peerConnection, setPeerConnection] =
		useState<RTCPeerConnection | null>(null);

	/* mutations */
	const [sendOffer] = useMutation(SEND_OFFER);
	const [sendAnswer] = useMutation(SEND_ANSWER);
	const [sendIceCandidate] = useMutation(SEND_ICE_CANDIDATE);
	const [endCall] = useMutation(END_CALL);

	/* subscription for answer and ice candidate data */
	const { data: answerData } = useSubscription(ANSWER_RECEIVED, {
		shouldResubscribe: true,
	});
	const { data: iceCandidateData } = useSubscription(ICE_CANDIDATE_RECEIVED);
	const { data: callEndedData } = useSubscription(CALL_ENDED);

	/* audio and video tracks */
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

			pc.oniceconnectionstatechange = (event) => {
				console.log("===============================================");
				console.log("ice connection state changed...", event);
				console.log("===============================================");

				if (pc.iceConnectionState === "closed") {
					releaseStream();
					peerConnection?.close();
					onClose();
				}
			};

			setPeerConnection(pc);

			if (type === "call") {
				alert("addTrack");

				releaseMediaDevices();
				releaseStream();

				await addTrackToPeerConnection(
					pc,
					audioTrackRef,
					videoTrackRef,
					myVideoRef
				);
			}
		}

		releaseStream();
		configurePeerConnection();

		return () => {
			peerConnection?.close();
			releaseStream();
			releaseMediaDevices();

			alert("release");
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

				await addTrackToPeerConnection(
					peerConnection,
					audioTrackRef,
					videoTrackRef,
					myVideoRef
				);

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

	function releaseStream() {
		[myVideoRef, peerVideoRef].forEach((vid, index) => {
			if (vid.current && vid.current.srcObject) {
				const stream = vid.current.srcObject as MediaStream;
				stream.getTracks().forEach((track) => {
					console.log(
						`Track ${index + 1}: ${track.kind}, State: ${track.readyState}`
					);
					track.stop();
				});
				vid.current.pause();
				vid.current.srcObject = null;
			}
		});
	}

	function releaseMediaDevices() {
		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				stream.getTracks().forEach((track) => track.stop());
			})
			.catch((err) => console.warn("Error releasing media devices:", err));
	}

	useEffect(() => {
		return () => {
			releaseStream();
			releaseMediaDevices();

			alert("release from all");
		};
	}, []);

	/* handle call ended */
	useEffect(() => {
		if (callEndedData) {
			console.log("Call ended by the other user");
			releaseStream();
			releaseMediaDevices();

			peerConnection?.close();
			onClose();
		}
	}, [callEndedData, peerConnection]);

	/* stop call */
	const handleEndCall = () => {
		releaseStream();
		releaseMediaDevices();
		peerConnection?.close();
		endCall({ variables: { targetUserId } });
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

export default React.memo(VideoCallModal);
