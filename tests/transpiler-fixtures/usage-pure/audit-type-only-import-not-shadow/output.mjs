import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// 3 forms of type-only ESM imports: type-only import filter must filter all from shadow
// detection. references to Map / Set / Promise resolve to globals despite same-named
// type imports
import type Map from 'some-module';
import type { Set } from 'some-module';
import { type Promise } from 'some-module';

// @ts-expect-error a type-only import read as a value is the shape under test
const m = new _Map();
// @ts-expect-error a type-only import read as a value is the shape under test
const s = new _Set();
// @ts-expect-error a type-only import read as a value is the shape under test
const p = new _Promise(() => {});
m.has(1);
s.add(2);
p.then(() => {});