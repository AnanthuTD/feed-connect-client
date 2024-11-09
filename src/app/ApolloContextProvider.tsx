"use client";
import React from "react";
import {
	ApolloClient,
	InMemoryCache,
	ApolloProvider,
	gql,
} from "@apollo/client";

const client = new ApolloClient({
	uri: "https://flyby-router-demo.herokuapp.com/",
	cache: new InMemoryCache(),
});

client
	.query({
		query: gql`
			query GetLocations {
				locations {
					id
					name
					description
					photo
				}
			}
		`,
	})
	.then((result) => console.log(result));

function ApolloContextProvider({ children }) {
	return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export default ApolloContextProvider;
