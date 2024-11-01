import Cookies from "js-cookie";
import React, {
	useEffect,
	useRef,
	Dispatch,
	SetStateAction,
	useState,
} from "react";
import axios from '@/lib/axios';

function Settings({
	setSettings,
	settings,
}: {
	setSettings: Dispatch<SetStateAction<boolean>>;
	settings: boolean;
}) {
	// useState
	const [cancel, setCancel] = useState(false);

	// ref
	const elevatedDiv = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		function handleClickOutside(this: Document, ev: MouseEvent) {
			if (elevatedDiv && !elevatedDiv.current?.contains(ev.target as Node)) {
				setSettings(false);
			}
		}

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		if (cancel) setSettings(false);
	}, [cancel]);

	async function logout() {
		try {
			
			await axios.get("api/accounts/logout/");

			// Remove cookies after successful logout
			Cookies.remove("csrftoken");
			Cookies.remove("user");

			window.location.reload();
		} catch (error) {
			console.error("Error during Axios request:", error);
			// Handle the error here
		}
	}

	return (
		<>
			<div
				className="absolute inset-0 flex items-center justify-center bg-blackBlur"
				style={{
					minHeight: "380px",
					minWidth: "380px",
					height: "100%",
					zIndex: 15,
				}}>
				<div
					className="w-1/5 overflow-hidden rounded-xl bg-elevated shadow-md"
					ref={elevatedDiv}>
					<div className="flex cursor-pointer items-center justify-center border-b border-border_grey p-3 text-sm text-primaryText">
						Apps and Websites
					</div>
					<div className="flex cursor-pointer items-center justify-center border-b border-border_grey p-3 text-sm text-primaryText">
						QR Code
					</div>
					<div className="flex cursor-pointer items-center justify-center border-b border-border_grey p-3 text-sm text-primaryText">
						Notification
					</div>
					<div className="flex cursor-pointer items-center justify-center border-b border-border_grey p-3 text-sm text-primaryText">
						Settings and Privacy
					</div>
					<div className="flex cursor-pointer items-center justify-center border-b border-border_grey p-3 text-sm text-primaryText">
						Supervision
					</div>
					<div
						className="flex cursor-pointer items-center justify-center border-b border-border_grey p-3 text-sm text-primaryText"
						onClick={() => logout()}>
						Log Out
					</div>
					<div
						className="flex cursor-pointer items-center justify-center p-3 text-sm text-primaryText"
						onClick={() => setCancel(true)}>
						Cancel
					</div>
				</div>
			</div>
		</>
	);
}

export default Settings;
