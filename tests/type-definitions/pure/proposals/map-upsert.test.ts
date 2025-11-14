import mapGetOrInsert from '@core-js/pure/full/map/get-or-insert';
import mapGetOrInsertComputed from '@core-js/pure/full/map/get-or-insert-computed';
import weakMapGetOrInsert from '@core-js/pure/full/weak-map/get-or-insert';
import weakMapGetOrInsertComputed from '@core-js/pure/full/weak-map/get-or-insert-computed';

declare const map: Map<string, number>;

const a: number = mapGetOrInsert(map, 'x', 42);
const b: number = mapGetOrInsertComputed(map, 'y', k => k.length);

// @ts-expect-error
mapGetOrInsert(map, 'x');

declare const wmap: WeakMap<{ id: number }, boolean>;

const wb: boolean = weakMapGetOrInsert(wmap, { id: 1 }, true);
weakMapGetOrInsertComputed(wmap, { id: 2 }, obj => obj.id === 2);

// @ts-expect-error
weakMapGetOrInsert(wmap, { id: 1 });
