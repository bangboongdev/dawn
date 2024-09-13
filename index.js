import fetch from "node-fetch";
import fs from "fs";
import readline from "readline";

const keepaliveUrl =
  "https://www.aeropres.in/chromeapi/dawn/v1/userreward/keepalive";
const getPointsUrl =
  "https://www.aeropres.in/api/atom/v1/userreferral/getpoint";

// Hiển thị thông báo chào mừng
function displayWelcomeMessage() {
  console.log(`
       _ _                  _____    ___ 
      (_) |                |  _  |  /   |
  __ _ _| | __ _ _ __ __  _| |/' | / /| |
 / _\` | | |/ _\` | '_ \\\\ \\/ /  /| |/ /_| |
| (_| | | | (_| | | | |>  <\\ |_/ /\\___  |
 \\__, |_|_|\\__,_|_| |_/_/\\_\\\\___/     |_/
  __/ |                                  
 |___/                                   
  `);
}

// Đọc dữ liệu từ file
async function readDataFile(filename) {
  const accounts = [];
  const fileStream = fs.createReadStream(filename);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const [email, token] = line.split("|");
    accounts.push({ email, token });
  }

  return accounts;
}

// Lấy tổng số điểm
async function getTotalPoints(headers) {
  try {
    const response = await fetch(getPointsUrl, {
      method: "GET",
      headers,
      insecureHTTPParser: true,
    });

    if (response.ok) {
      const jsonResponse = await response.json();
      if (jsonResponse.status) {
        const rewardPointData = jsonResponse.data.rewardPoint;
        const referralPointData = jsonResponse.data.referralPoint;

        const totalPoints =
          (rewardPointData.points || 0) +
          (rewardPointData.registerpoints || 0) +
          (rewardPointData.signinpoints || 0) +
          (rewardPointData.twitter_x_id_points || 0) +
          (rewardPointData.discordid_points || 0) +
          (rewardPointData.telegramid_points || 0) +
          (rewardPointData.bonus_points || 0) +
          (referralPointData.commission || 0);

        return totalPoints;
      } else {
        console.log(
          `\x1b[Error fetching points: ${
            jsonResponse.message || "Unknown error"
          }\x1b[0m`
        );
      }
    } else if (response.status === 403) {
      console.log(
        `\x1b[Failed to retrieve points. Status code: ${response.status} - Forbidden. Token might be invalid or expired.\x1b[0m`
      );
    } else {
      console.log(
        `\x1b[Failed to retrieve points. Status code: ${response.status}\x1b[0m`
      );
    }
  } catch (error) {
    console.log(
      `\x1b[An error occurred while fetching points: ${error}\x1b[0m`
    );
  }
  return 0;
}

// Gửi yêu cầu keepalive
async function makeRequest(headers, email) {
  const keepalivePayload = {
    username: email,
    extensionid: "fpdkjdnhkakefebpekbdhillbhonfjjp",
    numberoftabs: 0,
    _v: "1.0.7",
  };

  try {
    const response = await fetch(keepaliveUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(keepalivePayload),
      insecureHTTPParser: true,
    });

    console.log(`Status Code: \x1b[94m${response.status}\x1b[0m`);

    if (response.ok) {
      const jsonResponse = await response.json();
      if (jsonResponse.message) {
        console.log(`\x1b[Sukses: ${jsonResponse.message}\x1b[0m`);
        return true;
      } else {
        console.log("\x1b[Message not found in response.\x1b[0m");
      }
    } else if (response.status === 403) {
      console.log(
        `\x1b[403 Forbidden. Email might be invalid for ${email}. Skipping...\x1b[0m`
      );
    } else if (response.status === 502) {
      console.log("\x1b[502 Bad Gateway. Try again later...\x1b[0m");
    }

    return false;
  } catch (error) {
    console.log(`\x1b[An error occurred: ${error}\x1b[0m`);
    return false;
  }
}

// Đếm ngược
function countdown(seconds) {
  let interval = setInterval(() => {
    if (seconds > 0) {
      process.stdout.write(
        `\x1b[95mRestarting in: ${seconds} seconds\x1b[0m\r`
      );
      seconds--;
    } else {
      clearInterval(interval);
      console.log("\n\x1b[Restarting the process...\x1b[0m\n");
    }
  }, 1000);
}

// Main logic
async function main() {
  displayWelcomeMessage();

  while (true) {
    const accounts = await readDataFile("data.txt");
    let totalAccumulatedPoints = 0;

    for (const account of accounts) {
      const { email, token } = account;

      const headers = {
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      };

      console.log(`\x1b[96mProcessing account: ${email}\x1b[0m`);

      const points = await getTotalPoints(headers);
      totalAccumulatedPoints += points;

      const success = await makeRequest(headers, email);
      if (success) {
        console.log(`\x1b[Request for ${email} was successful.\x1b[0m\n`);
      } else {
        console.log(`\x1b[Request for ${email} failed.\x1b[0m\n`);
      }
    }

    console.log(`\x1b[All accounts have been processed.\x1b[0m`);
    console.log(
      `\x1b[Total points from all users: ${totalAccumulatedPoints}\x1b[0m`
    );

    countdown(181);
  }
}

main();
