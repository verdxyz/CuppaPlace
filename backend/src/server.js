require("dotenv").config();
const http = require("http");
const app = require("./app");
const { sequelize } = require("./models");

const { Server } = require("socket.io");
const { initLiveSocket } = require("./socket/liveSocket");
const PORT = Number(process.env.PORT) || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("[DB] connected");
    await sequelize.sync({ alter: true });
    console.log("[DB] synced");

    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: (process.env.CORS_ORIGIN || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        credentials: false,
      },
    });

    initLiveSocket(io);

    httpServer.listen(PORT, () => {
      console.log(`Cuppa backend running at http://localhost:${PORT}`);
      console.log(`Socket.IO active`);
    });
  } catch (e) {
    console.error("[bootstrap error]", e);
    process.exit(1);
  }
})();
