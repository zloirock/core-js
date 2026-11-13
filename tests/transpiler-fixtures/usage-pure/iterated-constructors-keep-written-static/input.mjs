// Every loop alternative receives the patch, including a lowercase loop head.
for (const c of [Array, Map]) c.from = () => "patched";
export const result = Array.from([1]);
