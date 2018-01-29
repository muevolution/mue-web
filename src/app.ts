import { AuthRequest, ClientToServer, ServerToClient } from "@mue/client-types";
import * as socketio from "socket.io-client";

import { TypedEmitter } from "./common";
import { config } from "./config";

const webInput = document.getElementById("input") as HTMLInputElement;
const webSubmit = document.getElementById("send") as HTMLInputElement;
const webOutput = document.getElementById("output") as HTMLDivElement;

function writeOutput(message: string) {
    const d = document.createElement("div");
    d.innerText = message;
    webOutput.appendChild(d);
}

function connect() {
    let isAuthenticated = false;
    let authInfo: AuthRequest = null;

    const sSocket = socketio(config.target_url);
    const tsock = new TypedEmitter<ClientToServer, ServerToClient>(sSocket);

    webSubmit.addEventListener("click", (ev) => {
        const data = webInput.value;
        webInput.value = null;

        if (isAuthenticated) {
            return tsock.emit("command", {"line": data});
        }

        if (data.startsWith("auth ") || data.startsWith("connect ")) {
            // Authenticate the user
            const split = data.split(" ");
            if (split.length < 3) {
                return writeOutput("TS> Not enough auth arguments");
            }

            authInfo = {"username": split[1], "password": split[2]};
            return tsock.emit("auth", authInfo);
        } else if (data.startsWith("quit")) {
            writeOutput("TS> Goodbye.");
            tsock.emit("close", "Client closed");
            sSocket.close();
            isAuthenticated = false;
            return;
        }

        writeOutput("Invalid input. Not yet authenticated.");
    });

    tsock.on("welcome", (motd) => {
        writeOutput("SYS> Connected to telnet bridge");
        writeOutput(`MOTD> ${motd}`);

        isAuthenticated = false;
        if (authInfo) {
            // Reauthenticate with existing credentials
            writeOutput("TS> It looks like we got disconnected. Reauthenticating...");
            return tsock.emit("auth", authInfo);
        }
    });

    tsock.on("auth", (data) => {
        if (data.success) {
            writeOutput(`AUTH> Success: ${data.message}`);
            isAuthenticated = true;
        } else {
            writeOutput(`AUTH> Failed: ${data.message}`);
            isAuthenticated = false;
            authInfo = null;
        }
    });

    tsock.on("message", (data) => {
        writeOutput(`[${data.target}] ${data.message}`);
        if (data.meta) {
            writeOutput(`>META> ${JSON.stringify(data.meta)}`);
        }
    });

    tsock.on("close", (reason) => {
        writeOutput(`QUIT> ${reason ? reason : "No reason given"}`);
        sSocket.close();
    });

    tsock.on("fatal", (data) => {
        writeOutput(`ERR> Got fatal error: ${data}`);
        sSocket.close();
    });

    tsock.on("error", (err) => {
        writeOutput(`ERR> Got connection error: ${err}\nTS> Attempting to reconnect.`);
        isAuthenticated = false;
    });
}

connect();
