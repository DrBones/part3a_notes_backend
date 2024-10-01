import "dotenv/config";

const PORT = process.env.PORT;
let TESTING;
let MONGODB_URI;
// let MONGODB_URI =
//   process.env.NODE_ENV === "test"
//     ? process.env.TEST_MONGODB_URI
//     : process.env.MONGODB_URI;
if (process.env.NODE_ENV === "test") {
  MONGODB_URI = process.env.TEST_MONGODB_URI;
  TESTING = true;
} else {
  MONGODB_URI = process.env.MONGODB_URI;
  TESTING = false;
}

export default {
  MONGODB_URI,
  PORT,
  TESTING,
};
