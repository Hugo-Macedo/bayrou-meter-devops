const { containers } = require("../shared/cosmosClient");

module.exports = async function (context, req) {
  try {
    // 1. Récupère tous les votes
    const { resources: votes } = await containers().votes.items.readAll().fetchAll();

    // 2. Récupère tous les users
    const { resources: users } = await containers().users.items.readAll().fetchAll();

    // 3. Index des users par id
    const userMap = {};
    for (const u of users) {
      userMap[u.id] = u;
    }

    // 4. Enrichit les votes avec le pseudo
    const enrichedVotes = votes.map(v => ({
      ...v,
      userPseudo: userMap[v.userId]?.pseudo || "Anonyme",
    }));

    // 5. Stats
    const total = enrichedVotes.length;
    const oui = enrichedVotes.filter(v => v.choice === "oui").length;
    const non = total - oui;
    const pctOui = total > 0 ? Math.round((oui / total) * 100) : 0;
    const pctNon = 100 - pctOui;

    context.res = {
      body: {
        votes: enrichedVotes,
        stats: { total, oui, non, pctOui, pctNon },
      },
    };
  } catch (err) {
    context.res = { status: 500, body: { error: err.message } };
  }
};
