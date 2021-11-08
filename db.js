const { Client } = require("pg");


let DB_URI = (process.env.NODE_ENV === "test")
    ? "postgresql://postgres:postgres@localhost:5432/biztime_test"
    : "postgresql://postgres:postgres@localhost:5432/biztime";

let db = new Client({
    connectionString: DB_URI
});

db.connect();

module.exports = db