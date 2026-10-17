// In pure, a plain proxy run landing on a backed leaf has the same value when written inline,
// held in an alias, or extracted from a container. An optional above that stored value
// is redundant in every spelling. A source optional inside the run and a terminal
// environment probe keep their guards and the stored undefined value.
let inlineStored, aliasStored, extractedStored, optionalStored, terminalStored;
export const inline = (inlineStored = globalThis.window.self)?.Array.of(1);
const alias = globalThis.window.self;
export const aliased = (aliasStored = alias)?.Object.entries({ a: 2 });
const [extracted] = [globalThis.window.self];
export const destructured = (extractedStored = extracted)?.Math.hypot(3, 4);
export const optional = (optionalStored = globalThis.window?.self)?.Array.from([5]);
export const terminal = (terminalStored = globalThis.self.window)?.Object.fromEntries([['b', 6]]);
export { inlineStored, aliasStored, extractedStored, optionalStored, terminalStored };
