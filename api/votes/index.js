const { containers } = require("../shared/cosmosClient");

module.exports = async function (context, req) {
  try {
    const { votes } = containers();

    // Récupérer tous les votes
    const query = {
      query: "SELECT c.id, c.userId, c.choice, c.createdAt FROM c WHERE c.type = @type",
      parameters: [{ name: "@type", value: "vote" }],
    };
    const { resources: items } = await votes.items.query(query).fetchAll();

    // Calcul du pourcentage de oui et non 
    let total = items.length;
    let oui = items.filter(v => v.choice === "oui").length;
    let non = items.filter(v => v.choice === "non").length;
    let pctOui = total ? Math.round((oui / total) * 100) : 0;
    let pctNon = total ? Math.round((non / total) * 100) : 0;

    context.res = {
      status: 200,
      body: {
        votes: items,
        stats: { total, oui, non, pctOui, pctNon }
      }
    };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: "internal_error", details: err.message } };
  }
};
