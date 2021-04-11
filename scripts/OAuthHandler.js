import * as fsPromise from "fs/promises";
import * as fs from "fs";
import * as path from "path";
import { AuthorizationCode } from "simple-oauth2";
import { config } from "../config.js";
import { ClientManager } from "./ClientManager.js";
import { Deferred } from "./Deferred.js";

const tokenPath = path.join(config.outdir, "microsoftToken.json");

export class OAuthHandler {
    constructor (clientId, appToken) {
        this.client = new AuthorizationCode({
            client: {
                id: clientId,
                secret: appToken
            },
            auth: {
                tokenHost: "https://login.live.com",
                tokenPath: "/oauth20_token.srf",
                authorizePath: "/oauth20_authorize.srf",
            },
            options: {
                authorizationMethod: "body",
            },
        });

        this.tokenDeferred = new Deferred();
        this.loadTokenFromFile();
        this.serveAuth();
    }

    serveAuth () {
        const authorizationUri = this.client.authorizeURL({
            redirect_uri: ClientManager.callbackUrl,
            scope: "Files.Read.All,offline_access",
        });

        // Initial page redirecting to Github
        ClientManager.get("/auth", (req, res) => {
            // console.log(authorizationUri);
            res.redirect(authorizationUri);
        });

        // Callback service parsing the authorization token and asking for the access token
        ClientManager.get("/callback", async (req, res) => {
            const { code } = req.query;

            try {
                this.token = await this.client.getToken({
                    code,
                    redirect_uri: ClientManager.callbackUrl,
                });

                console.log("Recieved token");
                this.saveTokenToFile();
                this.tokenDeferred.resolve();

                res.status(200).send("Authentication successful"); // json(accessToken.token);
            } catch (error) {
                console.error("Access Token Error", error.message);
                res.status(500).json("Authentication failed");
            }
        });

        ClientManager.get("/", (req, res) => {
            res.send("Hello<br><a href='/auth'>Log in with Microsoft</a>");
        });
    }

    async loadTokenFromFile () {
        if (fs.existsSync(tokenPath)) {
            const result = await fsPromise.readFile(tokenPath, "utf-8");
            this.token = this.client.createToken(JSON.parse(result));

            if (await this.refreshToken()) {
                this.tokenDeferred.resolve();
            }
        }

    }

    saveTokenToFile () {
        return fsPromise.writeFile(tokenPath, JSON.stringify(this.token.token, null, 2));
    }

    async getAccessToken () {
        if (this.token && await this.refreshToken()) {
            return this.token.token.access_token;
        }

        if (!this.tokenDeferred.isPending) {
            this.tokenDeferred = new Deferred();
        }

        return this.tokenDeferred.promise.then(() => {
            return this.token.token.access_token;
        });
    }

    /**
     * Refreshes the token in case it expired
     * @returns {boolean} whether there is a valid token
     */
    async refreshToken () {
        if (this.token.expired()) {
            if (this.tokenRefreshDeferred?.isPending) {
                return this.tokenRefreshDeferred.promise;
            } else {
                this.tokenRefreshDeferred = new Deferred();
            }
            try {
                const newToken = await this.token.refresh({
                    scope: "Files.Read.All,offline_access",
                });
                this.token = newToken;
                console.log("Token refresh successful");
                this.saveTokenToFile();
                this.tokenRefreshDeferred.resolve(true);

            } catch (err) {
                console.log("Token refresh failed");
                console.error(err);
                this.tokenRefreshDeferred.resolve(false);
            }
        }
        return true;
    }
}
