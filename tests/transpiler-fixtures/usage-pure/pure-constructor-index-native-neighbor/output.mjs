import _Promise$race from "@core-js/pure/actual/promise/race";
// The pure import keeps its own method; a separate native receiver still needs its static.
import P from "@core-js/pure/actual/promise";
export const all = P.all;
export const race = _Promise$race;