// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
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
