// A supplied pure constructor index also serves destructured static reads.
// Keep the method identity and receiver effects without another polyfill import.
import P from "@core-js/pure/actual/promise";
export const { all } = (hit(), P);
