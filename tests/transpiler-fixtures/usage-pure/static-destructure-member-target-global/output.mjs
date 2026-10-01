import _globalThis from "@core-js/pure/actual/global-this";
// Writing a global static must keep the original assignment and its property semantics.
({
  from: _globalThis.Array.from
} = Array);