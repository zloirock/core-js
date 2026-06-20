// the patched static is reached through a const-aliased container hop (`const k = "Ctor";
// Registry[k].from = ...` over `const Registry = { Ctor: Array }`): both hops resolve to
// `Array.from`, so the later call keeps the user patch
const Registry = { Ctor: Array };
const ctorKey = "Ctor";
Registry[ctorKey].from = function () { return []; };
Array.from([1, 2, 3]);
