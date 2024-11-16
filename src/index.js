import dotenv from "dotenv";
import server from "./server.js";
import connectDB from "./db/index.js";

dotenv.config();
const PORT = process.env.API_PORT || 5001;

connectDB().then(() => {

  server.on("error", (error) => {
    console.log("ERROR", error);
    throw error;
  });

  server.listen(PORT, () => {
    console.log(`App server listening on ${PORT}`);
    console.log("--------------------------------------");
  })
})
.catch((error) => {
  console.log("MONGODB connection failed !!! ", error);
});
