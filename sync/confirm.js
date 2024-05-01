const readline = require("readline");

// Create an interface for readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask confirmation question
async function askConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close(); // Close the readline interface
      resolve(answer.toLowerCase() === "y");
    });
  });
}

module.exports = {
  askConfirmation,
};
