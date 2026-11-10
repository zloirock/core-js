// Sibling lowerings consume the live tree and its scope in the same Babel pass.
// Printing and reparsing between plugins would conceal stale or missing bindings.
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import plugin from '../../packages/core-js-babel-plugin/index.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync, parseAsync, transformFromAstAsync, types: t } = requireBabel('@babel/core');
const { check, checkDeep, checkTruthy, finish } = createChecker('scope-lifecycle');
const base = { filename: 'input.mjs', configFile: false, babelrc: false };
const options = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
function lowering(name) {
  return requireBabel.resolve(`@babel/plugin-transform-${ name }`);
}

function execute(code, values = {}) {
  const context = { exports: {}, result: null, ...values, require(source) {
    return source === './ref' ? { box: 'the-box' } : requireBabel(source);
  } };
  runInNewContext(code, context);
  return context;
}

for (const method of ['usage-global', 'usage-pure']) for (const [name, source, values, expected] of [
  ['nested-head', 'for (const [{ name, age }] of rows) { use(name.at(0), age.toFixed(2)); }', { rows: [[{ name: 'hi', age: 3 }]] }, [['h', '3.00']]],
  ['assignment-head', 'let x; for ({ at: x } of rows) { use(x.at(0)); }', { rows: [{ at: ['ok'] }] }, [['ok']]],
  ['shadowed-head', 'let target; for ({ entries: target } of list) { let target = 4; use(target); }', { list: [{ entries: 1 }] }, [[4]]],
]) {
  const { code } = await transformAsync(source, {
    ...base, plugins: [[plugin, { ...options, method }], lowering('destructuring'), lowering('for-of'), lowering('modules-commonjs')],
  });
  const seen = [];
  execute(code, { ...values, use(...args) { seen.push(args); } });
  checkDeep(`${ method }/${ name }`, seen, expected);
}

// Losing a moved declaration makes block-scoping rename the inner shadow onto it,
// or makes a loop's closures share the last iteration's assignment.
for (const reverse of [false, true]) for (const [name, source, expected] of [
  ['static-shadow', `const out = [];
function mkArray() { out.push('mk'); return Array; }
const { from, of } = mkArray();
{ let from = 1; out.push(from); }
out.push(typeof from, typeof of); result = out;`, ['mk', 1, 'function', 'function']],
  ['loop-capture', `const fns = []; function getArr() { return Array; }
for (let i = 0; i < 2; i++) { let { from: f, name } = getArr(); f = i; fns.push(() => [f, name]); }
result = fns.map(f => f());`, [[0, 'Array'], [1, 'Array']]],
  ['guard-capture', `const fns = []; let M = Map; if (flag) M = { groupBy() {} };
for (let i = 0; i < 2; i++) { let { groupBy: method, at, name } = M; method = i; fns.push(() => method); }
result = fns.map(f => f());`, [0, 1]],
]) {
  const plugins = [[plugin, options], lowering('block-scoping')];
  if (reverse) plugins.reverse();
  plugins.push(lowering('modules-commonjs'));
  const { code } = await transformAsync(source, { ...base, plugins });
  for (const flag of [false, true]) checkDeep(`${ name }/reverse=${ reverse }/flag=${ flag }`, execute(code, { flag }).result, expected);
}

const memoSource = `import { box } from './ref';
export function f(getArr) {
  const [{ at: first }] = [getArr().flat()];
  const [{ findLast: last = null }] = [getArr().flatMap(x => x)];
  return [first, last, box];
}`;
for (const passPerPreset of [false, true]) {
  const plugins = [lowering('modules-commonjs'), lowering('destructuring'), lowering('block-scoping')];
  const configuration = passPerPreset
    ? { passPerPreset, presets: [() => ({ plugins }), () => ({ plugins: [[plugin, options]] })] }
    : { plugins: [[plugin, options], ...plugins] };
  const { code } = await transformAsync(memoSource, { ...base, ...configuration });
  const context = execute(code);
  check(`memo namespace/passPerPreset=${ passPerPreset }`, context.exports.f(() => [[1]])[2], 'the-box');
}

