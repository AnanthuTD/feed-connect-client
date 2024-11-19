"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserState } from "../../../utils/Interfaces";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading"; // Import the Loading component
import { gql, useQuery } from "@apollo/client";
import { GET_PROFILE } from "@/graphql/queries";

// Define the interface for context value
interface UserContextInterface {
	user: UserState | undefined;
	setUser: React.Dispatch<React.SetStateAction<UserState | undefined>>;
}

// Create the UserContext with a default empty implementation
const UserContext = createContext<UserContextInterface>({
	user: undefined,
	setUser: () => {},
});

export function useUserContext(): UserContextInterface {
	return useContext(UserContext);
}

// Provider component to wrap the app with the User context
export function UserContextProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<UserState | undefined>(undefined);
	const { loading, data, error } = useQuery(GET_PROFILE, { errorPolicy: "all" });
	const router = useRouter();

	useEffect(() => {
		if (error) {
			console.error("Authentication error: redirecting to login.");
			router.push("/login");
		} else if (data?.user) {
			setUser(data.user);
		}
	}, [error, data]);

	return (
		<UserContext.Provider value={{ user, setUser }}>
			{loading ? <Loading /> : children}
		</UserContext.Provider>
	);
}
