"use client";
import React, { ReactNode } from "react";
import {
	ApolloClient,
	InMemoryCache,
	ApolloProvider,
	HttpLink,
	from,
	ApolloLink,
	Observable,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import axios from "axios";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import promiseToObservable from "@/utils/promiseToObservable";

const httpLink = new HttpLink({ uri: "/api/graphql" });

// Track token refresh state and queue requests
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Queue requests during token refresh
const subscribeTokenRefresh = (callback: (token: string) => void) => {
	refreshSubscribers.push(callback);
};

// Call subscribers after a new access token is obtained
const onTokenRefreshed = (newAccessToken: string) => {
	console.log(refreshSubscribers);
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

// Handle errors like 401 and manage token refresh logic
const errorLink = onError(
	({ graphQLErrors, networkError, operation, forward }) => {
		if (graphQLErrors) {
			for (const err of graphQLErrors) {
				if (err?.extensions?.code === "UNAUTHENTICATED") {
					// If not already refreshing, start token refresh
					if (!isRefreshing) {
						isRefreshing = true;
						const refreshPromise = refreshAccessToken();

						return promiseToObservable(refreshPromise).flatMap(
							(newAccessToken) => {
								// Update the request with the new token
								operation.setContext(({ headers = {} }) => ({
									headers: {
										...headers,
										Authorization: `Bearer ${newAccessToken}`,
									},
								}));

								isRefreshing = false;
								return forward(operation);
							}
						);
					}

					// Queue requests until the token refresh completes
					return new Observable((observer) => {
						subscribeTokenRefresh((newAccessToken) => {
							operation.setContext(({ headers = {} }) => ({
								headers: {
									...headers,
									Authorization: `Bearer ${newAccessToken}`,
								},
							}));
							forward(operation).subscribe(observer);
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
	link: from([
		authLink,
		errorLink,
		createUploadLink({
			uri: "/api/graphql",
			headers: {
				"Apollo-Require-Preflight": "true",
			},
		}) as unknown as ApolloLink,
	]),
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
