/* add track to peer connection and set the stream to the video element */
export default async function addTrackToPeerConnection(
	peerConnection: RTCPeerConnection,
	audioTrackRef: React.RefObject<MediaStreamTrack | null>,
	videoTrackRef: React.RefObject<MediaStreamTrack | null>,
	myVideoRef: React.RefObject<HTMLVideoElement | null>
) {
	if (!peerConnection) return;

	const stream = await navigator.mediaDevices.getUserMedia({
		video: true,
		audio: true,
	});

	stream.getTracks().forEach((track) => {
		if (!peerConnection.getSenders().find((sender) => sender.track === track)) {
			peerConnection.addTrack(track, stream);
		}
	});

	audioTrackRef.current = stream.getAudioTracks()[0];
	videoTrackRef.current = stream.getVideoTracks()[0];

	if (myVideoRef.current) {
		myVideoRef.current.srcObject = stream;
	}
}
