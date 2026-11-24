// Sibling plugins can replace positioned nodes or change them in place after our first visit.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('sibling-claims');
const config = { configFile: false, babelrc: false, filename: 'widget.mjs' };
const options = { targets: { ie: 11 }, version: '4.0' };
const tmp = path.resolve(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(tmp);
const dir = await fs.mkdtemp(path.join(tmp, 'sibling-claims-'));

function editCall(kind, form, phase) {
  return ({ types: t }) => {
    function edit(at) {
      const original = at.node.callee;
      if (original.name !== 'marker' && original.property?.name !== 'marker') return;
      if (kind === 'static') {
        if (form === 'in-place') {
          original.object.name = 'Object';
          original.property.name = 'fromEntries';
        } else {
          const member = t.memberExpression(t.identifier('Object'), t.identifier('fromEntries'));
          if (form === 'inherited') t.inherits(member, original);
          at.get('callee').replaceWith(member);
        }
        return;
      }
      const value = kind === 'async' ? t.arrowFunctionExpression([], t.numericLiteral(7), true)
        : t.importExpression ? t.importExpression(t.stringLiteral('./widget.mjs')) : t.callExpression(t.import(), [t.stringLiteral('./widget.mjs')]);
      if (form === 'insert') {
        const declaration = t.variableDeclaration('const', [t.variableDeclarator(t.identifier('made'), value)]);
        at.getStatementParent().insertBefore(t.inherits(declaration, at.node));
        at.replaceWith(t.identifier('made'));
      } else at.replaceWith(t.inherits(value, at.node));
    }
    const visitor = { CallExpression: edit };
    return { visitor: phase === 'exit' ? { Program: { exit(at) { at.traverse(visitor); } } } : visitor };
  };
}

async function checkLowered(output, label, disabled) {
  const child = (await transformAsync(output, { ...config, plugins: [[requireBabel('@babel/plugin-transform-regenerator').default, { async: true }]] })).code;
  await fs.writeFile(path.join(dir, 'widget.mjs'), child);
  const file = path.join(dir, 'call.mjs');
  await fs.writeFile(file, "import { widget } from './widget.mjs'; export const r = await widget(); export const effects = [];");
  check(`${ label }/lowered`, await runInWorker(file, { stripGlobals: ['Promise'] }), disabled ? 'ERR|ReferenceError' : 'OK|7|[]');
}

// checkStage exercises a late ESM sibling after core-js. The reverse ESM order and
// the supported CommonJS order must work too. In the other CommonJS orders a
// sibling may arrive too late, but any injected reference must still be usable.
async function checkExitOrder(method) {
  const macro = editCall('static', 'inherited', 'exit');
  const corejs = [babelPlugin, { ...options, method }];
  const lower = requireBabel('@babel/plugin-transform-modules-commonjs').default;
  const input = "export const r = marker([['x', 3]]); export const effects = [];";
  for (const [name, plugins, required, extension] of [
    ['ESM before core-js', [macro, corejs], true, 'mjs'],
    ['CommonJS before core-js', [macro, corejs, lower], true, 'cjs'],
    ['CommonJS after core-js', [corejs, macro, lower], false, 'cjs'],
    ['after module transform', [corejs, lower, macro], false, 'cjs'],
  ]) {
    const { code } = await transformAsync(input, { ...config, plugins });
    const label = `${ name }/${ method }`;
    const injected = code.includes('from-entries');
    if (required) check(`${ label }/import`, injected, true);
    else check(`${ label }/lowered export`, code.includes('exports.r'), true);
    const file = path.join(dir, `macro.${ extension }`);
    await fs.writeFile(file, code);
    for (const strip of [false, true]) {
      check(`${ label }/strip ${ strip }`, await runInWorker(file, { strip, stripGlobals: [] }),
        required || injected || !strip ? 'OK|{"x":3}|[]' : 'ERR|TypeError');
    }
  }
}

// The member and its children survive the macro. Only its binding changes.
async function checkExposedStatic(method) {
  const corejs = [babelPlugin, { ...options, method }];
  const macro = {
    visitor: {
      Program: {
        exit(program) {
          const fn = program.get('body.0');
          fn.get('params.0').remove();
          fn.scope.crawl();
        },
      },
    },
  };
  const input = `
    function read(Object) { return Object.fromEntries([['x', 3]]); }
    function local(Object) { return Object.fromEntries([]); }
    const user = { fromEntries() { return 'local'; } };
    export const r = [read(user), local(user)];
    export const effects = [];
  `;
  const file = path.join(dir, 'binding.mjs');
  for (const [name, plugins] of [['before', [macro, corejs]], ['after', [corejs, macro]], ['unchanged', [corejs]]]) {
    const { code } = await transformAsync(input, { ...config, plugins });
    check(`binding/${ method }/${ name }/import`, code.includes('from-entries'), name !== 'unchanged');
    await fs.writeFile(file, code);
    check(`binding/${ method }/${ name }/stripped`, await runInWorker(file, { stripGlobals: [] }),
      name === 'unchanged' ? 'OK|["local","local"]|[]' : 'OK|[{"x":3},"local"]|[]');
  }
}

async function checkRemovedShadows(method) {
  const corejs = [babelPlugin, { ...options, method }];
  const macro = {
    visitor: {
      Program: {
        exit(program) {
          const read = program.get('body').find(at => at.isFunctionDeclaration() && at.node.id.name === 'read');
          read.get('body.body.0').remove();
          program.scope.crawl();
        },
      },
    },
  };
  for (const [name, fn, value, want] of [
    ['var', 'function read(input) { var Object = input; return () => Object.fromEntries([["x", 7]]); }', 'read({})()', '{"x":7}'],
    ['enum', 'function read() { enum Map { local } return Map; }', 'read().groupBy([7], String).get("7")', '[7]'],
    ['annex-b', 'function read() { { function Object() {} } return Object.fromEntries([["x", 7]]); }', 'read()', '{"x":7}'],
  ]) {
    const script = name === 'annex-b';
    const sourceType = script ? 'script' : 'module';
    const file = path.join(dir, script ? 'removed.cjs' : 'removed.mjs');
    const input = script ? `${ fn } module.exports = { r: ${ value }, effects: [] };` : `${ fn } export const r = ${ value }, effects = [];`;
    const opts = { ...config, filename: file, sourceType, parserOpts: { plugins: ['typescript'] } };
    const separate = await transformAsync(input, { ...opts, plugins: [macro] });
    // Reuse the standalone plugin instance with a sibling, in both orders.
    for (const [order, source, plugins] of [
      ['separate', separate.code, [corejs]], ['before', input, [macro, corejs]], ['after', input, [corejs, macro]],
    ]) {
      const { code } = await transformAsync(source, { ...opts, plugins });
      const imported = name === 'enum'
        ? method === 'usage-global' ? code.includes('es.map.group-by') : code.includes('actual/map/group-by')
        : code.includes('from-entries');
      check(`removed/${ name }/${ method }/${ order }/import`, imported, true);
      await fs.writeFile(file, code);
      check(`removed/${ name }/${ method }/${ order }/stripped`, await runInWorker(file, { sourceType, stripGlobals: [] }), `OK|${ want }|[]`);
    }
  }
  const source = `
    function read() { enum Array { local } return Array; }
    export const effects = [];
    const value = (({ from = (effects.push('default'), 'own'), ...rest } = Array) => typeof from)();
    export const r = [read.call(null).from([7]), value];
  `;
  const lower = ['parameters', 'destructuring', 'object-rest-spread'].map(name => requireBabel(`@babel/plugin-transform-${ name }`).default);
  const file = path.join(dir, 'lowered-read.mjs');
  const { code } = await transformAsync(source, { ...config, parserOpts: { plugins: ['typescript'] }, plugins: [corejs, macro, ...lower] });
  await fs.writeFile(file, code);
  check(`removed/${ method }/unrelated-lowered-default`, await runInWorker(file, { stripGlobals: [] }),
    method === 'usage-pure' ? 'OK|[[7],"string"]|["default"]' : 'OK|[[7],"function"]|[]');
  if (method === 'usage-global') {
    const union = `
      function read(which) { var Map, Object; return which ? Map : Object; }
      const map = read.apply(null, [true]);
      const object = read(false);
      export const r = [map.groupBy([7], String).get('7'), object.fromEntries([['v', 9]])];
      export const effects = [];
    `;
    const output = await transformAsync(union, { ...config, plugins: [corejs, macro] });
    await fs.writeFile(file, output.code);
    check('removed/global/multiple-returned-constructors', await runInWorker(file, { stripGlobals: [] }), 'OK|[[7],{"v":9}]|[]');
  }
}

// A sibling that makes no edit must not add a scope-chain search for each unshadowed static.
async function checkUnshadowedLookupWork() {
  const { Scope } = requireBabel('@babel/traverse');
  const { getOwnBinding } = Scope.prototype;
  const corejs = [babelPlugin, { ...options, method: 'usage-global' }];
  const source = `export function f() { return () => () => { ${ 'Object.fromEntries([]);'.repeat(24) } }; }`;
  async function count(plugins) {
    let lookups = 0;
    Scope.prototype.getOwnBinding = function (name) {
      if (name === 'Object') lookups++;
      return getOwnBinding.call(this, name);
    };
    try {
      await transformAsync(source, { ...config, plugins });
      return lookups;
    } finally {
      Scope.prototype.getOwnBinding = getOwnBinding;
    }
  }
  const single = await count([corejs]);
  check('unshadowed binding counter is active', single > 0, true);
  check('unshadowed statics with sibling', await count([corejs, () => ({ visitor: {} })]) <= single, true);
}

// A live global in one method must not send the late member visitor through
// unrelated statements in the same class. A sibling can still add a use there.
async function checkLateMemberVisits() {
  const { NodePath } = requireBabel('@babel/traverse');
  const { traverse } = NodePath.prototype;
  const source = `class View {
    draw(rows) { ${ 'rows.local();'.repeat(40) } }
    keep(rows) { return Object.keys(rows); }
    added() { return marker([['x', 3]]); }
  }`;
  let visits = 0;
  let introduced = 0;
  NodePath.prototype.traverse = function (visitors, ...args) {
    const member = 'MemberExpression|OptionalMemberExpression';
    if (this.isProgram() && visitors.Statement && visitors.Identifier && typeof visitors[member] === 'function') {
      const visitMember = visitors[member];
      visitors = { ...visitors, [member](at) {
        if (at.node.property.name === 'local') visits++;
        else if (at.node.property.name === 'fromEntries') introduced++;
        return visitMember(at);
      } };
    }
    return traverse.call(this, visitors, ...args);
  };
  try {
    const { code } = await transformAsync(source, {
      ...config, plugins: [[babelPlugin, { ...options, method: 'usage-pure' }], editCall('static', 'fresh', 'visit')],
    });
    check('late member visit counter sees the introduced static', introduced > 0, true);
    check('late sweep skips unrelated members', visits, 0);
    check('late sweep serves the introduced static', code.includes('/object/from-entries'), true);
  } finally {
    NodePath.prototype.traverse = traverse;
  }
}

async function checkStage(phase) {
  for (const method of ['usage-global', 'usage-pure']) for (const form of ['inherited', 'in-place', 'fresh']) for (const disabled of [false, true]) {
    const input = `${ disabled ? '// core-js-disable-next-line\n' : '' }export const r = ${ form === 'in-place' ? 'macros.marker' : 'marker' }([['x', 3]]);`;
    const output = (await transformAsync(input, { ...config, plugins: [[babelPlugin, { ...options, method }], editCall('static', form, phase)] })).code;
    check(`${ phase }/${ method }/${ form }/disabled ${ disabled }/import`, output.includes('from-entries'), !disabled);
    const file = path.join(dir, 'record.mjs');
    await fs.writeFile(file, `${ output }\nexport const effects = [];`);
    check(`${ phase }/${ method }/${ form }/disabled ${ disabled }/value`, await runInWorker(file, { stripGlobals: [] }),
      disabled ? 'ERR|TypeError' : 'OK|{"x":3}|[]');
  }
  for (const kind of ['async', 'dynamic']) for (const form of ['replace', 'insert']) for (const disabled of [false, true]) {
    const input = `${ disabled ? '// core-js-disable-next-line\n' : '' }export const widget = marker();`;
    const output = (await transformAsync(input, {
      ...config, plugins: [[babelPlugin, { ...options, method: 'usage-global' }], editCall(kind, form, phase)],
    })).code;
    const label = `${ phase }/${ kind }/${ form }/disabled ${ disabled }`;
    check(`${ label }/Promise`, output.includes('es.promise.constructor'), !disabled);
    if (kind === 'async') await checkLowered(output, label, disabled);
  }
}

try {
  await checkUnshadowedLookupWork();
  await checkLateMemberVisits();
  for (const method of ['usage-global', 'usage-pure']) {
    await checkExitOrder(method);
    await checkExposedStatic(method);
    await checkRemovedShadows(method);
  }
  for (const phase of ['visit', 'exit']) await checkStage(phase);
} finally {
  await fs.remove(dir);
}
finish();
