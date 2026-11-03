// Class, block-scope and pattern lowering can empty a recorded assignment path before
// the program-exit usage sweep. The live replacement writes must remain visible.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync, types: t } = requireBabel('@babel/core');
const traverseModule = requireBabel('@babel/traverse');
const traverse = traverseModule.default ?? traverseModule;
const { check, checkTruthy, finish } = createChecker('removed-write-co-transform');
const plugin = new URL('../../packages/core-js-babel-plugin/index.js', import.meta.url).pathname;
const lowerings = ['classes', 'destructuring', 'block-scoping']
  .map(name => requireBabel.resolve(`@babel/plugin-transform-${ name }`));

for (const method of ['usage-global', 'usage-pure']) {
  const source = await readFile(new URL(`../transpiler-fixtures/${ method }/loop-destructure-sibling-lowering/input.mjs`, import.meta.url), 'utf8');
  const { code, ast } = await transformAsync(source, {
    filename: 'input.mjs',
    babelrc: false,
    configFile: false,
    ast: true,
    plugins: [[plugin, { method, version: '4.0', targets: { ie: 11 } }], ...lowerings],
  });
  let declarations = 0;
  traverse(ast, { VariableDeclarator(path) {
    if (path.node.id.type === 'Identifier' && path.node.id.name === 'val') declarations++;
  } });
  check(`${ method } class lowering ran`, code.includes('class DocTypeReader'), false);
  check(`${ method } loop-local binding survived`, declarations, 1);
  checkTruthy(`${ method } lowered iteration is served`, code.includes(method === 'usage-pure'
    ? '@core-js/pure/actual/array/from' : 'core-js/modules/es.array.from'));
}

// A declaration move must retain the original Binding. Printing and reparsing before
// block-scoping would rebuild referencePaths and conceal a lost loop capture.
for (const [name, source, names] of [
  ['residual', 'function read(row) { const { name, find } = row; return () => [name, find()]; }', ['name', 'find']],
  ['last', 'function read(row) { const { at, flat } = row; return () => [at(), flat()]; }', ['at', 'flat']],
  ['rest', 'function read(row) { const { at: Map, ...rest } = row; return () => [Map(), rest]; }', ['Map', 'rest']],
  ['redeclared', 'function read(row) { var { at, flat } = row; var at = () => 3; return () => [at(), flat()]; }', ['at', 'flat']],
  ['assignment', 'let at, flat; ({ at, flat } = row); use(() => [at, flat]);', ['at', 'flat']],
  ['keyed-pattern', 'const { [Symbol.iterator]: { name } } = row; use(() => name);', ['name']],
  ['writes', 'function read(row) { let { at, flat } = row; at = () => 3; return () => [at(), flat()]; }', ['at', 'flat']],
  ['for-init', 'function read(row) { for (let { at, flat } = row;;) { return () => [at(), flat()]; } }', ['at', 'flat']],
  ['before', 'const { config: { items: { at, includes } = [], name } } = APP_STATE; use(() => [at, includes, name]);', ['at', 'includes', 'name']],
  ['after', 'const { config: { name, items: { at, includes } = [] } } = APP_STATE; use(() => [at, includes, name]);', ['at', 'includes', 'name']],
  ['whole', 'const { config: { items: { at, includes } = [] } } = APP_STATE; use(() => [at, includes]);', ['at', 'includes']],
  ['var-loop', 'function read(rows) { for (const row of rows) { var { find, at } = row; } return () => [find, at]; }', ['find', 'at']],
  ['bodyless-twin', 'if (c) var { y: { last: { s }, includes } = dflt } = box; use(() => [s, includes]);', ['s', 'includes']],
  ['var-owner', 'function read(row) { if (row) { var { at, flat } = row; } return () => [at(), flat()]; }', ['at', 'flat']],
  ['parameter', 'function read({ at, name }) { return () => [at(), name]; } read([1]);', ['at', 'name']],
  ['guarded-capture', 'const C = flag ? Array : other; const { x: { from } } = { x: C }; use(() => from);', ['from']],
  ['static', 'function read() { const { from, of } = Array; return () => [from, of]; }', ['from', 'of']],
  ['static-rest', 'function read() { const { from, ...rest } = Array; return () => [from, rest]; }', ['from', 'rest']],
  ['static-param', 'function read({ from }) { return () => from; } read(Array);', ['from']],
  ['array', 'const [{ at, name }] = [row]; use(() => [at, name]);', ['at', 'name']],
]) {
  const original = new Map();
  await transformAsync(source, {
    filename: 'input.mjs', configFile: false, babelrc: false,
    plugins: [() => ({ pre(file) {
      file.path.traverse({ BindingIdentifier(path) {
        const { name: local } = path.node;
        if (!names.includes(local) || original.has(local)) return;
        const binding = path.scope.getBinding(local);
        original.set(local, {
          binding, references: binding.referencePaths,
          writes: binding.constantViolations.filter(write => write.node !== binding.path.node), constant: binding.constant,
        });
      } });
    } }), [plugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }], () => ({ pre() {
      for (const [local, { binding, references, writes, constant }] of original) {
        const current = references[0].scope.getBinding(local);
        check(`${ name }/${ local }/record`, current === binding, true);
        check(`${ name }/${ local }/references`, current?.referencePaths === references, true);
        checkTruthy(`${ name }/${ local }/live identifier`, !!current && t.getBindingIdentifiers(current.path.node)[local] === current.identifier);
        checkTruthy(`${ name }/${ local }/writes`, !!current && writes.every(write => current.constantViolations.includes(write)));
        check(`${ name }/${ local }/constant`, current?.constant, constant);
        checkTruthy(`${ name }/${ local }/source position`, Number.isInteger(current?.path.node.start));
      }
      check(`${ name }/observed bindings`, original.size, names.length);
    } })],
  });
}

// A guard copies its kept store in the same evaluation slot. Later reads still trust
// that source write, but an intervening user assignment must invalidate that proof.
for (const createParenthesizedExpressions of [false, true]) for (const prefix of ['', 'before(), ']) {
  for (const sealed of [false, true]) for (const overwritten of [false, true]) {
    const receiver = `(${ prefix }(held = globalThis.window)?.self)`;
    const read = sealed ? `${ receiver }.Array.from([1])` : `(${ prefix }(held = globalThis.window)?.self.Array.from([1]))`;
    const source = `let held; const first = ${ read };
${ overwritten ? 'held = other;' : '' }
const second = held?.Map;`;
    const { ast } = await transformAsync(source, {
      filename: 'input.mjs', configFile: false, babelrc: false, ast: true,
      parserOpts: { createParenthesizedExpressions },
      plugins: [[plugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
    });
    let second;
    traverse(ast, { VariableDeclarator(path) { if (path.node.id.name === 'second') second = path.node.init; } });
    let native = 0;
    t.traverseFast(second, node => {
      if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') && node.property.name === 'Map') native++;
    });
    check(`guarded store/parens=${ createParenthesizedExpressions }/prefix=${ !!prefix }/sealed=${ sealed }/overwritten=${ overwritten }`,
      native, overwritten ? 1 : 0);
  }
}

finish();