// The canonical fast path may omit a full crawl, but it must publish every final
// declaration. The sibling also checks that UID allocation sees nested renamed refs.
for (const [name, source] of [
  ['guarded-split', 'let M = pickConstructor(); if (!M) M = Array; const { from: from3, of: of3, isArray } = M; export { from3, of3, isArray };'],
  ['canonical-ref', 'export function f(get) { return get().at(0) + get().at(1); }'],
  ['renamed-refs', memoSource],
]) {
  const missing = [];
  let collisions = 0;
  await transformAsync(source, { ...base, plugins: [[plugin, options], () => ({ post(file) {
    const names = new Set();
    file.path.traverse({ VariableDeclarator(p) {
      for (const [local, identifier] of Object.entries(p.get('id').getBindingIdentifiers())) {
        names.add(local);
        const binding = p.scope.getBinding(local);
        if (!binding || binding.identifier !== identifier) missing.push(local);
      }
    } });
    for (const prefix of ['ref', 'ref2', 'ref3', 'ref4']) if (names.has(file.scope.generateUid(prefix))) collisions++;
  } })] });
  checkDeep(`${ name }/registered declarations`, missing, []);
  check(`${ name }/UID collisions`, collisions, 0);
}

for (const name of [
  'array-wrap-inline-spread-hosts', 'residual-excluded-receiver-claims',
  'audit-wrapper-element-memo', 'effectful-iterator-key-past-a-realm-probe-runs-inside-the-guard',
]) {
  const source = await readFile(new URL(`../transpiler-fixtures/usage-pure/${ name }/input.mjs`, import.meta.url), 'utf8');
  const { code: once } = await transformAsync(source, { ...base, plugins: [[plugin, options]] });
  let exits = 0;
  const { code: twice } = await transformAsync(source, { ...base, plugins: [[plugin, options], () => ({ visitor: { Program: { exit(p) {
    if (exits++ === 0) p.requeue();
  } } } })] });
  check(`${ name }/requeued exit`, twice, once);
  checkTruthy(`${ name }/exit control`, exits > 1);
  async function reuse(secondOptions) {
    const ast = await parseAsync(source, base);
    const first = await transformFromAstAsync(ast, source, { ...base, cloneInputAst: false, plugins: [[plugin, options]] });
    return (await transformFromAstAsync(ast, first.code, { ...base, cloneInputAst: false, plugins: [[plugin, secondOptions]] })).code;
  }
  check(`${ name }/reused AST`, await reuse(options), await reuse({ ...options }));
}

// A later exit may really introduce code; the repeated-exit guard must still serve it.
{
  let exits = 0;
  const { code } = await transformAsync('const keep = 1;', { ...base, plugins: [[plugin, options], () => ({ visitor: { Program: { exit(p) {
    if (exits++ !== 0) return;
    const callee = t.memberExpression(t.identifier('Promise'), t.identifier('withResolvers'));
    const assignment = t.assignmentExpression('=', t.identifier('result'), t.callExpression(callee, []));
    p.pushContainer('body', t.expressionStatement(assignment));
    p.requeue();
  } } } })] });
  checkTruthy('second-exit helper is served', code.includes('@core-js/pure/actual/promise/with-resolvers'));
  check('second-exit helper runtime', typeof execute((await transformAsync(code, { ...base, plugins: [lowering('modules-commonjs')] })).code).result.resolve, 'function');
}

// scope.push must append to the live body after our ref merge or dead-ref pruning.
for (const source of ['result = receiver().at(0);', 'result = globalThis.window?.Array.from(xs);']) {
  const { code } = await transformAsync(source, { ...base, plugins: [() => ({ pre(file) {
    file.scope.push({ id: t.identifier('foreign') });
  } }), [plugin, options], () => ({ visitor: { Program: { exit(p) {
    const id = p.scope.generateUidIdentifier('late');
    p.scope.push({ id, init: t.numericLiteral(23) });
    p.pushContainer('body', t.expressionStatement(t.assignmentExpression('=', t.identifier('result'), id)));
  } } } }), lowering('modules-commonjs')] });
  check(`late scope.push/${ source }`, execute(code, { xs: [1], receiver: () => [1] }).result, 23);
}

finish();
