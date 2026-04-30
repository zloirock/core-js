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
