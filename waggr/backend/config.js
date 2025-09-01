require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const PORT = +process.env.PORT || 3001;
const BCRYPT_WORK_FACTOR = process.env.BCRYPT_WORK_FACTOR ? +process.env.BCRYPT_WORK_FACTOR : 12;

function getDatabaseUri() {
  // Always use waggr database, even for tests
  return process.env.DATABASE_URL || "postgresql:///waggr";
}

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
