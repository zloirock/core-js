// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const g = globalThis;
const [{ Reflect: RE }, { JSON: JS }] = [g, g];
export const viaSharedAliasSecond = JS.rawJSON(input);
