// a computed key whose runtime value ALIASES a sibling shorthand (`const k = "from"; { from, [k]: x }`)
// must not let the computed property overwrite the polyfilled shorthand in the synth literal. resolving
// the computed key value polyfills BOTH slots (`{ from: _Array$from, [k]: _Array$from }`), so the
// duplicate runtime key (`from`) carries the polyfill on either binding instead of native `Array.from`
const k = "from";
const cond = Math.random() > 0.5;
const { from, [k]: x } = cond ? Array : Set;
[from, x];
