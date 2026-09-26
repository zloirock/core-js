// 3 forms of type-only ESM imports: type-only import filter must filter all from shadow
// detection. references to Map / Set / Promise resolve to globals despite same-named
// type imports
import type Map from 'some-module';
import type { Set } from 'some-module';
import { type Promise } from 'some-module';

const m = new Map();
const s = new Set();
const p = new Promise(() => {});
m.has(1);
s.add(2);
p.then(() => {});
