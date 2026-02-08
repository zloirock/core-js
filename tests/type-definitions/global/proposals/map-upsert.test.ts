import 'core-js/es';
import mapGetOrInsert from 'core-js/es/map/get-or-insert';
import mapGetOrInsertComputed from 'core-js/es/map/get-or-insert-computed';
import wMapGetOrInsert from 'core-js/es/weak-map/get-or-insert';
import wMapGetOrInsertComputed from 'core-js/es/weak-map/get-or-insert-computed';
import { assertBool, assertNumber } from '../../helpers';

declare const map: Map<string, number>;

assertNumber(mapGetOrInsert(map, 'a', 10));
assertNumber(mapGetOrInsertComputed(map, 'b', k => k.length));

assertNumber(map.getOrInsert('x', 42));
assertNumber(map.getOrInsertComputed('y', k => k.length));

// @ts-expect-error
mapGetOrInsert(map, 1, 2);
// @ts-expect-error
mapGetOrInsertComputed(map, 'x', (k: number) => k + 1);

// @ts-expect-error
map.getOrInsert(1, 2);
// @ts-expect-error
map.getOrInsert('x');
// @ts-expect-error
map.getOrInsertComputed('x', (k: number) => k + 1);

declare const wmap: WeakMap<{ id: number }, boolean>;

assertBool(wMapGetOrInsert(wmap, { id: 1 }, true));
wMapGetOrInsertComputed(wmap, { id: 2 }, obj => obj.id === 2);

assertBool(wmap.getOrInsert({ id: 1 }, true));
wmap.getOrInsertComputed({ id: 2 }, obj => obj.id === 2);

// @ts-expect-error
wmap.getOrInsert(123, true);
// @ts-expect-error
wmap.getOrInsert({ id: 1 });
// @ts-expect-error
wmap.getOrInsertComputed({ id: 1 }, (obj: string) => true);
