// async IIFE returns Promise<T>, not T - inline-call resolution must bail
const out = (async () => Map)().at(0);
