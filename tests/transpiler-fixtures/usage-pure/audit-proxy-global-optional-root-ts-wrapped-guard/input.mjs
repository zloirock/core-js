// same proxy-global optional-root guard, but the root is wrapped in a TS cast (`(globalThis as any)`):
// the leaf still resolves to its pure import inside the rebuilt guard text, the TS wrapper is dropped
(globalThis as any).list?.flat().includes(1);
