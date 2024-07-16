/** Common config for bookstore. */
require('dotenv').config();

let DB_URI = process.env.DATABASE_URL;

if (process.env.NODE_ENV === "test") {
  DB_URI = `${DB_URI}-test`;
} else {
  DB_URI = DB_URI;
}


module.exports = { DB_URI };