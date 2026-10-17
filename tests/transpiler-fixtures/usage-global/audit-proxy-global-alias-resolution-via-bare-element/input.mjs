// a bare-identifier array element binds the WHOLE proxy-global positionally
const [gb] = [globalThis];
export const viaBareElement = gb.Array.of(1);
