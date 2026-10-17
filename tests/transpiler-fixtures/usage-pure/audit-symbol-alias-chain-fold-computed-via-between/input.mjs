// the key EVALUATES at the destructure - a later same-scope flip cannot reach the captured
// binding, so the reaching value AT THE CAPTURE ('Symbol') drives the fold
let kb = 'Array';
kb = 'Symbol';
const { [kb]: BetweenSymbol } = globalThis;
kb = 'Array';
const { iterator: viaBetween = fb } = BetweenSymbol;
export const l = [21, 22][viaBetween];
