import 'core-js/full';
import '@core-js/types';

declare const map: Map<string, number>;

const a: number = map.getOrInsert('x', 42);
const b: number = map.getOrInsertComputed('y', k => k.length);

// @ts-expect-error
map.getOrInsert(1, 2);
// @ts-expect-error
map.getOrInsert('x');
// @ts-expect-error
map.getOrInsertComputed('x', (k: number) => k + 1);

declare const wmap: WeakMap<{ id: number }, boolean>;

const wb: boolean = wmap.getOrInsert({ id: 1 }, true);
wmap.getOrInsertComputed({ id: 2 }, obj => obj.id === 2);
// @ts-expect-error
wmap.getOrInsert(123, true);
// @ts-expect-error
wmap.getOrInsert({ id: 1 });
// @ts-expect-error
wmap.getOrInsertComputed({ id: 1 }, (obj: string) => true);
