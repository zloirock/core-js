// Storing a fixed local method result does not lose its constructor identity.
// The call stays in the initializer; reading the static does not require the full family.
const source = { read() { return Map; } };
const Constructor = source.read();
export const method = Constructor.groupBy;
