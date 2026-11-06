import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// an `in` test over a `||` / `??` whose left is a for-of head over a built-in, the right dead, probes the
// head spelled alone: the build answers it where the head's element carries the key
for (const M of [_Map]) use(true);
for (const P of [_Promise]) use(true);