import "core-js/modules/es.string.includes";
// namespace-FIRST twin: the merged binding re-anchors onto the real same-scope declaration,
// so the receiver keeps its string narrow and only the string polyfill injects (the dead-end
// walk degraded to the generic multi-type set)
namespace N {
  export const s = [1, 2];
}
const s = "abc";
export const r = s.includes("a");