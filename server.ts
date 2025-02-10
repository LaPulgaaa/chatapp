import http from "http";

import { WebSocketServer } from "ws";

import { express_app } from "./bin";
import { ws } from "./server/socket/index";
import { start_worker } from "./server/workers";

const port = 3001;

function main() {
  try {
    const server = http.createServer(express_app);
    const wss = new WebSocketServer({ server });

    ws(wss);

    server.listen(port, () => {
      console.log("listening on port 3001, ws server connected!");
    });
    start_worker();
  } catch (err) {
    console.log(err);
  }
}

main();
