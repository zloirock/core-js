import "core-js/modules/es.string.at";
let name;
({ a: { name } } = { a: { name: "alice" } });
name.at(-1);