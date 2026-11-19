// Exclusions already served by extraction are claimed on the inserted properties.
// The native rest target and its independent computed-key read remain visitable.
let from;
const holder = {};
({ Array: { from, ...holder["rest".at(-1)] } } = globalThis);
export { from, holder };
