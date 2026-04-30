import _atMaybeString from "@core-js/pure/actual/string/instance/at";
declare function isStr(x: unknown): x is string;
function loopOver(items: unknown[]) {
  let cur: unknown = items[0];
  for (let i = 0; i < items.length; i++) {
    if (isStr(cur)) {
      _atMaybeString(cur).call(cur, 0);
    }
    cur = items[i + 1];
  }
}