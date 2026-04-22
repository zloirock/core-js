// direct self-cycle: visited Set bails on the first repeat instead of letting
// MAX_DEPTH counter exhaust through 64 useless iterations
type Self = Self;
declare const x: Self;
const r = (x as any).at(0);
globalThis.__r = r;
