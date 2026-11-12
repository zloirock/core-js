// A named default expression owns its name locally; printing must not hoist a declaration.
const hidden = 1;
export default (function hidden() { return [7].at(0); });
console.log(hidden);
