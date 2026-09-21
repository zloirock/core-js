// A TypeScript satisfies wrapper preserves the sequence effect before its static binding.
declare function recordCall(): void;
const { Object: { entries } } = (recordCall(), globalThis) satisfies any;
entries({ a: 1 });
