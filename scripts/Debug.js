import { CommandManager } from "./CommandManager.js";

class _Debug {
    log (msg, component = "-") {
        const severity = "🟦";
        const message = this._buildMessage(msg, component, severity);
        console.log(message);
        CommandManager.invokeCommand("sendDebug", message);
    }

    warn (msg, component = "-") {
        const severity = "🟨";
        const message = this._buildMessage(msg, component, severity);
        console.warn(message);
        CommandManager.invokeCommand("sendDebug", message);
    }

    error (msg, component = "-") {
        const severity = "🟥";
        const message = this._buildMessage(msg, component, severity);
        console.error(message);
        CommandManager.invokeCommand("sendDebug", message);
        CommandManager.invokeCommand("sendAlert", message);
    }

    _buildMessage (msg, component, severity) {
        if (typeof msg === "object") {
            msg = JSON.stringify(msg, null, 2);
        }

        const time = new Date().toISOString();
        const message = `${severity} ${time}: ${component}\n${msg}`;
        return message;
    }
}

export const Debug = new _Debug();