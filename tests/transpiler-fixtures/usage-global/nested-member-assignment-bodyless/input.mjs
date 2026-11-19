// The sole dispatch owns the getter read inside its original control-flow position.
const wrap = { get box() { log("box"); return { data: [1, 2] }; } };
let at;
if (ready) ({ data: { at } } = wrap.box);
