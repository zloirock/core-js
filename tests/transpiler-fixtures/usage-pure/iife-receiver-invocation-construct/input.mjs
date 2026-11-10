// A resolved invocation supplies the receiver; its effects and unresolved reads run once.
export const effects = [];
export const r = (() => {
function make() { effects.push("make"); return Array; }
return (({ from, length }) => [from([6])[0], length])(new make());
})();
