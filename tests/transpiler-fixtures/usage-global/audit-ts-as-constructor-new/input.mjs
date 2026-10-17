// `new (X as any)(...)` constructor call wrapped in TS `as any`: the cast is peeled
// so the construction is still recognised and polyfilled.
new (Map as any)();
new (Map as any as unknown)();
