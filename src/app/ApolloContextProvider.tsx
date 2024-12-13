"use client";
import React, { ReactNode } from "react";
import {
	ApolloClient,
	InMemoryCache,
	ApolloProvider,
	from,
	ApolloLink,
	Observable,
	split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { getMainDefinition } from "@apollo/client/utilities";
import axios from "axios";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import promiseToObservable from "@/utils/promiseToObservable";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getAccessToken, getSessionStorage } from "@/utils/sessionStorage";

// Token refresh logic
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
	refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newAccessToken: string) => {
	refreshSubscribers.forEach((callback, index) => {
		if (index !== 0) callback(newAccessToken);
	});
	refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string> => {
	try {
		const response = await axios.post("/api/auth/refresh-token");
		const newAccessToken: string = response.data.accessToken;
		const sessionStorage = getSessionStorage();
		if (sessionStorage) sessionStorage.setItem("accessToken", newAccessToken);
		onTokenRefreshed(newAccessToken);
		return newAccessToken;
	} catch (error) {
		console.error("Failed to refresh token:", error);
		throw error;
	} finally {
		isRefreshing = false;
	}
};

// Authorization Link
const authLink = setContext(async (_, { headers }) => {
	
	let accessToken = getAccessToken();
	
	return {
		headers: {
			...headers,
			Authorization: accessToken ? `Bearer ${accessToken}` : "",
		},
	};
});

// Error Handling Link
const errorLink = onError(
	({ graphQLErrors, networkError, operation, forward }) => {
		if (graphQLErrors) {
			for (const err of graphQLErrors) {
				if (err?.extensions?.code === "UNAUTHENTICATED") {
					if (!isRefreshing) {
						isRefreshing = true;
						const refreshPromise = refreshAccessToken();

						return promiseToObservable(refreshPromise).flatMap(
							(newAccessToken) => {
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

// HTTP Link
const httpLink = createUploadLink({
	uri: "/api/graphql",
	headers: {
		"Apollo-Require-Preflight": "true",
	},
}) as unknown as ApolloLink;

// WebSocket Link for Subscriptions
const wsLink = new GraphQLWsLink(
	createClient({
		url: `ws://localhost:3000/graphql`,
		connectionParams: {
			authToken: `${getAccessToken()}`,
		},
		keepAlive: 1_000,
	})
);

// Split link: route queries and mutations to HTTP, subscriptions to WebSocket
const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query);
		return (
			definition.kind === "OperationDefinition" &&
			definition.operation === "subscription"
		);
	},
	wsLink,
	from([authLink, errorLink, httpLink])
);

// Apollo Client setup
const client = new ApolloClient({
	link: splitLink,
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
