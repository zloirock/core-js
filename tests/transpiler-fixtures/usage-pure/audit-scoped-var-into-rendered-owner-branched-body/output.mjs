import _globalThis from "@core-js/pure/actual/global-this";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// Locals and generated memos stay inside the retained body, with every inner polyfill applied.
// Conditional realm-or-null returns stay guarded; unrelated local declarations allow proving
// a definite returned realm and injecting the static beyond it.
export const branchedBody = (() => {
  if (_globalThis) {
    const inner = _padStartMaybeString('ab').call('ab', 3, '-');
    return inner.length ? _globalThis : null;
  }
  return null;
})()?.window?.JSON.parse('1');