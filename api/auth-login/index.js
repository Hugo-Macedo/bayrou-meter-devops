// api/auth-login/index.js
const jwt = require("jsonwebtoken");
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
    const { resources } = await users.items
      .query({
        query: "SELECT * FROM c WHERE c.type='user' AND c.email=@e",
        parameters: [{ name: "@e", value: email }]
      })
      .fetchAll();

    if (resources.length === 0) {
      context.res = { status: 401, headers: { "Content-Type": "application/json" }, body: { error: "utilisateur introuvable" } };
      return;
    }

    const user = resources[0];
    
    if (user.pseudo !== pseudo) {
      context.res = { status: 401, headers: { "Content-Type": "application/json" }, body: { error: "pseudo incorrect" } };
      return;
    }

    const token = jwt.sign({ sub: user.id, email: user.email, pseudo: user.pseudo }, SECRET, { expiresIn: "7d" });

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { token, user }
    };
  } catch (e) {
    context.log.error(e);
    context.res = { status: 500, headers: { "Content-Type": "application/json" }, body: { error: "erreur serveur" } };
  }
};
