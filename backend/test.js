const bcrypt = require("bcrypt");

async function testPassword() {
  const storedHash = "$2b$10$.8GdRHtjpiWhhFSy3aaRoONqVEimR50AXpQN8bAcIjeUjF8l4UD6m"; // Latest stored hash
  const enteredPassword = "shetty.12345"; // Password you entered

  const isMatch = await bcrypt.compare(enteredPassword, storedHash);
  console.log("Password Match Result:", isMatch);
}

testPassword();
