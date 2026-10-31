// A member target a TS assertion wraps whole spells the slot inside it: a static, an instance claim and a
// nested instance claim write the ponyfill into it in both emitters, the assertion kept around the write;
// beside a rest one level down the hop capture writes it ahead of the rest copy. A computed one beside a
// binding sibling keeps the native read, as its bare twin does.
const sink: any = {};
let v, rest;
({ from: (sink.f as any) } = Array);
({ of: sink.g! } = Array);
({ at: (sink.m as any) } = arr);
({ y: { flat: sink.n! } } = { y: arr });
({ entries: (sink[k()] as any), values: v } = Object);
({ Array: { fromAsync: (sink.r as any), ...rest } } = globalThis);
