// probe corpus rows whose two legs print DIFFERENT but equivalent trees - the classes the unplugin
// package's AGENTS.md accepts, held here as one sidecar so every other corpus fixture compares clean:
// - ref-hoist placement: a re-referenceable literal receiver memoized by one leg and read inline by
//   the other (`[0, [1, 2]]`, `[...[0, [1, 2]]]`, `_globalThis.Array.prototype` under an effectful
//   key, a primitive `'str'` slot)
// - a husk beside a SIBLING declarator: babel keeps `[{}] = [r, eff()]` in place, unplugin lifts the
//   effect as a statement (the sibling-host residual canon)
// - placement of PURE extractions and memos around each other (a static beside an instance memo,
//   the relocated head's per-prop order, an IIFE argument hoisted as a statement or spelled as a
//   sequence, a hop's rescued call as a sequence or a statement)
// - a sentinel residual one leg keeps and the other drops where nothing binds (`{ w: [, { keys:
//   _unused }] }` over a pure init, `Map: _unused` beside a binding sibling under an outer rest)
// - a leaf and a STATIC sibling of the same level of a proxy-global host (`{ Array: { of: { name,
//   foo }, from: F } } = globalThis`, `{ Array: { of: { name }, from: F } }`): the two legs order the
//   sibling's extraction and the leaf's pair differently - pure reads either way
// - the hop residual a proxy-global host keeps beside an extracted leaf (`{ Array: { of: { name },
//   junk } } = globalThis`): babel collapses it onto the hop (`{ junk } = _globalThis.Array`), unplugin
//   keeps the hop in the pattern (`{ Array: { junk } } = _globalThis`) - the residual class the
//   sibling-static form (`{ Array: { from, isArray } }`) already prints
// - a PATTERN default over a static beside a sibling (`{ junk, of: { name, foo } = {} } = Array`):
//   babel's per-prop extraction of the static stands ahead of the host, unplugin's twin behind it
// - an `&&` hop value whose left is a call typed to return a constructor (`{ w: eff() && Object }`
//   beside a sibling): unplugin extracts off the typed left, babel keeps the native read (the falsy
//   left's own short-circuit)
let pick = 1;
const c = 1;
const userObj = {};
const arr = [1, 2];
const nb = { y: arr };
const rest = [];
const more = {};
const wrapped = [Object];
const log = [];
const obj = {};
const rows = [];
const k = 'k';
let kw;
const nul = null;
function eff() { return Object; }
function eff2() {}
function mark(t, v) { log.push(t); return v; }

{
for (const [{ values }, { at }] of [[Object, [1]]]) [values, at];
}
{
for (const { w: { keys } } of [{ w() { return Object; } }, { w() { return Object; } }]) keys;
}
{
for (let [{ w: { values }, y: { at } }] = [r, eff()]; ;) { [values, at]; break; }
}
{
const [, { at }] = [0, [1, 2]];
}
{
const [{ [(eff('k'), 'w')]: { at: a } }] = [{ w: [1] }];
}
{
const [{ at }] = [[1, 2], ...rest];
}
{
let zLead = 1, [{ w: { values }, y: { at } }] = [r]; [zLead, values, at];
}
{
const [{ w: { values }, y: { at } }] = [r, eff('n')], zTail = 1; [values, at, zTail];
}
{
const [{ w: { values }, y: { at } }] = [r, eff('n')], zTail = eff('t'); [values, at, zTail];
}
{
const zLead = eff('lead'), [{ w: { values }, y: { at } }] = [r, eff('n')]; [zLead, values, at];
}
{
const { Array: { prototype: { [(eff('k2'), 'at')]: a } } } = globalThis;
}
{
const { Array: { prototype: { [(eff('k2'), 'at')]: a } } } = globalThis; log.push(a.call([3], 0));
}
{
const { Array: { prototype: { [(eff('k2'), 'at')]: a } }, ...r } = globalThis;
}
{
const { [(eff(), 'w')]: { at: a } } = { w: 'x' };
}
{
const { [(eff(), 'w')]: { includes: i3 } } = { w: 'str' };
}
{
const { w: [, { keys }] } = { w: [0, Object] };
}
{
const { w: { Array: { from: F = fb } }, z } = { w: globalThis, z: 1 }; F(z);
}
{
const { w: { Map: m, keep }, ...rest } = { w: globalThis, z: 1 }; use(m, keep, rest);
}
{
const { w: { at: m }, z } = { w: eff(), z: 1 }; const { w: { keys: k }, q } = { w: eff(), q: 1 }; use(m, z, k, q);
}
{
const { w: { at: m, keys: k }, z } = { w: eff(), z: 1 }; use(m, k, z);
}
{
const { w: { includes: i4 }, ...r } = { w: 'str' };
}
{
const { w: { values }, y: { at } } = { w: Object, y: [1] }; [values, at];
}
{
const { from: f } = ((x) => (log.push('x'), x))(Array);
}
{
const [, { at }] = [...[0, [1, 2]]];
}
{
const [, { at }] = [...[0], [1, 2]];
}
{
const { w: { keys: andHop }, q: andQ } = { w: eff() && Object, q: 1 };
[andHop, andQ];
}
{
const { Array: { of: { name: splitBesideStatic, foo: splitFoo }, from: splitFrom } } = globalThis;
[splitBesideStatic, splitFoo, splitFrom];
}
{
const { junk: defaultJunk, of: { name: defaultName, foo: defaultFoo } = {} } = Array;
[defaultJunk, defaultName, defaultFoo];
}
{
const { Array: { of: { name: soleOrder }, from: soleOrderFrom } } = globalThis;
[soleOrder, soleOrderFrom];
}
{
const { Array: { of: { name: soleResidual }, junk: soleResidualJunk } } = globalThis;
[soleResidual, soleResidualJunk];
}
{
const { Array: { prototype: { at: soleInstanceResidual }, junk: soleInstanceJunk } } = globalThis;
[soleInstanceResidual, soleInstanceJunk];
}
