// three-level deeply nested conditional fallback receiver: each branch reaches its own
// constructor. fallback-branch flatten recurses through nested ConditionalExpression both
// in consequent and alternate, collecting metas from all four leaves: Array, Map, Set,
// Iterator. usage-global enumerates each branch's polyfill dependency separately
export const { from } = cond1
  ? (cond2 ? Array : Map)
  : (cond3 ? Set : Iterator);
