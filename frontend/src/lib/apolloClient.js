// apolloClient.js
import {
  ApolloClient,
  InMemoryCache,

  HttpLink
} from '@apollo/client';


// HTTP connection to the API
export const httpLink = new HttpLink({
  uri: import.meta.env.MODE === "development" ? "http://localhost:5001/graphql" : "/graphql",
 
  credentials: 'include'
});



export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
