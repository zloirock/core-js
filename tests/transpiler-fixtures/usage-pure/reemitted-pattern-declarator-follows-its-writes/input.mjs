// a pattern the render re-emits as plain declarators leaves babel's scope without those bindings, and
// what types each later read is the write after it: the type layer rebuilds the binding from the AST,
// so the read narrows to the written family, as the estree tracker narrows it
let [{ w: { values } }] = r;
values = [1, 2];
export const a = values.at(0);
let [{ v: { keys } }] = s;
keys = 'text';
export const b = keys.includes('x');
