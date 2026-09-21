// An explicit pure constructor index needs no global injection for its static read.
import P from "@core-js/pure/actual/promise";
const R = (hit(), P);
export const all = R.all;