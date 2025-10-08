import { GoogleAuth } from "google-auth-library";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Resolve absolute path to your service account JSON
const SERVICE_ACCOUNT_PATH = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);

async function testToken() {
  try {
    const auth = new GoogleAuth({
      keyFile: SERVICE_ACCOUNT_PATH,
      scopes: ["https://www.googleapis.com/auth/vertex-ai"], // Required for Gemini API
    });

    const client = await auth.getClient();
    const tokenObj = await client.getAccessToken();

    if (!tokenObj.token) {
      throw new Error("Failed to generate access token");
    }

    console.log("✅ Access Token generated successfully:");
    console.log(tokenObj.token);
  } catch (err) {
    console.error("❌ Error generating token:", err.message);
  }
}

testToken();
