import fetch from "node-fetch";
import axios from "axios";
import colors from "colors";
import csvdb from "csv-database";
import { HttpsProxyAgent } from "https-proxy-agent";
import https from "https";
import wordlist  from "wordlist-english";
const englishWords = wordlist['english'];
import crypto from "crypto";
const discordUrl = "https://discord.com/api/v9/interactions";

// Hiển thị thông báo chào mừng
// Function to generate a random 19-digit nonce
function generateNonce() {
  const randomBuffer = crypto.randomBytes(8); // Generate 8 random bytes
  const randomBigInt = BigInt(`0x${randomBuffer.toString("hex")}`);

  // Convert it to a number within the range of 19 digits
  const nonce = randomBigInt % BigInt("10000000000000000000"); // Ensure it's within 19 digits
  return nonce.toString().padStart(19, "0"); // Pad with leading zeros if necessary
}

const getRandomWords = (n) => {
  let randomWords = "";

  for (let i = 0; i < n; i++) {
    const randomIndex = Math.floor(Math.random() * englishWords.length);
    randomWords =englishWords[randomIndex];
  }

  return randomWords;
};

class Oasis {
  constructor(
    application_id,
    guild_id,
    channel_id,
    session_id,
    proxiesConf = null,
    access_token,
    id
  ) {
    this.headers = {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      authorization: access_token,
      origin: "https://discord.com",
      pragma: "no - cache",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "Windows",
      "sec-fetch-mode": "cors",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "x-super-properties":
        "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEyNC4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTI0LjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiJodHRwczovL3d3dy5nb29nbGUuY29tLyIsInJlZmVycmluZ19kb21haW4iOiJ3d3cuZ29vZ2xlLmNvbSIsInNlYXJjaF9lbmdpbmUiOiJnb29nbGUiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MzI3NDQ2LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
      "Content-Type": "application/json",
      Host: "discord.com",
      Connection: "keep-alive",
    };
    // this.tele_data = tele_data;
    this.access_token = access_token;
    //Proxy
    this.application_id = '1238009056451498024';
    this.guild_id = guild_id;
    this.channel_id = channel_id;
    this.session_id = session_id;
    this.proxies = proxiesConf;

    this.agent = proxiesConf ? new HttpsProxyAgent(proxiesConf) : null;
    this.id = id;
  }

  log(msg, type) {
    const now = new Date();
    const datetime = now.toLocaleString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    switch (type) {
      case "success":
        console.log(`[${datetime}] [*] ${this.id} ${msg}`.green);
        break;
      case "custom":
        console.log(`[${datetime}] [*] ${this.id} ${msg}`);
        break;
      case "error":
        console.log(`[${datetime}] [!] ${this.id} ${msg}`.red);
        break;
      case "warning":
        console.log(`[${datetime}] [*] ${this.id} ${msg}`.yellow);
        break;
      default:
        console.log(`[${datetime}] [*] ${this.id} ${msg}`.blue);
    }
  }

  async genaratePrompt() {
    const englishWords = getRandomWords(1);
    const body = {
      type: 2,
      application_id: this.application_id,
      guild_id: this.guild_id,
      channel_id: this.channel_id,
      session_id: this.session_id,
      data: {
        version: "1274236506441121903",
        id: "1260352671240425564",
        name: "generate",
        type: 1,
        options: [
          {
            type: 3,
            name: "prompt",
            value: englishWords,
          },
        ],
        application_command: {
          id: "1260352671240425564",
          type: 1,
          application_id: this.application_id,
          version: "1274236506441121903",
          name: "generate",
          description: "Generate imagery using Oasis' image generation model.",
          options: [
            {
              type: 3,
              name: "prompt",
              description: "The prompt to use",
              required: true,
              min_length: 1,
              max_length: 1000,
              description_localized: "The prompt to use",
              name_localized: "prompt",
            },
            {
              type: 4,
              name: "seed",
              description: "Used to limit randomness.",
              required: false,
              min_value: 0,
              max_value: 1000000,
              description_localized: "Used to limit randomness.",
              name_localized: "seed",
            },
            {
              type: 4,
              name: "guidance-scale",
              description: "Used to determine how close output is to prompt.",
              required: false,
              min_value: 1,
              max_value: 10,
              description_localized:
                "Used to determine how close output is to prompt.",
              name_localized: "guidance-scale",
            },
          ],
          dm_permission: true,
          contexts: [0, 1, 2],
          integration_types: [0, 1],
          global_popularity_rank: 1,
          description_localized:
            "Generate imagery using Oasis' image generation model.",
          name_localized: "generate",
        },
        attachments: [],
      },
      nonce: generateNonce(),
      analytics_location: "slash_ui",
    };

    const options = {
      headers: this.headers,
      agent: this.agent,
      method: "POST",
      maxBodyLength: Infinity,
      data: JSON.stringify(body),
      url: discordUrl,
    };

    try {
      const response = await axios.request(options);
      return response.status;
    } catch (error) {
      this.log(`An error occurred: ${error}`);
      return false;
    }
  }

  //Claim token
  async runOasis() {
    let delay = 24 * 60 * 60 * 1000;
    try {
      for (let index = 0; index < 200; index++) {
        const random = randomSleep();
        this.log("Sleep time " + random, "warning");
        await sleep(random); 
        const statusCode = await this.genaratePrompt();
        statusCode == 204 ? this.log("Genarate Prompt Success: " + statusCode, "success") : this.log("Genarate Prompt Error: " + statusCode, "error"); ;
      }
    } catch (error) {
      console.log("Error: " + error, "error");
    }
    this.log("Sleep time: " + delay / 1000 / 60, "warning");
    return new Promise((resolve) => {
      setTimeout(async () => {
        await this.runOasis();
      }, delay);
    });
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runBot(record) {
  const {
    active,
    access_token,
    application_id,
    guild_id,
    channel_id,
    session_id,
    id,
    proxy_url,
  } = record;
  const time = new Oasis(
    application_id,
    guild_id,
    channel_id,
    session_id,
    proxy_url,
    access_token,
    id
  );
  // Chỉ chạy những trường hợp active =1
  if (active == 1) {
    await time.runOasis();
  }
}

async function bot() {
  const records = await db.get();
  Promise.all(records.map((record) => runBot(record)))
    .then(() => {
      console.log("All operations completed");
    })
    .catch((error) => {
      console.log("An error occurred during operation: ", error);
    });
}

const db = await csvdb(
  "oasis.csv",
  [
    "id",
    "active",
    "application_id",
    "guild_id",
    "channel_id",
    "session_id",
    "proxy_url",
    "access_token",
  ],
  ","
);

function randomSleep(min = 125, max = 200) {
  return Math.floor(
    Math.random() * (max * 1000 - min * 1000 + 1000) + min * 1000
  );
}

async function main() {
  await bot();
}
main();
