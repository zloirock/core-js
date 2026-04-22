const { Object: { freeze, keys } } = globalThis;
keys(freeze({ a: 1 }));
