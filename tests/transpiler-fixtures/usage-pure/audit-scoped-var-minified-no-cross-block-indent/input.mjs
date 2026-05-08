// minified single-line function body followed by an indented sibling: indent detector
// must bail at `}` so the inserted `var _ref;` doesn't pick up the unrelated next-block
// indent (`  nextLine` belongs to a sibling scope, not this body)
function probe(arr){ return new (arr.flat?.().at)(0); }
  function nextLine(){}
export { probe, nextLine };
