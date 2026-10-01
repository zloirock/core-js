// A consumed destructuring assignment yields its original receiver.
// The retained receiver keeps its global polyfill and the static binding is still served.
function eff() {}
let Map, Set;
export const host = ({ Map } = (eff(), globalThis));
// ... the discriminating twin: as a non-tail sequence element nobody reads what the assignment
// yields, so the consume runs and the receiver drops with the destructure
export const r = (({ Set } = (eff(), globalThis)), typeof Set);
export { Map, Set };
