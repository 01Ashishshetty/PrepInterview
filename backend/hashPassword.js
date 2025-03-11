const bcrypt = require("bcryptjs");

async function testHash() {
  const password = "@shish.12345"; // Enter the exact password you are testing
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Manually Hashed Password:", hashedPassword);
}

testHash();
