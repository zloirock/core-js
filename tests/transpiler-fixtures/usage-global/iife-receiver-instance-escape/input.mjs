// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
const rows = [4, 15]; function observe(args) { return args[0] === rows; }
return (function ({ at } = []) { return [at.call(rows, -1), observe(arguments)]; })(rows);
})();
