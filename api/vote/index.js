const { z } = require("zod");
const { containers } = require("../shared/cosmosClient");

const VoteSchema = z.object({
  userId: z.string().min(5, "userId invalide"),
  choice: z.enum(["oui", "non"]),
});

module.exports = async function (context, req) {
  try {
    if (!req.body) {
      return (context.res = { status: 400, body: { error: "JSON body requis" } });
    }

    const parsed = VoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return (context.res = { status: 400, body: { error: parsed.error.flatten() } });
    }

    const { userId, choice } = parsed.data;
    const { users, votes } = containers();

    // Vérification de l'utilisateur + upsert du vote
    const { resource: user } = await users.item(userId, userId).read().catch(() => ({ resource: null }));
    if (!user || user.type !== "user") {
      return (context.res = { status: 404, body: { error: "utilisateur introuvable" } });
    }

    // Upsert du vote (1 vote par user)
    const now = new Date().toISOString();
    const vote = {
      id: userId,          
      userId,
      choice,               // "oui" | "non"
      createdAt: now,
      type: "vote"
    };

    const { resource: saved } = await votes.items.upsert(vote, { disableAutomaticIdGeneration: true });
    context.res = { status: 200, body: saved };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: "internal_error", details: err.message } };
  }
};
