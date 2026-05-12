// Array-destructure reassign with annotated RHS must narrow the element type the same
// way ObjectPattern reassign does. `resolveBindingType` used to route ArrayPattern only
// through the runtime-literal walker; without a literal RHS the annotation fallback never
// fired and downstream emitted both array and string variants for `.at`.
declare const data: string[];
let x;
[x] = data;
x.at(0);
