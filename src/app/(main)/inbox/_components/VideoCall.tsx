import React, { Profiler, useCallback, useEffect, useState } from "react";
import { VideoCameraAddOutlined } from "@ant-design/icons";
import VideoCallModal from "./VideoCallModal";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";

const GET_USER_PROFILE = gql`
	query GetUserProfile($username: String, $id: ID) {
		userProfile(username: $username, id: $id) {
			id
			username
			fullName
			avatar
		}
	}
`;

function VideoCall({ userId }: { userId: string }) {
	const [isOpen, setIsOpen] = useState(false);

	/* Get callee user profile */
	const { data: calleeProfile } = useQuery(GET_USER_PROFILE, {
		variables: {
			id: userId,
		},
	});

	const handleOpen = () => {
			setIsOpen(true);
	};

	const handleClose = useCallback(() => {
		setIsOpen(false);
	}, []);

	function onRender(
		id: string,
		phase: string,
		actualDuration: number,
		baseDuration: number,
		startTime: number,
		commitTime: number
	) {
		// Aggregate render timings
		console.log({
			id,
			phase,
			actualDuration,
			baseDuration,
			startTime,
			commitTime,
		});
	}

	return (
		<>
				<VideoCameraAddOutlined style={{ fontSize: 25 }} onClick={handleOpen} />

				{isOpen && calleeProfile?.userProfile && (
					<VideoCallModal
						onClose={handleClose}
						offerData={null}
						calleeInfo={calleeProfile?.userProfile}
						type="call"
					/>
				)}
		</>
	);
}

export default React.memo(VideoCall);
