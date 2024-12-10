'use client'
import React, { useEffect, useRef, useState } from "react";
import { gql, useMutation, useSubscription } from "@apollo/client";
import { useUserContext } from "@/app/components/context/userContext";

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
			type
			sdp
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

function VideoCall() {
  const {user} = useUserContext();
  const targetUserId = user?.id === '6730af90ca09bace6cbf5f0a' ? '6730e89597ae957969f7ce3d' : '6730af90ca09bace6cbf5f0a';

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

	useEffect(() => {
		const pc = new RTCPeerConnection({
			iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
		});

		pc.onicecandidate = (event) => {
			if (event.candidate) {

        console.log('===============================================')
        console.log('sending ice candidate...', event.candidate);
        console.log('===============================================')

				sendIceCandidate({
					variables: {
						candidate: {
							candidate: event.candidate.candidate,
							sdpMid: event.candidate.sdpMid,
							sdpMLineIndex: event.candidate.sdpMLineIndex,
              targetUserId
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

		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				if (myVideoRef.current) {
					myVideoRef.current.srcObject = stream;
				}

				stream.getTracks().forEach((track) => {
					pc.addTrack(track, stream);
				});
			});
	}, [sendIceCandidate]);

	useEffect(() => {
		if (offerData) {

      console.log('===============================================')
      console.log('offerData received...', offerData);
      console.log('===============================================')

			peerConnection?.setRemoteDescription(
				new RTCSessionDescription(offerData.offerReceived)
			);
			peerConnection?.createAnswer().then((answer) => {
				peerConnection.setLocalDescription(answer);

        console.log('===============================================')
        console.log('sending answer...', answer);
        console.log('===============================================')

				sendAnswer({ variables: { answer: {...answer, targetUserId} } });
			});
		}
	}, [offerData, peerConnection, sendAnswer]);

	useEffect(() => {
		if (answerData) {

      console.log('===============================================')
      console.log('answerData received...', answerData);
      console.log('===============================================')

			peerConnection?.setRemoteDescription(
				new RTCSessionDescription(answerData.answerReceived)
			);
		}
	}, [answerData, peerConnection]);

	useEffect(() => {
		if (iceCandidateData) {

      console.log('===============================================')
      console.log('iceCandidateData received...', iceCandidateData);
      console.log('===============================================')

			peerConnection?.addIceCandidate(
				new RTCIceCandidate(iceCandidateData.iceCandidateReceived)
			);
		}
	}, [iceCandidateData, peerConnection]);

  const startCall = async () => {
    const offer = await peerConnection?.createOffer();
    await peerConnection?.setLocalDescription(offer);

    console.log('===============================================')
    console.log('sending offer ...', offer);
    console.log('===============================================')

    // Send the offer to the signaling server
    sendOffer({ variables: { offer: {...offer, targetUserId} } });
};


	return (
		<div className="w-full h-full">
			<h1 className="text-2xl font-bold">Video Call - {user?.id}</h1>
			<div className="flex w-full h-full gap-3">
				<div className="w-1/2">
					<h2>My Video</h2>
          <button onClick={startCall} className="bg-blue-500 text-white p-2 rounded-md">Start Call</button>
					<video
						ref={myVideoRef}
						autoPlay
						playsInline
						muted
						className="w-full h-full"
					></video>
				</div>
				<div className="w-1/2">
					<h2>Peer Video</h2>
					<video
						ref={peerVideoRef}
						autoPlay
						playsInline
						className="w-full h-full"
					></video>
				</div>
			</div>
		</div>
	);
}

export default VideoCall;
