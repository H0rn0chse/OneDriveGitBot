import express from "express";
import { Deferred } from "./Deferred.js";

class _ClientManager {
    constructor () {
        this.port = 3000;
        this.callbackUrl = `http://localhost:${this.port}/callback`;

        this.app = express();
        this.deferred = new Deferred();
    }

    start () {
        this.app.listen(this.port, (err) => {
            if (err) {
                console.error(err)
                this.deferred.reject(err);
                return;
            }

            console.log(`Server listening at http://localhost:${this.port}`);
            this.deferred.resolve();
        })
        return this.deferred.promise;
    }

    get (...args) {
        this.app.get(...args);
    }
}

export const ClientManager = new _ClientManager();
