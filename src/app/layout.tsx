import React from "react";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import LayoutProvider from "./layoutProvider";
import ApolloContextProvider from "./ApolloContextProvider";

export const metadata = {
	title: "WowGram",
	description: "Instagram Clone",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<html lang="en">
				<body>
					<AntdRegistry>
						<ApolloContextProvider>
							<LayoutProvider>{children}</LayoutProvider>
						</ApolloContextProvider>
					</AntdRegistry>
				</body>
			</html>
		</>
	);
}
