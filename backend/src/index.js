import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './resolvers/index.resolver.js';
import dotenv from 'dotenv';
import { createServer } from 'http';
import express from 'express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import cookieParser from "cookie-parser";
import { getCurrentUser } from './utils/user.route.js';
import sequelize from './model/db.js';
import cors from 'cors';
import { initSocketIO } from './utils/socket.js';
import path from 'path';


const corsOptions = {
  origin: ['http://localhost:5173'], // Frontend URL for development
  credentials: true, // Allow cookies
}; 
dotenv.config();
const __dirname = path.resolve();
const PORT = process.env.PORT;
const schema = makeExecutableSchema({ typeDefs, resolvers });
const app = express();
const httpServer = createServer(app);

app.use(cookieParser());
app.use(cors(corsOptions));

const io = initSocketIO(httpServer);


// Set up the Apollo Server
const server = new ApolloServer({
  schema,
  formatError: (err) => {
    console.error("GraphQL Error:", err);
    return err;
  },
  context: async ({ req, res }) => {
    let user = null;
    try {
      user = await getCurrentUser(req);
    } catch (err) {
      console.warn("Authentication error:", err.message);
    }
    return { req, res, user, sequelize, io };
  },
  cache: new InMemoryLRUCache({
    maxSize: Math.pow(2, 20) * 100, // ~100MiB
    ttl: 300, // 5 minutes (in seconds)
  }),
  
});

// Start the Apollo Server
await server.start();
server.applyMiddleware({ app, cors: corsOptions });

if (process.env.NODE_ENV === "production") {
  // Serve static files from frontend build
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
  // Handle GraphQL requests at /graphql endpoint
  server.applyMiddleware({ 
    app,
    path: '/graphql',
    cors: false // Disable CORS since we're serving from same domain
  });

  // All other requests go to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
} else {
  // Development setup
  server.applyMiddleware({ 
    app,
    cors: corsOptions 
  });
}


// Start the HTTP server
httpServer.listen(PORT, () => {
  console.log(`🚀 HTTP Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  console.log(`📡 Subscriptions ready at ws://localhost:${PORT}/graphql`);
})