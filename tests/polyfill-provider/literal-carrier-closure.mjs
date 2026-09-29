// Local carriers and named-key destructures preserve the held literal's field types.
// Escaping carriers, path writes, copied object references and own-this methods widen them.
import { createBindingAnalysis } from '../../packages/core-js-polyfill-provider/resolve-node-type/binding-analysis.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, checkTruthy, finish, runBoth } = createChecker('literal-carrier-closure');

function checkType(label, type, expected) {
  checkDeep(label, type && { primitive: type.primitive, ctor: type.primitive ? type.type : type.constructor }, expected);
}

const carriers = [
  ['control', '', true],
  ['object slot', 'const wrap = { inner: box };', true],
  ['array slot', 'const wrap = [box];', true],
  ['nested literal', 'const wrap = { outer: { inner: box } };', true],
  ['read-only slot', 'const wrap = { inner: box }; wrap.inner.data.length;', true],
  ['carrier alias', 'const wrap = { inner: box }; const alias = wrap; alias.inner.data.length;', true],
  ['second carrier', 'const wrap = { inner: box }; const outer = { wrap }; outer.wrap.inner.data.length;', true],
  ['array dereference', 'const wrap = [box]; wrap[0].data.length;', true],
  ['slot destructure', 'const wrap = { inner: box }; const { data } = wrap.inner;', true],
  ['export', 'export const wrap = { inner: box };', false],
  ['call', 'const wrap = { inner: box }; sink(wrap);', false],
  ['slot call', 'const wrap = { inner: box }; sink(wrap.inner);', false],
  ['path write', 'const wrap = { inner: box }; wrap.inner.data = null;', false],
  ['array path write', 'const wrap = [box]; wrap[0].data = null;', false],
  ['alias path write', 'const wrap = { inner: box }; const alias = wrap; alias.inner.data = null;', false],
  ['second carrier write', 'const wrap = { inner: box }; const outer = { wrap }; outer.wrap.inner.data = null;', false],
  ['computed slot', 'const wrap = { [key]: box };', false],
  ['spread', 'const wrap = { inner: box }; const copy = { ...wrap };', false],
  ['rest copy', 'const wrap = { inner: box }; const { ...copy } = wrap.inner;', true],
  ['rest copy write', 'const wrap = { inner: box }; const { ...copy } = wrap.inner; copy.data = null;', true],
  ['carrier rest', 'const wrap = { inner: box }; const { ...copy } = wrap; copy.inner.data = null;', false],
  ['inline array spread', 'const [alias] = [...[box]]; alias.data = null;', false],
  ['nested array spread', 'const [{ inner: alias }] = [...[{ inner: box }]]; alias.data = null;', false],
  ['assign copy', 'const { box: alias } = Object.assign({}, { box }); alias.data = null;', false],
  ['values copy', 'const [alias] = Object.values({ box }); alias.data = null;', false],
  ['inline map', 'const [alias] = [box].map(value => value); alias.data = null;', false],
  ['named map', 'const wrap = [box]; const [alias] = wrap.map(value => value); alias.data = null;', false],
  ['object pattern alias', 'const { box: alias } = { box }; alias.data = REPLACEMENT;', false],
  ['array pattern alias', 'const [alias] = [box]; alias.data = REPLACEMENT;', false],
  ['pattern assignment alias', 'let alias; ({ box: alias } = { box }); alias.data = REPLACEMENT;', false],
  ['inline member alias', 'const alias = ({ box }).box; alias.data = REPLACEMENT;', false],
  ['for-of alias', 'for (const alias of [box]) alias.data = REPLACEMENT;', false],
  ['cycle', 'const wrap = { inner: box }; box.wrap = wrap;', false],
  ['recursive carrier', 'const wrap = { inner: box }; const list = [wrap]; wrap.list = list;', false],
];
const destructures = [
  ['declaration', 'const { data } = wrap.box;', true],
  ['nested declaration', 'const { data: { at } } = wrap.box;', true],
  ['assignment', 'let data; ({ data } = wrap.box);', true],
  ['nested assignment', 'let at; ({ data: { at } } = wrap.box);', true],
  ['sibling key', 'const { data, other } = wrap.box;', true],
  ['default', 'const { data = [] } = wrap.box;', true],
  ['wrapped receiver', 'const { data } = (wrap.box);', true],
  ['member prefix', 'const deeper = { wrap }; const { box: { data } } = deeper.wrap;', true],
  ['root pattern', 'const { box: { data: { at } } } = wrap;', true],
  ['rest', 'const { ...copy } = wrap.box;', true],
  ['named key and rest', 'const { other, ...copy } = wrap.box;', true],
  ['rest assignment', 'let copy; ({ ...copy } = wrap.box);', true],
  ['wrapped rest receiver', 'const { ...copy } = (wrap.box);', true],
  ['root rest pattern', 'const { box: { ...copy } } = wrap;', true],
  ['member prefix rest', 'const deeper = { wrap }; const { box: { ...copy } } = deeper.wrap;', true],
  ['rest copy write', 'const { ...copy } = wrap.box; copy.data = null;', true],
  ['rest copy escape', 'const { ...copy } = wrap.box; sink(copy);', true],
  ['rest member target', 'const target = {}; ({ ...target.copy } = wrap.box);', true],
  ['carrier rest', 'const { ...copy } = wrap; copy.box.data = null;', false],
  ['carrier rest assignment', 'let copy; ({ ...copy } = wrap); copy.box.data = null;', false],
  ['prefix carrier rest', 'const deeper = { wrap }; const { ...copy } = deeper.wrap; copy.box.data = null;', false],
  ['rest plus unknown key', 'const { [key]: value, ...copy } = wrap.box;', false],
  ['carrier field write', 'wrap.data = null;', true],
  ['write', 'wrap.box.data = null;', false],
  ['destructure write', '({ value: wrap.box.data } = source);', false],
  ['unknown key', 'const { [key]: value } = wrap.box;', false],
];

