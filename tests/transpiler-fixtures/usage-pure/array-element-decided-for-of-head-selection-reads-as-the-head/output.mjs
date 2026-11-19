import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// an array element holding a `||` / `??` whose left is a for-of head over built-ins, the right dead, is
// read as the head spelled alone: a static a sibling element sits beside is extracted as the head's - the
// element's own read lacks it on an old engine - and a sole element's re-read reuses the head's name
for (const M of [_Map]) {
  const [{
    groupBy
  }, count] = [M, 1];
  use(groupBy, count);
}
for (const P of [_Promise]) {
  const [{
    try: attempt
  }] = [P];
  use(attempt);
}