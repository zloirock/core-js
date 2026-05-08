// guard `isStr(cur)` narrows inside the loop body, but `cur` may be reassigned each
// iteration. the narrow must apply at the use site within the same iteration despite
// loop-induced reassignability
declare function isStr(x: unknown): x is string;

function loopOver(items: unknown[]) {
  let cur: unknown = items[0];
  for (let i = 0; i < items.length; i++) {
    if (isStr(cur)) {
      cur.at(0);
    }
    cur = items[i + 1];
  }
}