for (const [family, value, expected] of [['array', '[1, 2]', { primitive: false, ctor: 'Array' }],
  ['string', '"xy"', { primitive: true, ctor: 'string' }]]) {
  for (const [name, extra, narrow] of carriers) {
    const writes = extra.replaceAll('REPLACEMENT', family === 'array' ? '"xy"' : '[1, 2]');
    runBoth(`${ family } carrier ${ name }`, `const box = { data: ${ value } }; ${ writes } box.data.at(0);`,
      (adapter, prog, label) => {
        const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
        const type = adapter.makeResolver().resolveNodeType(member.get('object'));
        if (narrow) checkType(label, type, expected);
        else check(`${ label } widened`, type, null);
      });
  }
  for (const [name, extra, narrow] of destructures) {
    runBoth(`${ family } nested literal ${ name }`, `const wrap = { box: { data: ${ value } } }; ${ extra } wrap.box.data.at(0);`,
      (adapter, prog, label) => {
        const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
        const type = adapter.makeResolver().resolveNodeType(member.get('object'));
        if (narrow) checkType(label, type, expected);
        else check(`${ label } widened`, type, null);
      });
  }
}

for (const [name, extra, narrow] of [
  ['data destructure', 'const { data } = wrap.box;', true],
  ['method destructure', 'const { read } = wrap.box;', false],
  ['method through prefix', 'const deeper = { wrap }; const { box: { read } } = deeper.wrap;', false],
  ['method rest', 'const { ...copy } = wrap.box; copy.data = "xy"; copy.read();', false],
  ['method rest assignment', 'let copy; ({ ...copy } = wrap.box); copy.data = "xy"; copy.read();', false],
  ['method root rest', 'const { box: { ...copy } } = wrap; copy.read();', false],
  ['held method', 'const read = wrap.box.read;', false],
  ['prototype carrier', 'const child = { __proto__: box }; const read = child.read;', false],
]) {
  runBoth(`own-this ${ name }`, `const box = { data: [1, 2], read() { return this.data.at(0); } };
    const wrap = { box }; ${ extra }`, (adapter, prog, label) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    const type = adapter.makeResolver().resolveNodeType(member.get('object'));
    if (narrow) checkType(label, type, { primitive: false, ctor: 'Array' });
    else check(`${ label } widened`, type, null);
  });
}

