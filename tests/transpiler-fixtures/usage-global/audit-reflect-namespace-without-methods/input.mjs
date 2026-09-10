// a value-only DETECT reads whether the object EXISTS and nothing off it, so it owes the bare
// namespace entry and no method modules. an ESCAPE of the same namespace is the other question and
// owes the family - its own fixture, because the family here would swallow this evidence whole
export const supported = globalThis.Reflect ? "yes" : "no";
