"use client";
import React, { ReactNode } from "react";
import {
	ApolloClient,
	InMemoryCache,
	ApolloProvider,
	HttpLink,
	from,
	ApolloLink,
	Operation,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import axios from "axios";

const httpLink = new HttpLink({ uri: "/api/graphql" });

// Define the types for the token refresh queue
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Helper function to queue requests until token is refreshed
const subscribeTokenRefresh = (callback: (token: string) => void) => {
	refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newAccessToken: string) => {
	refreshSubscribers.forEach((callback) => callback(newAccessToken));
	refreshSubscribers = [];
};

// Function to refresh the access token
const refreshAccessToken = async (): Promise<string> => {
	try {
		const response = await axios.post("/api/auth/refresh-token");
		const newAccessToken: string = response.data.accessToken;
		sessionStorage.setItem("accessToken", newAccessToken);
		onTokenRefreshed(newAccessToken);
		return newAccessToken;
	} catch (error) {
		console.error("Failed to refresh token:", error);
		throw error;
	} finally {
		isRefreshing = false;
	}
};

// Set up request headers with access token from session storage
const authLink = setContext(async (_, { headers }) => {
	const accessToken = sessionStorage.getItem("accessToken");
	return {
		headers: {
			...headers,
			Authorization: accessToken ? `Bearer ${accessToken}` : "",
		},
	};
});

// Handle errors such as 401 and refresh token logic
const errorLink = onError(
	({ forward, operation, graphQLErrors, networkError }) => {
		if (graphQLErrors) {
			for (let err of graphQLErrors) {
				if (err?.extensions?.code === "UNAUTHENTICATED") {
					if (!isRefreshing) {
						isRefreshing = true;
						refreshAccessToken()
							.then((newAccessToken) => {
								operation.setContext(({ headers = {} }) => ({
									headers: {
										...headers,
										Authorization: `Bearer ${newAccessToken}`,
									},
								}));
							})
							.catch((error) => {
								console.error("Refresh token failed:", error);
								// Handle logout or redirect to login if needed
							})
							.finally(() => {
								isRefreshing = false;
							});
					}

					new Promise((resolve) => {
						subscribeTokenRefresh((newAccessToken: string) => {
							operation.setContext(({ headers = {} }) => ({
								headers: {
									...headers,
									Authorization: `Bearer ${newAccessToken}`,
								},
							}));
							resolve(forward(operation));
						});
					});
				}
			}
		}

		if (networkError) {
			console.error(`[Network error]: ${networkError}`);
		}
	}
);

// Apollo Client setup
const client = new ApolloClient({
	link: from([authLink, errorLink as ApolloLink, httpLink]),
	cache: new InMemoryCache(),
});

// Define type for children prop in ApolloContextProvider
interface ApolloContextProviderProps {
	children: ReactNode;
}

function ApolloContextProvider({ children }: ApolloContextProviderProps) {
	return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export default ApolloContextProvider;
