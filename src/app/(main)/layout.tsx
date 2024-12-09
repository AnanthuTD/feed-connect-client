import React from "react";
import MenuBar from "@/app/(main)/_menu/menu";

// context
import { MenuContextProvider } from "../components/context/menuContext";
import { UserContextProvider } from "../components/context/userContext";
// import { ChatContextProvider } from "../components/context/chatContext";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="flex min-h-screen flex-col-reverse bg-black lg:flex-row">
			<UserContextProvider>
				<MenuContextProvider>
					{/* <ChatContextProvider> */}
						<div className="z-10 h-fit justify-between bg-black p-1 max-lg:fixed max-lg:w-full lg:flex lg:h-screen lg:flex-col lg:p-5 xl:w-[16%] xl:border-r xl:border-[rgb(38,38,38)]">
							<MenuBar />
						</div>
						<div
							className="flex h-screen w-full overflow-y-auto pb-14 lg:pb-0 xl:w-[84%] p-4 justify-center"
							id="main_scrollable">
							{children}
						</div>
					{/* </ChatContextProvider> */}
				</MenuContextProvider>
			</UserContextProvider>
		</main>
	);
}
