// optional-chain `.flat?.().at` inside catch-param destructure default needs `_ref` to
// cache the safe-call result for both null check and follow-up access. the resolvable
// key forces the receiver extraction, and the var-scope walk passes through CatchClause
// (param-subtree refs don't have body as ancestor); the anchor must recognize
// CatchClause so `var _ref;` lands inside the catch body
function probe(arr) {
  try {
    throw {};
  } catch ({ at = arr.flat?.().at }) {
    return at;
  }
}
export { probe };
