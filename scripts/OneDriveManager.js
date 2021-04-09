import * as fs from "fs/promises";
import * as path from "path";
import * as oneDriveAPI from "onedrive-api";
import { AuthorizationCode } from "simple-oauth2";
import { config, dirname } from "../config.js";
import { ClientManager } from "./ClientManager.js";
import { Deferred } from "./Deferred.js";

const tokenPath = path.join(config.outdir, "microsoftToken.txt");

class _OneDriveManager {
    constructor () {
        this.deferred = new Deferred();
    }

    login (clientId, appToken, oldToken) {
        this.extensionFilter = null;

        this.serveAuth(clientId, appToken);

        try {
            fs.readFile(tokenPath).then((token) => {
                this.token = token
            }).then(() => {
                return this.getAllFiles();
            }).then((result) => {
                const res = JSON.stringify(result, null, 2);
                return fs.writeFile(path.join(dirname, "out/test.json"), res);
            }).then(function () {
                console.log("done");
            });
        } catch (err) {
            console.error(err);
        }

        return this.deferred.promise;
    }

    serveAuth (clientId, appToken) {
        // Authorization uri definition
        const client = new AuthorizationCode({
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

        const authorizationUri = client.authorizeURL({
            redirect_uri: ClientManager.callbackUrl,
            scope: "Files.Read.All",
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
                const accessToken = await client.getToken({
                    code,
                    redirect_uri: ClientManager.callbackUrl,
                });

                console.log("The resulting token: ", accessToken.token);

                res.status(200).send("Authentication successful"); // json(accessToken.token);
                this.token = accessToken.token.access_token;

                fs.writeFile(path.join(config.outdir, "microsoftToken.txt"), this.token);

                this.deferred.resolve();
            } catch (error) {
                console.error("Access Token Error", error.message);
                res.status(500).json("Authentication failed");

                this.deferred.reject();
            }
        });

        ClientManager.get("/", (req, res) => {
            res.send("Hello<br><a href='/auth'>Log in with Microsoft</a>");
        });
    }

    getExtensionFilter () {
        if (this.extensionFilter) {
            return this.extensionFilter;
        }

        this.extensionFilter = "";
        config.onedrive.allowedExtension.forEach((extension, index, arr) => {
            this.extensionFilter += `endswith(name, '.${extension}') eq true`
            if (index < arr.length - 1) {
                this.extensionFilter += " or "
            }
        });

        return this.extensionFilter;
    }

    async getAllFiles () {
        const files = await this.getFolderInfo(config.onedrive.folderId);
        return files;
    }

    async getFolderInfo (folderId) {
        const result = {
            folders: [],
            files: [],
        };

        const response = await oneDriveAPI.items.listChildren({
            accessToken: this.token,
            itemId: folderId,
            drive: config.onedrive.drive,
            driveId: config.onedrive.driveId,
            query: "?$filter=" + encodeURIComponent(`folder ne null or ${this.getExtensionFilter()}`),
        });
        const entities = Object.values(response.value);

        for (let i=0; i < entities.length; i++) {
            const entity = entities[i];
            if (entity.file) {
                result.files.push({
                    id: entity.id,
                    name: entity.name,
                });
            } else if (entity.folder) {
                const folderInfo = await this.getFolderInfo(entity.id);
                folderInfo.name = entity.name;

                // only track non empty folders
                if (folderInfo.folders.length > 0 || folderInfo.files.length > 0) {
                    result.folders.push(folderInfo);
                }
            }
        }

        return result;
    }
}

export const OneDriveManager = new _OneDriveManager();