for (const [name, source] of [
  ['object pattern', 'const { item: box } = { item: { data: [1, 2] } };'],
  ['array pattern', 'const [box] = [{ data: [1, 2] }];'],
  ['pattern assignment', 'let box; ({ item: box } = { item: { data: [1, 2] } });'],
]) {
  runBoth(`anonymous alias write ${ name }`, `${ source } box.data = "xy"; box.data.at(0);`, (adapter, prog, label) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    check(`${ label } widened`, adapter.makeResolver().resolveNodeType(member.get('object')), null);
  });
}

for (const [name, read, narrow] of [
  ['data', 'const [{ data }] = list;', true],
  ['own rest', 'const [{ ...copy }] = list; copy.data = "xy";', true],
  ['carrier rest', 'const [...copy] = list; copy[0].data = "xy";', false],
]) runBoth(`named array pattern ${ name }`,
  `const box = { data: [1, 2] }; const list = [box]; ${ read } box.data.at(0);`, (adapter, prog, label) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    const type = adapter.makeResolver().resolveNodeType(member.get('object'));
    if (narrow) checkType(label, type, { primitive: false, ctor: 'Array' });
    else check(`${ label } widened`, type, null);
  });

// Retained paths keep the source call position while an emitter replaces the live callee.
// Replacing that node must not turn a carrier method invocation into a harmless member read.
runBoth('retained callee after dispatch', 'const carrier = []; carrier.map(value => value);', (adapter, prog, label) => {
  const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'map');
  const { memberUseIsDirectCall } = createBindingAnalysis({ KNOWN_STATIC_METHOD_RETURN_TYPES: {} });
  check(`${ label } original call`, memberUseIsDirectCall(member), true);
  member.parent.callee = { type: 'Identifier', name: 'dispatch' };
  check(`${ label } retained source call`, memberUseIsDirectCall(member), true);
});

// A scope tracker may expose a freshly generated binding before recording its references.
// A declaration without source positions must not prove the carried receiver closed.
runBoth('source-less binding cannot prove locality', 'const box = { data: [1, 2] }; box.data.at(0);', (adapter, prog, label) => {
  const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
  const binding = member.scope.getBinding('box');
  const sourceNode = binding.path.node;
  const syntheticPath = Object.assign(Object.create(binding.path), {
    node: { type: 'VariableDeclarator', id: sourceNode.id, init: sourceNode.init },
  });
  const synthetic = { ...binding, referencePaths: [], path: syntheticPath };
  const resolver = adapter.makeResolver({
    getScopeBinding(scope, name, path) {
      return name === 'box' ? synthetic : scope?.getBinding(name, path ?? undefined);
    },
  });
  check(`${ label } widened`, resolver.resolveNodeType(member.get('object')), null);
});

// Resetting per-file caches must also allow the same carrier proof to run again.
runBoth('carrier proof after reset', 'const box = { data: [1, 2] }; const wrap = { box }; box.data.at(0);', (adapter, prog, label) => {
  const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
  const resolver = adapter.makeResolver();
  for (let pass = 0; pass < 2; pass++) {
    checkType(`${ label } pass ${ pass }`, resolver.resolveNodeType(member.get('object')), { primitive: false, ctor: 'Array' });
    resolver.reset();
  }
});

// Bound both the number of graph paths and recursive depth. Each lookup is counted before
// returning the real binding, so a traversal regression fails before it can expand exponentially.
for (const shape of ['chain', 'diamond']) for (const size of [8, 16, 128]) {
  const source = `const box = { data: [1, 2] };${
    Array.from({ length: size }, (unused, index) => {
      const previous = index ? `w${ index - 1 }` : 'box';
      return `const w${ index } = { a: ${ previous }${ shape === 'diamond' ? `, b: ${ previous }` : '' } };`;
    }).join('\n') }box.data.at(0);`;
  runBoth(`${ shape } cost at ${ size } carriers`, source, (adapter, prog, label) => {
    let lookups = 0;
    const resolver = adapter.makeResolver({
      getScopeBinding(scope, name, path) {
        if (++lookups > 12 * size) throw new Error('carrier binding lookup budget exceeded');
        return scope?.getBinding(name, path ?? undefined);
      },
    });
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    const type = resolver.resolveNodeType(member.get('object'));
    if (shape === 'chain' && size < 64) checkType(label, type, { primitive: false, ctor: 'Array' });
    else check(`${ label } conservatively widened`, type, null);
    checkTruthy(`${ label } visited the carrier graph`, lookups >= Math.min(size, 64));
  });
}

finish();
