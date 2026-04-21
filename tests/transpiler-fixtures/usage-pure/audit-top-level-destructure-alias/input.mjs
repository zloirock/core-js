// top-level alias: `{ Array } = globalThis`. resolveProxyGlobalDestructureAlias sees a proxy
// receiver and maps Array binding -> 'Array' global, then .from call routes to Array.from polyfill
const { Array: MyArr } = globalThis;
MyArr.from([1, 2, 3]);
