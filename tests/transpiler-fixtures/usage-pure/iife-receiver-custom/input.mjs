// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
const user = { from: value => value[0] + 1 };
return (function ({ from } = Array) { return [from([8]), arguments[0] === user]; })(user);
})();
