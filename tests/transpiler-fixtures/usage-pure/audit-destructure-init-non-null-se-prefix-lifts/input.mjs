// A TypeScript non-null wrapper preserves the sequence effect before its static binding.
declare function auditCall(): void;
const { Promise: { resolve } } = (auditCall(), globalThis)!;
resolve(1);
