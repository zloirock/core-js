const realm = globalThis;
let held: typeof globalThis;
const log: string[] = [];
const value = ((log.push('root'), held = realm) as typeof globalThis)?.Object[(log.push('key'), 'values')]({ a: 5 }).at(0);
const claimed = (globalThis.window as any)?.Map.prototype.has.call(new Map([[1, 3]]), 1);
