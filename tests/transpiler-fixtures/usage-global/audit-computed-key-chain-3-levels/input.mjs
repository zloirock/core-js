const a = "items";
const b = a;
const c = b;
const { [c]: val } = { items: ["hello"] };
val.at(-1);
val.includes("x");
