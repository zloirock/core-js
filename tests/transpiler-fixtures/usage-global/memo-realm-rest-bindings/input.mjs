// A sequence initializer runs before both the nested static and constructor bind.
// Keeping their keys out of rest does not transfer either binding to another capture.
const { Math: { trunc }, Map: Local, ...rest } = (effect(), globalThis);
use(trunc, Local, rest);
