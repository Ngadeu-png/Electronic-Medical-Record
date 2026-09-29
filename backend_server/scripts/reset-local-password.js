const path = require("path");
const readline = require("readline");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/emedical";

function isLocalMongoUri(uri) {
  const authority = uri.match(/^mongodb(?:\+srv)?:\/\/([^/?]+)/i)?.[1];
  const host = authority?.split("@").pop().split(":")[0].replace(/^\[|\]$/g, "").toLowerCase();
  return ["localhost", "127.0.0.1", "::1"].includes(host);
}

function ask(question) {
  const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => prompt.question(question, (answer) => {
    prompt.close();
    resolve(answer.trim());
  }));
}

function askHidden(question) {
  if (!process.stdin.isTTY || !process.stdin.setRawMode) {
    throw new Error("Run this script in an interactive terminal so the password can be hidden.");
  }

  return new Promise((resolve, reject) => {
    const input = process.stdin;
    let value = "";
    process.stdout.write(question);
    input.setEncoding("utf8");
    input.setRawMode(true);
    input.resume();

    const finish = (error) => {
      input.removeListener("data", onData);
      input.setRawMode(false);
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };

    const onData = (chunk) => {
      for (const character of chunk) {
        if (character === "\u0003") return finish(new Error("Cancelled."));
        if (character === "\r" || character === "\n") return finish();
        if (character === "\u0008" || character === "\u007f") value = value.slice(0, -1);
        else if (character >= " ") value += character;
      }
    };

    input.on("data", onData);
  });
}

function maskEmail(email) {
  const [name, domain] = email.split("@");
  if (!domain) return "(invalid email)";
  return `${name.charAt(0)}***@${domain}`;
}

async function main() {
  if (!isLocalMongoUri(mongoUri)) {
    throw new Error("Refusing to reset a password unless MONGO_URI points to localhost or 127.0.0.1.");
  }

  await mongoose.connect(mongoUri);
  const { User } = require("../src/models/db-models");
  const users = await User.find().select("username email role").sort({ username: 1 });
  if (users.length === 0) throw new Error("No accounts found in the local database.");

  console.log("Local accounts:");
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.username} (${user.role}) - ${maskEmail(user.email)}`);
  });

  const selectedIndex = Number(await ask("Select account number: ")) - 1;
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= users.length) {
    throw new Error("Invalid account selection.");
  }

  const password = await askHidden("New password (input hidden): ");
  const confirmation = await askHidden("Confirm new password: ");
  if (password.length < 8) throw new Error("Use a password with at least 8 characters.");
  if (password !== confirmation) throw new Error("Passwords do not match.");

  const user = users[selectedIndex];
  user.password = await bcrypt.hash(password, 10);
  await user.save();
  console.log(`Password updated for ${user.username} (${user.role}).`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });