// A supplied pure constructor index already owns its statics; method identity survives another pass.
import P from "@core-js/pure/actual/promise";
const R = (hit(), P);
export const all = R.all;
