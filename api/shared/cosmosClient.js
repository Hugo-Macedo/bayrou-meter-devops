const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
const databaseId = process.env.COSMOS_DB_DATABASE || "polling-db";
const usersContainerId = process.env.COSMOS_DB_USERS_CONTAINER || "users";
const votesContainerId = process.env.COSMOS_DB_VOTES_CONTAINER || "votes";

if (!connectionString) {
  throw new Error("Missing COSMOS_DB_CONNECTION_STRING in env (local.settings.json).");
}

const client = new CosmosClient(connectionString);

function containers() {
  const database = client.database(databaseId);
  return {
    db: database,
    users: database.container(usersContainerId),
    votes: database.container(votesContainerId),
  };
}

module.exports = {
  client,
  containers,
  ids: {
    db: databaseId,
    users: usersContainerId,
    votes: votesContainerId,
  },
};
