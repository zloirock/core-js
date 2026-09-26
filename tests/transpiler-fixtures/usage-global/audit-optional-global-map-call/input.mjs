// optional access on a global call `globalThis?.Map(...)`: through the optional, the
// call still resolves to the polyfilled `Map` constructor.
Map?.();
