const { v4: uuidv4 } = require("uuid");
const { z } = require("zod");
const { containers } = require("../shared/cosmosClient");

const UserSchema = z.object({
  pseudo: z.string().min(2, "pseudo trop court"),
  email: z.string().email("email invalide"),
});

module.exports = async function (context, req) {
  try {
    if (!req.body) {
      return (context.res = { status: 400, body: { error: "JSON body requis" } });
    }

    const parse = UserSchema.safeParse(req.body);
    if (!parse.success) {
      return (context.res = { status: 400, body: { error: parse.error.flatten() } });
    }

    const { pseudo, email } = parse.data;
    const { users } = containers();

    // Vérifier s'il existe déjà un user avec cet email
    const query = {
      query: "SELECT TOP 1 * FROM c WHERE c.type = @type AND c.email = @email",
      parameters: [
        { name: "@type", value: "user" },
        { name: "@email", value: email.toLowerCase() },
      ],
    };
    const { resources: existing } = await users.items.query(query).fetchAll();
    if (existing && existing.length > 0) {
      return (context.res = { status: 409, body: { error: "email déjà utilisé" } });
    }

    const now = new Date().toISOString();
    const user = {
      id: uuidv4(),
      pseudo,
      email: email.toLowerCase(),
      createdAt: now,
      type: "user",
    };

    const { resource: created } = await users.items.create(user);
    context.res = { status: 201, body: created };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: "internal_error", details: err.message } };
  }
};
