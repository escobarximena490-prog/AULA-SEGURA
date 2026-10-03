const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  port: Number(process.env.MYSQL_ADDON_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  timezone: 'Z',
  dateStrings: true,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
