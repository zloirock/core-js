// TSQualifiedName — `Promise.Resolver` as a type-only reference;
// TSImportType — `import('foo').Bar` in type-only position. Both must not polyfill Promise.
type X = Promise.Resolver;
type Y = import('foo').Bar;
type Z = typeof Map;
// Runtime usage: only Promise.resolve runtime call triggers polyfill
Promise.resolve(1);
