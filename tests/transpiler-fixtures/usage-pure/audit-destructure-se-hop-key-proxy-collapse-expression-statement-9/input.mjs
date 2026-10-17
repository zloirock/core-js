let q = 0;
const { getOwnPropertyNames } = (globalThis.self[(q++, 'window')].Object) || Object;
getOwnPropertyNames({ z: 1 });
