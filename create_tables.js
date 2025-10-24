const db = require("./database_helper");

const createRegisterUserTable = `
CREATE TABLE IF NOT EXISTS registeruser (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);
`;

db.query(createRegisterUserTable)
  .then(() => {
    console.log("registeruser table created successfully.");
    process.exit(0);
  })
  .catch(err => {
    console.error("Error creating table:", err);
    process.exit(1);
  });
