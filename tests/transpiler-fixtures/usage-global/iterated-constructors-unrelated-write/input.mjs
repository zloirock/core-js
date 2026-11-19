// Writing another key does not suppress a static polyfill.
for (const c of [Array, Map]) c.extra = 1;
export const result = Array.from([1]);
