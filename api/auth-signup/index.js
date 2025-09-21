const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const { containers } = require("../shared/cosmosClient");

const SECRET = process.env.AUTH_JWT_SECRET;

module.exports = async function (context, req) {
  try {
    const { email, pseudo } = req.body || {};
    if (!email || !pseudo) {
      context.res = { status: 400, headers: { "Content-Type": "application/json" }, body: { error: "email et pseudo requis" } };
      return;
    }

    const { users } = containers();
    const { resources: existing } = await users.items
      .query({ query: "SELECT * FROM c WHERE c.type='user' AND c.email=@e", parameters: [{ name: "@e", value: email }] })
      .fetchAll();

    if (existing.length > 0) {
      context.res = { status: 409, headers: { "Content-Type": "application/json" }, body: { error: "email déjà utilisé" } };
      return;
    }

    const user = { id: uuid(), pseudo, email, createdAt: new Date().toISOString(), type: "user" };
    await users.items.create(user);

    const token = jwt.sign({ sub: user.id, email: user.email, pseudo: user.pseudo }, SECRET, { expiresIn: "7d" });

    context.res = { status: 201, headers: { "Content-Type": "application/json" }, body: { token, user } };
  } catch (e) {
    context.log.error(e);
    context.res = { status: 500, headers: { "Content-Type": "application/json" }, body: { error: "erreur serveur" } };
  }
};
