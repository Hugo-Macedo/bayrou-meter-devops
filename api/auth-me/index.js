const jwt = require("jsonwebtoken");
const { containers } = require("../shared/cosmosClient");

const SECRET = process.env.AUTH_JWT_SECRET;

module.exports = async function (context, req) {
  try {
    const auth = req.headers["authorization"] || "";
    const match = auth.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      context.res = { status: 401, jsonBody: { error: "token manquant" } };
      return;
    }

    const payload = jwt.verify(match[1], SECRET); // throw si invalide

    const { users } = containers();

    // Partition key = "/id" (comme tu as créé ton container)
    const { resource: user } = await users.item(payload.sub, payload.sub).read();

    if (!user) {
      context.res = { status: 404, jsonBody: { error: "utilisateur introuvable" } };
      return;
    }

    context.res = { status: 200, jsonBody: { user } };
  } catch (e) {
    const status = e.name === "JsonWebTokenError" || e.name === "TokenExpiredError" ? 401 : 500;
    context.log.warn(e);
    context.res = { status, jsonBody: { error: status === 401 ? "token invalide" : "erreur serveur" } };
  }
};
