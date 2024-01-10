import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import ApolloServerPluginResponseCache from "@apollo/server-plugin-response-cache";
import { createHash } from "@apollo/utils.createhash";

import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import http from "http";
import { ZodError } from "zod";
import { zodErrorToString } from "./utils";

// typedefs and resolvers
import { resolvers } from './routes/graphql/resolvers';
import { typeDefs } from './routes/graphql/typedefs';

// routes
import {
    chatRouter,
    authRouter,
    userRouter
} from './routes/v1';

import { createContext } from "./routes/graphql/context";

const app = express();
const httpServer = http.createServer(app);

const apollo = new ApolloServer<any>({
    allowBatchedHttpRequests: true,
    typeDefs,
    resolvers,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        ApolloServerPluginCacheControl({
            calculateHttpHeaders: true,
            defaultMaxAge: 30,
        }),
        ApolloServerPluginResponseCache({
            generateCacheKey(req, keyData): string {

                console.log({ req, keyData })
                // const {
                //     network: { rpc },
                // } = req.contextValue as any;

                // return createHash("sha256")
                //     .update(`${rpc ?? ""}-${JSON.stringify(keyData)}`)
                //     .digest("hex");
                return 'this__is__generate__cache__key'
            },
            async sessionId(req): Promise<string | null> {
                console.log(req.contextValue, "req.context-value")
                const { jwt } = req.contextValue.authorization;
                return jwt ? `session-id:${jwt}` : null;
            },
        }),
    ],
});

// eslint-disable-next-line
const bodyParser = require("body-parser");
// eslint-disable-next-line
const cookieParser = require("cookie-parser");

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/json" }));


// You have express server along with graphql server
apollo.start().then(async () => {
    app.use("/authenticate", authRouter);
    app.use("/chat", chatRouter);
    app.use("/user", userRouter);
    app.get("/_health", (_req, res) => {
        return res.status(200).json({
            uptime: process.uptime(),
            message: "OK",
            timestamp: Date.now(),
        });
    });

    app.get("/", (_req, res) => {
        return res.status(200).json({
            uptime: process.uptime(),
            message: "OK",
            timestamp: Date.now(),
        });
    });

    app.use(
        "/v2",
        expressMiddleware(apollo, {
            context: createContext,
        })
    );

    app.use(
        (
            err: any,
            _req: Request,
            res: Response,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _DO_NOT_REMOVE_THIS_PARAMETER_: NextFunction
        ) => {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    message: zodErrorToString(err),
                });
            } else {
                return res.status(500).json(err);
            }
        }
    );

    const port = process.env.PORT || 8080;
    await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));

    console.log("Listening on port: ", port);
});

process.on("uncaughtException", function (err) {
    console.error(err);
    console.log("Caught exception: " + err);
});
