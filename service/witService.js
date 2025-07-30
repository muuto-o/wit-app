import pkg from "node-wit";
const { Wit } = pkg;
import dotenv from "dotenv";
dotenv.config();

const witClient = new Wit({ accessToken: process.env.WIT_TOKEN });

export default async function processMessageWithWit(message) {
  try {
    const response = await witClient.message(message);
    return response;
  } catch (err) {
    console.error("Wit error:", err);
    return null;
  }
}
