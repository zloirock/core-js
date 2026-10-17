// Locals and generated memos stay inside the retained body, with every inner polyfill applied.
// Conditional realm-or-null returns stay guarded; unrelated local declarations allow proving
// a definite returned realm and injecting the static beyond it.
export const branchedBody = (() => {
  if (globalThis) {
    const inner = 'ab'.padStart(3, '-');
    return inner.length ? globalThis : null;
  }
  return null;
})()?.window?.JSON.parse('1');
