// Variant of the bodyless-multi-decl repair on a loop host. distinct polyfill source
// (`Object.fromEntries`) and sibling shape (`n = 0`) from the `if` variant - pins
// emission per fixture and confirms the wrap path is host-agnostic (every bodyless
// statement slot benefits, not just `if`).
while (cond) var { fromEntries } = (logEntry(), Object), n = 0;
export { fromEntries, n };
