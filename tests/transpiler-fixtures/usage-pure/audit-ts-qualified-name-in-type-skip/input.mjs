// TSQualifiedName - `Promise.Resolver` as a type-only reference;
// TSImportType - `import('foo').Bar` in type-only position. Both must not polyfill Promise.
// @ts-expect-error a type read as a value, which tsc refuses, is the shape under test
type X = Promise.Resolver;
type Y = import('foo').Bar;
type Z = typeof Map;
// Runtime usage: only Promise.resolve runtime call triggers polyfill
Promise.resolve(1);
