import _globalThis from "@core-js/pure/actual/global-this";
// A static claim whose receiver navigates 2+ UNDEFINABLE optional hops STANDS DOWN: no single test expresses
// the union, so the raw chain is kept verbatim. two obligations: (1) resolve the standdown BEFORE injecting
// the pure import, else the kept-raw chain strands a DEAD pure import (the injected binding is never
// referenced); (2) the kept-raw chain's proxy-global ROOT must still polyfill - a raw `globalThis`
// ReferenceErrors on ie:11 (babel collapses the root, keeps the raw tail). covers the static-ERASE claim (a
// ctor: `.Set`) and the static-FALLBACK swap (an unknown member off a ctor: `.Promise.noSuchStatic`), each
// rooted at a LITERAL proxy global (root collapses to `_globalThis`) and at an ALIAS of one (root already the
// pure binding via its own declaration, kept verbatim).
const g = _globalThis;

// literal root: standdown keeps the raw tail, root collapses to `_globalThis`; NO dead `_Set`
export const litErased = _globalThis.window?.self?.Set;

// literal root through the static-FALLBACK path; root collapses, NO dead `_Promise`
export const litFell = _globalThis.window?.self?.Promise.noSuchStatic;

// alias root: the tail stays raw and the root rides its own `const g = _globalThis` binding; NO dead `_Map`
export const aliasErased = g.window?.self?.Map;