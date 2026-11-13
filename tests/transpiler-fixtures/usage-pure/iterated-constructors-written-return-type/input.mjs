// A patched static may return another family; its result needs the matching instance method.
for (const c of [Array, Map]) c.from = () => "ab";
export const result = Array.from([]).at(-1);
