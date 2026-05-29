// A declared data property read must fold a later reassignment, not return the init type.
// The reassignment to an incompatible type forces the general variant.
const obj = { data: [1, 2, 3] };
obj.data = "shadowed";
obj.data.at(-1);
