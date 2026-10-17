import _Map from "@core-js/pure/actual/map";
// Reading a static through a destructured awaited head retains the same obligation as a member.
// The constructor stays local; only the named static is needed in global mode.
async function use() {
  for await (const value of [_Map]) {
    const {
      groupBy
    } = value;
    groupBy([1], x => x);
  }
}
use();