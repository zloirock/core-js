// a value-only DETECT reads whether the object EXISTS and nothing off it: usage-global owes it the
// bare namespace entry and no method modules, and an ESCAPE of the same namespace owes the family - its
// own fixture. pure substitutes the namespace, always an object here, so the test is decided and folds
// to its answer, owing nothing
export const supported = globalThis.Reflect ? "yes" : "no";
