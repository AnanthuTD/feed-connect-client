"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { UserState } from "../../../utils/Interfaces";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";
import axios from "@/lib/axios";

interface UserContextInterface {
	user: UserState | undefined;
	setUser: React.Dispatch<React.SetStateAction<UserState | undefined>>;
}

// context
const UserContext = createContext<UserContextInterface>({
	user: undefined,
	setUser: () => {},
});
export function useUserContext(): UserContextInterface {
	return useContext(UserContext);
}

export function UserContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	// useStates``
	const [user, setUser] = useState<UserState | undefined>(undefined);
	const [loading, setLoading] = useState(true);

	// miscellaneous
	const router = useRouter();

	// Define an effect to handle user authentication
	useEffect(() => {
		// Define a function to fetch the user from the backend API
		const fetchUser = async () => {
			try {
				const { data } = await axios.get("api/accounts/login/", {
					withCredentials: true,
				});
				// Stop loading
				setLoading(false);
				if (data.status) {
					setUser(data.user);
				} else {
					// router.push("/login");
				}
			} catch (error) {
				console.error("================ERROR ON LOGIN====================");
				console.error(error);
				console.error("====================================");
				// router.push("/login");
			}
		};

		// If no user object is available, fetch the user from the API
		if (!user) fetchUser();
	}, [user]);

	return (
		<>
		{/* 	{loading ? (
				<Loading />
			) : ( */}
				<UserContext.Provider value={{ user, setUser }}>
					{children}
				</UserContext.Provider>
			{/* )} */}
		</>
	);
}
