type UnwrapArray<T> = T extends (infer U)[] ? U : T;
const x: UnwrapArray<string[]> = "" as any;
x.at(-1);
