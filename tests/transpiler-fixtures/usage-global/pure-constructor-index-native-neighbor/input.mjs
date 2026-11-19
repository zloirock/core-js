// The pure import keeps its own method; a separate native receiver still needs its static.
import P from "@core-js/pure/actual/promise";
export const all = P.all;
export const race = Promise.race;
