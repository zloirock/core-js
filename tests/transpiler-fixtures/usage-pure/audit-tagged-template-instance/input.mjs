// Tagged template `arr.concat\`x\`` is a call site without an `arguments` array.
// Call-return resolution must handle the tagged-template shape and still narrow the result to Array.
const arr: string[] = ['a', 'b'];
const r = arr.concat`x`;
r.at(0);
