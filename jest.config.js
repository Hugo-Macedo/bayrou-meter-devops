/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  // On cible les tests du dossier API
  roots: ["<rootDir>/api"],
  // Extension des tests
  testMatch: ["**/?(*.)+(test|spec).[jt]s"],
  transform: {},
  clearMocks: true,
};