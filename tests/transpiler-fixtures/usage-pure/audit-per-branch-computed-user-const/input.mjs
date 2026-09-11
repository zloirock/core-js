// a user-const computed key (`const k = "from"`) in a CONDITIONAL destructure receiver must keep its
// polyfill on each viable branch: the key resolves to its static name (`from`) for the branch
// viability probe but registers under its synth slot (`[k]`), so the Array branch synthesizes
// `{ [k]: _Array$from }` instead of leaving `Array` raw (which dropped the polyfill -> ie:11 TypeError)
const k = "from";
const cond = Math.random() > 0.5;
const { [k]: g } = cond ? Array : Map;
g([1]);
