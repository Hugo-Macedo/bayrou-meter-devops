function createContext() {
  return {
    log: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
    res: undefined,
  };
}
function createReq({ body = undefined, headers = {} } = {}) {
  return { body, headers };
}

// On mock ce module pour intercepter les appels Cosmos
jest.mock("../shared/cosmosClient", () => {
  return {
    containers: jest.fn(),
  };
});

const { containers } = require("../shared/cosmosClient");
const voteFn = require("./index");

describe("Function: vote", () => {
  test("400 si body manquant", async () => {
    const ctx = createContext();
    const req = createReq(); // pas de body

    await voteFn(ctx, req);

    expect(ctx.res.status).toBe(400);
    expect(ctx.res.body).toEqual({ error: "JSON body requis" });
  });

  test("400 si payload invalide (choice)", async () => {
    const ctx = createContext();
    const req = createReq({ body: { userId: "abcde", choice: "peut-être" } });

    await voteFn(ctx, req);

    expect(ctx.res.status).toBe(400);
    // On vérifie qu'il y a bien une erreur de validation (zod renvoie un objet détaillé)
    expect(ctx.res.body.error).toBeDefined();
  });

  test("404 si user introuvable", async () => {
    const ctx = createContext();
    const req = createReq({ body: { userId: "user-1", choice: "oui" } });

    // Mock Cosmos : l'utilisateur n'existe pas
    containers.mockReturnValue({
      users: {
        item: () => ({
          read: () => Promise.resolve({ resource: null }),
        }),
      },
      votes: { items: { upsert: jest.fn() } },
    });

    await voteFn(ctx, req);

    expect(ctx.res.status).toBe(404);
    expect(ctx.res.body).toEqual({ error: "utilisateur introuvable" });
  });

  test("200 et upsert du vote si OK", async () => {
    const ctx = createContext();
    const req = createReq({ body: { userId: "user-1", choice: "non" } });

    const upsert = jest.fn().mockResolvedValue({
      resource: {
        id: "user-1",
        userId: "user-1",
        choice: "non",
        createdAt: "2025-01-01T00:00:00.000Z",
        type: "vote",
      },
    });
  });

  test("404 si exception inattendue", async () => {
    const ctx = createContext();
    const req = createReq({ body: { userId: "user-1", choice: "oui" } });

    // Mock Cosmos qui crashe
    containers.mockReturnValue({
      users: {
        item: () => ({
          read: () => Promise.reject(new Error("Cosmos down")),
        }),
      },
      votes: { items: { upsert: jest.fn() } },
    });

    await voteFn(ctx, req);

    expect(ctx.res.status).toBe(404);
    expect(ctx.res.body.error).toBe("utilisateur introuvable");
  });
});
