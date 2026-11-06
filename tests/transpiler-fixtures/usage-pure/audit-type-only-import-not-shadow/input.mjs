// 3 forms of type-only ESM imports: type-only import filter must filter all from shadow
// detection. references to Map / Set / Promise resolve to globals despite same-named
// type imports
import type Map from 'some-module';
import type { Set } from 'some-module';
import { type Promise } from 'some-module';

// TS7 leaves the unresolved default import opaque in value position.
const m = new Map();
// @ts-expect-error a type-only import read as a value is the shape under test
const s = new Set();
// @ts-expect-error a type-only import read as a value is the shape under test
const p = new Promise(() => {});
m.has(1);
s.add(2);
p.then(() => {});
