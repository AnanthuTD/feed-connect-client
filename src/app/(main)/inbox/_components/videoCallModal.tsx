"use client";
import React, { useEffect, useRef, useState } from "react";
import { gql, useMutation, useSubscription } from "@apollo/client";
import { useUserContext } from "@/app/components/context/userContext";
import Modal from "antd/es/modal/Modal";
import { Button, Typography } from "antd";
import {
	AudioOutlined,
	VideoCameraOutlined,
	AudioMutedOutlined,
	PhoneOutlined,
} from "@ant-design/icons";

const SEND_OFFER = gql`
	mutation SendOffer($offer: OfferInput!) {
		sendOffer(offer: $offer)
	}
`;

const SEND_ANSWER = gql`
	mutation SendAnswer($answer: AnswerInput!) {
		sendAnswer(answer: $answer)
	}
`;

const SEND_ICE_CANDIDATE = gql`
	mutation SendIceCandidate($candidate: IceCandidateInput!) {
		sendIceCandidate(candidate: $candidate)
	}
`;

const OFFER_RECEIVED = gql`
	subscription {
		offerReceived {
			offer {
				type
				sdp
			}
			callerInfo{
				username
				avatar
				fullName
				id
			}
		}
	}
`;

const ANSWER_RECEIVED = gql`
	subscription {
		answerReceived {
			type
			sdp
		}
	}
`;

const ICE_CANDIDATE_RECEIVED = gql`
	subscription {
		iceCandidateReceived {
			candidate
			sdpMid
			sdpMLineIndex
		}
	}
`;

interface VideoCallModalProps {
	userId: string;
	open: boolean;
	onClose: () => void;
}

function VideoCallModal({ userId, open, onClose }: VideoCallModalProps) {
	const { user } = useUserContext();
	const targetUserId = userId;

	const myVideoRef = useRef<HTMLVideoElement>(null);
	const peerVideoRef = useRef<HTMLVideoElement>(null);

	const [peerConnection, setPeerConnection] =
		useState<RTCPeerConnection | null>(null);

	const [sendOffer] = useMutation(SEND_OFFER);
	const [sendAnswer] = useMutation(SEND_ANSWER);
	const [sendIceCandidate] = useMutation(SEND_ICE_CANDIDATE);

	const { data: offerData } = useSubscription(OFFER_RECEIVED);
	const { data: answerData } = useSubscription(ANSWER_RECEIVED);
	const { data: iceCandidateData } = useSubscription(ICE_CANDIDATE_RECEIVED);

  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

	useEffect(() => {
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
		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
        /* get audio and video tracks */
        audioTrackRef.current = stream.getAudioTracks()[0];
        videoTrackRef.current = stream.getVideoTracks()[0];

        /* set my video */
				if (myVideoRef.current) {
					myVideoRef.current.srcObject = stream;
				}

        /* add tracks to peer connection */
				stream.getTracks().forEach((track) => {
					pc.addTrack(track, stream);
				});

        /* start call */
			});
	}, [sendIceCandidate]);

	useEffect(() => {
		if (offerData) {
			console.log("===============================================");
			console.log("offerData received...", offerData);
			console.log("===============================================");

			peerConnection?.setRemoteDescription(
				new RTCSessionDescription(offerData.offerReceived.offer)
			);
			peerConnection?.createAnswer().then((answer) => {
				peerConnection.setLocalDescription(answer);

				console.log("===============================================");
				console.log("sending answer...", answer);
				console.log("===============================================");

				sendAnswer({ variables: { answer: { ...answer, targetUserId } } });
			});
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
						Calling {"User Name"} ...
					</Typography.Title>

          <Button onClick={startCall}>Start Call</Button>

					<video
						ref={myVideoRef}
						autoPlay
						playsInline
						muted
						className="w-1/4 h-auto z-10 absolute right-0 bottom-0"
					/>

					<video
						ref={peerVideoRef}
						autoPlay
						playsInline
						className="w-full h-full"
						style={{ backgroundColor: "red" }}
					></video>
				</div>
			</Modal>
		</>
	);
}

export default VideoCallModal;
