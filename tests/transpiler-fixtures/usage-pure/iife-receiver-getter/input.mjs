// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
const user = { get from() { effects.push("get"); return () => 11; } };
return (function ({ from } = Array) { return [from(), arguments[0] === user]; })(user);
})();
