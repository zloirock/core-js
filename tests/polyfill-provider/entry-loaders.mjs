// Exercise the loader and the binding the emitted program actually calls.
import { strict as assert } from 'node:assert';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { runInNewContext } from 'node:vm';
import { transformSync } from '@babel/core';
import transformModules from '@babel/plugin-transform-modules-commonjs';
import transformTypeScript from '@babel/plugin-transform-typescript';
import { parse } from '@babel/parser';
import plugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish } = createChecker('entry-loaders');
const entry = 'core-js/actual/array/at';
const mod = 'core-js/modules/es.array.at';
const pony = '@core-js/pure/actual/array/from';
function transformBabel(code, options) {
  // eslint-disable-next-line node/no-sync -- the tests inspect each transform immediately
  return transformSync(code, options);
}
const babel = { babelrc: false, configFile: false };
const hosts = [
  ['babel', (source, filename, options) => transformBabel(source, {
    ...babel, filename, parserOpts: { plugins: ['typescript'] }, plugins: [[plugin, options]],
  }).code],
  ['unplugin', (source, filename, options) => createUnplugin(options).transform(source, filename)?.code ?? source],
];

for (const [host, transform] of hosts) {
  function emit(source, method = 'entry-global', filename = 'input.cjs', options = {}) {
    return transform(source, filename, { method, targets: { ie: 11 }, version: '4.0', ...options });
  }
  function execute(source, options = {}) {
    const calls = [];
    const module = { exports: {} };
    const hooks = {
      require(id) {
        calls.push(id);
        if (id === pony) return xs => `pony:${ xs[0] }`;
        return {};
      },
      mark(value) { calls.push(value); },
      replacement(id) { calls.push(`custom:${ id }`); },
      module,
      ...options,
    };
    runInNewContext(source, hooks);
    return { calls, value: hooks.module.exports };
  }
  for (const [name, code, expected] of [
    ['late', `mark(1); require('${ entry }'); mark(2);`, [1, mod, 2]],
    ['getter then load', `const box = { get x() { mark(1); } }; (box.x, require)('${ entry }');`, [1, mod]],
    ['rebound', `require('${ entry }'); require = replacement; require('${ entry }');`, [mod, `custom:${ entry }`]],
    ['pattern write', `({ loader: require } = { loader: replacement }); require('${ entry }');`, [`custom:${ entry }`]],
    ['getter in argument', `const box = { get x() { mark(1); } }; require((box.x, '${ entry }'));`, [1, entry]],
  ]) checkDeep(`${ host }/entry/${ name }`, execute(emit(code)).calls, expected);
  const shadowedUndefined = emit(`require?.('${ entry }'); const undefined = 1;`);
  checkDeep(`${ host }/optional entry with shadowed undefined`, execute(`(function () { ${ shadowedUndefined } })();`).calls, [mod]);
  for (const [specifier, modules] of [
    [entry, [mod]],
    ['core-js/actual/array/from', ['core-js/modules/es.object.to-string', 'core-js/modules/es.array.from', 'core-js/modules/es.string.iterator']],
  ]) {
    for (const late of [false, true]) {
      const file = late ? 'local.cjs' : 'leading.cjs';
      const src = `${ late ? 'mark("before");' : '' } require?.('${ specifier }'); mark("after");`;
      const steps = late ? ['before', 'after'] : ['after'];
      const out = emit(src, 'entry-global', file);
      checkDeep(`${ host }/optional entry/${ file }/${ specifier }`, execute(out).calls, [...steps.slice(0, -1), ...modules, 'after']);
      const reads = [];
      function noop() { /* only loader access is observed */ }
      const hooks = {
        mark: noop,
        get require() { reads.push('get'); return null; },
      };
      checkDeep(`${ host }/direct optional module calls/${ file }/${ specifier }`,
        parse(out).program.body.filter(stmt => stmt.expression?.type === 'OptionalCallExpression')
          .map(({ expression }) => [expression.callee.name, expression.arguments[0].value]), modules.map(id => ['require', id]));
      for (const value of [null, undefined]) {
        checkDeep(`${ host }/nullable entry/${ file }/${ specifier }/${ value }`, execute(out, { require: value }).calls, steps);
      }
      assert.throws(() => execute(out, { require: false }), { name: 'TypeError' });
      assert.throws(() => runInNewContext(out, { mark: noop }), { name: 'ReferenceError' });
      const empty = emit(src, 'entry-global', file, { targets: { chrome: '140' } });
      runInNewContext(empty, hooks);
      checkDeep(`${ host }/filtered optional loader/${ file }/${ specifier }`, reads, ['get']);
      assert.throws(() => runInNewContext(empty, { mark: noop }), { name: 'ReferenceError' });
    }
  }
  const mixed = emit(`require?.('${ entry }'); mark(1); require('${ entry }');`);
  checkDeep(`${ host }/optional load does not satisfy a required load`, execute(mixed).calls, [mod, 1, mod]);
  assert.throws(() => execute(mixed, { require: null }), { name: 'TypeError' });
  for (const definition of [
    'const box = { get x() { throw new RangeError("getter"); } };',
    'const box = { get x() { if (mark) throw new RangeError("getter"); return 1; } };',
    'const box = { x: 0 }; Object.defineProperty(box, "x", { get() { throw new RangeError("getter"); } });',
  ]) {
    const source = `${ definition } (box.x, require)('${ entry }');`;
    const filtered = emit(source, 'entry-global', 'empty.cjs', { exclude: ['es.array.at'] });
    assert.throws(() => execute(filtered), { name: 'RangeError', message: 'getter' }, `${ host }/zero modules/${ definition }`);
    const code = emit(source);
    assert.throws(() => execute(code), { name: 'RangeError', message: 'getter' }, `${ host }/${ definition }\n${ code }`);
  }
  for (const [name, target, expected] of [
    ['literal key', 'Object["defineProperty"]', 'require'],
    ['computed name', 'Object[defineProperty]', 'import'],
    ['Reflect key', 'Reflect["defineProperty"]', 'require'],
  ]) {
    const out = emit(`${ target }(exports, "x", { value: [1].at(0) });`, 'usage-pure', 'format.js');
    check(`${ host }/format/${ name }`, out.includes('require("@core-js/pure/actual/array/instance/at")') ? 'require' : 'import', expected);
  }
  for (const method of ['usage-global', 'usage-pure']) {
    const source = `mark(1); require('${ mod }.js'); mark(2);`;
    checkDeep(`${ host }/${ method }/late user load`, execute(emit(source, method, 'input.cjs', { additionalPackages: ['core-js'] })).calls,
      [1, `${ mod }.js`, 2]);
  }
  const combined = emit('const guard = module?.exports; module.exports.bar = [1, 2].flat(); module.exports.baz = ["a", "b"].at(0);',
    'usage-pure', 'combined.js');
  check(`${ host }/optional and ordinary CommonJS markers`, combined.includes('require("@core-js/pure/actual/array/instance/at")'), true);
  const sloppy = emit(`require('${ mod }'); "use strict"; module.exports = (function () { return this === undefined; })();`, 'usage-global');
  check(`${ host }/strictness`, execute(sloppy).value, false);
  const client = emit(`import '${ mod }'; "use client"; export default 1;`, 'usage-global', 'input.mjs');
  check(`${ host }/client directive`, parse(client, { sourceType: 'module' }).program.directives.length, 0);
  const comment = emit(`/*! keep license */ import '${ mod }'; // keep trailing`, 'usage-global', 'input.mjs');
  for (const text of ['keep license', 'keep trailing']) check(`${ host }/sole statement/${ text }`, comment.split(text).length, 2);
  for (const callee of ['require', '(bump(), require)?.']) {
    const local = emit(`start(); /*! first */ ${ callee }("core-js/actual/array/from"); // last\nend();`);
    checkDeep(`${ host }/local comments bracket every load/${ callee }`,
      local.match(/first|bump\(\)|es\.object\.to-string|es\.array\.from|es\.string\.iterator|last|end\(\)/g),
      ['first', ...callee === 'require' ? [] : ['bump()'], 'es.object.to-string', 'es.array.from', 'es.string.iterator', 'last', 'end()']);
  }
  for (const [name, source, expected] of [
    ['attributes', `import '${ entry }' with { type: 'json' };`, node => node.attributes?.[0]?.value.value === 'json'],
    ['options', `await import('${ entry }', { get with() { mark(1); } });`, node => node.expression.argument.options.properties[0].kind === 'get'],
    ['import prefix', `const box = { get x() { mark(1); } }; await (box.x, import('${ entry }'));`,
      node => node.expression.argument.expressions[0].property.name === 'x'],
  ]) {
    const { program } = parse(emit(source, 'entry-global', 'input.mjs'), { sourceType: 'module', createImportExpressions: true });
    check(`${ host }/${ name }`, expected(program.body.at(-1)), true);
  }
  for (const [name, source, expected] of [
    ['early var', `module.exports = Array.from([3]); var from = require('${ pony }');`, 'pony:3'],
    ['rebound require binding', `require = replacement; const from = require('${ pony }'); module.exports = Array.from([3]);`, 'pony:3'],
    ['early closure', `module.exports = f(); var from = require('${ pony }'); function f() { return Array.from([3]); }`, 'pony:3'],
    ['shadowed require', `const from = require('${ pony }'); module.exports = (from => Array.from([3]))(() => 'wrong');`, 'pony:3'],
  ]) check(`${ host }/binding/${ name }`, execute(emit(source, 'usage-pure')).value, expected);
  for (const kind of ['var', 'const']) {
    const source = `${ kind } from = (mark(Array.from([3])), require)('${ pony }'); module.exports = from([4]);`;
    const { calls, value } = execute(emit(source, 'usage-pure'));
    checkDeep(`${ host }/call within own ${ kind } initializer`, calls.filter(x => x !== pony), ['pony:3']);
    check(`${ host }/initialized ${ kind }`, value, 'pony:4');
  }
  const cyclic = `const side = require('side'), from = require('${ pony }');
    module.exports = from([4]); function read() { return Array.from([3]); }`;
  let readFromCycle;
  let seen;
  const cyclicCode = emit(cyclic, 'usage-pure');
  // Evaluating the first dependency can call into a hoisted function in this module.
  const cyclicValue = execute(`expose(read);\n${ cyclicCode }`, {
    expose(fn) { readFromCycle = fn; },
    require(id) {
      if (id === 'side') {
        seen = readFromCycle();
        return {};
      }
      return xs => `pony:${ xs[0] }`;
    },
  });
  check(`${ host }/early module callback`, seen, 'pony:3');
  check(`${ host }/later declarator`, cyclicValue.value, 'pony:4');
  for (const before of ['', 'require = replacement;', 'function require(id) { return replacement(id); }']) {
    const source = `${ before } import held = require('${ pony }'); module.exports = [held([9]), Array.from([3])];`;
    const compiled = transformBabel(emit(source, 'usage-pure', 'loader.cts'), {
      ...babel, filename: 'loader.cts', plugins: [transformTypeScript, transformModules],
    });
    const { value } = execute(compiled.code, { replacement: () => xs => `custom:${ xs[0] }` });
    checkDeep(`${ host }/TS require binding/${ before }`, Array.from(value), [before ? 'custom:9' : 'pony:9', 'pony:3']);
  }
  for (const form of ['const realm = require', 'import realm = require']) {
    const source = `require = replacement; ${ form }('@core-js/pure/actual/global-this'); module.exports = realm.Array.from([3]);`;
    const compiled = transformBabel(emit(source, 'usage-pure', 'realm.cts'), {
      ...babel, filename: 'realm.cts', plugins: [transformTypeScript, transformModules],
    });
    const { value } = execute(compiled.code, { replacement: () => ({ Array: { from: () => 'vendor' } }) });
    check(`${ host }/user loader owns its realm/${ form }`, value, 'vendor');
  }
  const loadRealm = "require('@core-js/pure/actual/global-this')";
  for (const [name, source, expected] of [
    ['deferred', `function get() { const r = ${ loadRealm }; return r.Array.from([3]); }
      require = replacement; module.exports = get();`, 'vendor'],
    ['loop back-edge', `let v; for (let i = 0; i < 2; i++) { const r = ${ loadRealm }; v = r.Array.from([3]); require = replacement; }
      module.exports = v;`, 'vendor'],
    ['immediate', `module.exports = (() => { const r = ${ loadRealm }; return r.Array.from([3]); })(); require = replacement;`, 'pony:3'],
    ['computed method key', `let result; class X { [(() => { const r = ${ loadRealm }; result = r.Array.from([3]); return 'key'; })()]() {} }
      require = replacement; module.exports = result;`, 'pony:3'],
    ['completed loop', `for (let i = 0; i < 1; i++) { const r = ${ loadRealm }; module.exports = r.Array.from([3]); } require = replacement;`, 'pony:3'],
  ]) {
    const { value } = execute(emit(source, 'usage-pure'), {
      require: id => id === pony ? xs => `pony:${ xs[0] }` : { Array },
      replacement: () => ({ Array: { from: () => 'vendor' } }),
    });
    check(`${ host }/loader timing/${ name }`, value, expected);
  }
  for (const gap of ['', ' ']) {
    const inner = 'function nested() { const { from } = Array; }';
    const code = emit(`${ inner }${ gap }from([1]).at(0);`, 'usage-pure', 'scope.cjs');
    const result = runInNewContext(`delete String.prototype.at;\n${ code }`, {
      from: () => 'text',
      require(id) {
        if (id === '@core-js/pure/actual/instance/at') return text => () => text[0];
        assert.equal(id, pony);
        return Array.from;
      },
    });
    check(`${ host }/outside from scope/${ gap.length }`, result, 't');
    const map = emit(`function nested() { const { Map: M } = globalThis; }${ gap }M.groupBy([1], x => x);`, 'usage-pure', 'scope.cjs');
    check(`${ host }/outside Map alias/${ gap.length }`, runInNewContext(map, { require: () => Map, M: { groupBy: () => 'vendor' } }), 'vendor');
  }
  const typed = emit(`import choose from '${ pony }'; export const a = choose([2]).at(0);
    export function other(choose) { return [choose().at(0), Array.from([3])]; }`, 'usage-pure', 'typed.mjs');
  const imports = parse(typed, { sourceType: 'module' }).program.body.filter(node => node.type === 'ImportDeclaration');
  const helpers = new Set(imports.map(node => node.source.value));
  check(`${ host }/outer import still returns an array`, helpers.has('@core-js/pure/actual/array/instance/at'), true);
  check(`${ host }/parameter return stays generic`, helpers.has('@core-js/pure/actual/instance/at'), true);
  for (const query of ['', '?raw', '?url', '?v=1']) {
    const independent = emit(`import pony from '${ pony + query }'; export default Array.from([3]);`, 'usage-pure', 'no-shadow.mjs');
    const loads = parse(independent, { sourceType: 'module' }).program.body.filter(node => node.type === 'ImportDeclaration');
    checkDeep(`${ host }/unshadowed specifiers/${ query }`, loads.map(node => node.source.value).sort(),
      query === '?raw' || query === '?url' ? [pony, pony + query] : [pony + query]);
    const source = `import pony from '${ pony + query }'; export default [pony, ((pony) => Array.from([3]))(() => 0)];`;
    const { code } = transformBabel(emit(source, 'usage-pure', 'binding.mjs'), { ...babel, plugins: [transformModules] });
    const module = { exports: {} };
    const value = execute(code, { module, exports: module.exports, require(id) {
      if (id === pony || id === `${ pony }?v=1`) return xs => `pony:${ xs[0] }`;
      assert.equal(id, pony + query);
      return 'asset';
    } }).value.default;
    check(`${ host }/ESM shadow/${ query }`, value[1], 'pony:3');
    if (query === '?raw' || query === '?url') check(`${ host }/asset export/${ query }`, value[0], 'asset');
  }
}
// Both conditional export targets exist. Execute what each host emits from a project
// whose path needs URL encoding, switching styles in the same process.
const root = await realpath(await mkdtemp(join(tmpdir(), 'core-js-entry-')));
const project = join(root, 'project #%');
try {
  await mkdir(join(project, 'node_modules', '@core-js'), { recursive: true });
  await symlink(fileURLToPath(new URL('../../packages/core-js-pure', import.meta.url)),
    join(project, 'node_modules', '@core-js', 'pure'), 'junction');
  for (const [host, transform] of hosts) {
    const source = `const picked = require?.('${ pony }');
      const root = require?.('@core-js/pure/actual/global-this');
      export default [typeof picked, Array.from([3])[0], root?.Array.from([4])[0]];`;
    const file = join(project, `${ host }-optional.mjs`);
    const code = transform(source, file, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
    for (const [loader, expected] of [['null', ['undefined', 3, null]], ['void 0', ['undefined', 3, null]],
      ['createRequire(import.meta.url)', ['function', 3, 4]]]) {
      await writeFile(file, `import { createRequire } from 'node:module'; const require = ${ loader };\n${ code }`);
      const run = `delete Array.from; console.log(JSON.stringify((await import('./${ host }-optional.mjs')).default));`;
      const { stdout } = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', run], { cwd: project });
      checkDeep(`${ host }/optional provider/${ loader }`, JSON.parse(stdout), expected);
    }
    const main = `${ host }-cycle.mjs`;
    const dep = `${ host }-dependency.mjs`;
    await writeFile(join(project, dep), `import { read } from './${ main }'; export const early = globalThis.early = read();`);
    const body = `const prior = require('${ pony }'); export function read() { return Array.from([3])[0]; } export default prior([4])[0];`;
    for (const moduleSource of [`import './${ dep }'; ${ body }`, `${ body } export { early } from './${ dep }';`]) {
      const output = join(project, main);
      await writeFile(output, transform(moduleSource, output, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }));
      const run = `import { createRequire } from 'node:module'; globalThis.require = createRequire(import.meta.url);
        delete Array.from; const result = await import('./${ main }'); console.log(JSON.stringify([globalThis.early, result.default]));`;
      const { stdout } = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', run], { cwd: project });
      checkDeep(`${ host }/ESM cycle before require/${ moduleSource }`, JSON.parse(stdout), [3, 4]);
    }
  }
  const pkg = join(project, 'node_modules', 'entry-test');
  const other = join(root, 'other', 'node_modules', 'entry-test', 'actual', 'array');
  await mkdir(other, { recursive: true });
  await writeFile(join(other, 'from.js'), 'module.exports = () => 53;');
  await symlink(join(root, 'other'), join(root, 'other #%'), 'junction');
  const otherModules = join(root, 'other', 'node_modules', 'entry-test', 'modules');
  await mkdir(otherModules);
  await writeFile(join(otherModules, 'es.array.at.js'), "globalThis.loads.push('relative');");
  const store = join(root, 'store #%');
  await mkdir(pkg, { recursive: true });
  await mkdir(store);
  await symlink(store, join(pkg, 'linked'), 'junction');
  await writeFile(join(store, 'identity.mjs'), 'export default {};');
  await symlink(store, join(project, 'node_modules', 'renamed-test'), 'junction');
  await symlink(store, join(root, 'renamed-test'), 'junction');
  await mkdir(join(store, 'actual', 'array'), { recursive: true });
  await writeFile(join(store, 'package.json'), JSON.stringify({ name: 'renamed-test', type: 'module', exports: {
    './package.json': './package.json', './actual/array/from': './actual/array/from.js',
    './actual/array/of': './actual/array/of.js?built', './actual/global-this': './actual/global-this.js',
    './modules/es.array.at': './modules/es.array.at.js',
  } }));
  const identify = 'const url = new URL(import.meta.url); export default xs => url.search || url.hash || xs[0];';
  await writeFile(join(store, 'actual', 'global-this.js'), 'export default new URL(import.meta.url).search ? { Array: { from: () => 81 } } : globalThis;');
  for (const name of ['from', 'of']) await writeFile(join(store, 'actual', 'array', `${ name }.js`), identify);
  await mkdir(join(store, 'modules'));
  await writeFile(join(store, 'modules', 'es.array.at.js'), 'globalThis.loads.push(new URL(import.meta.url).hash);');
  await writeFile(join(pkg, 'package.json'), JSON.stringify({
    name: 'entry-test', version: '4.0.0', exports: {
      './package.json': './package.json',
      './actual/array/from': { import: './import.mjs', require: './require.cjs' },
      './actual/array/of': { import: './import.mjs' },
      './modules/es.array.at': { import: './effect.mjs', require: './effect.cjs' },
      './missing': './later.cjs',
      './directory': './linked',
      './conditions': { 'fixture mode': './special.mjs', 'node-addons': './addons.mjs', import: './import.mjs' },
      './query': './linked/identity.mjs?variant=a',
      './fragment': './linked/identity.mjs#b',
    },
  }));
  await writeFile(join(pkg, 'import.mjs'), 'export default () => 17;');
  await writeFile(join(pkg, 'require.cjs'), 'module.exports = () => 23;');
  await writeFile(join(pkg, 'effect.mjs'), "globalThis.loads.push('import');");
  await writeFile(join(pkg, 'effect.cjs'), "globalThis.loads.push('require');");
  await writeFile(join(pkg, 'special.mjs'), 'export default () => 41;');
  await writeFile(join(pkg, 'addons.mjs'), 'export default () => 53;');
  const resolver = new URL('../../packages/core-js-polyfill-provider/helpers/path-normalize.js', import.meta.url).href;
  const compareConditions = `import { resolveImportPath } from ${ JSON.stringify(resolver) };
    import bare from 'entry-test/conditions';
    import * as query from 'entry-test/query';
    import * as fragment from 'entry-test/fragment';
    const absolute = await import(resolveImportPath('entry-test', 'conditions', true, 'import'));
    const queryURL = resolveImportPath('entry-test', 'query', true, 'import');
    const fragmentURL = resolveImportPath('entry-test', 'fragment', true, 'import');
    const sameQuery = query === await import(queryURL);
    const sameFragment = fragment === await import(fragmentURL);
    console.log([bare(), absolute.default(), query !== fragment, sameQuery, sameFragment].join(' '));`;
  for (const [args, nodeOptions, expected, preserveSymlinks = '0'] of [
    [['--conditions=fixture mode'], '', 41],
    [[], '--conditions="fixture mode"', 41],
    [['--no-addons'], '', 17],
    [['--addons'], '--no-addons', 53],
    [[], '', 53],
    [[], '', 53, '1'],
    [['--no-preserve-symlinks'], '', 53, '1'],
    [['--preserve_symlinks', '--no_addons'], '', 17],
  ]) {
    const { stdout } = await promisify(execFile)(process.execPath, ['--experimental-import-meta-resolve', ...args, '--input-type=module', '-e', compareConditions], {
      cwd: project, env: { ...process.env, NODE_OPTIONS: nodeOptions, NODE_PRESERVE_SYMLINKS: preserveSymlinks },
    });
    check(`native and absolute exports ${ JSON.stringify([args, nodeOptions, preserveSymlinks]) }`,
      stdout.trim(), `${ expected } ${ expected } true true true`);
  }
  const worker = fileURLToPath(new URL('./fixtures/absolute-imports.mjs', import.meta.url));
  for (const [flag, branch] of [['--no-experimental-import-meta-resolve', 'require'], ['--experimental-import-meta-resolve', 'import']]) {
    const { stdout } = await promisify(execFile)(process.execPath, [flag, worker, branch], {
      cwd: project, env: { ...process.env, NODE_OPTIONS: '' },
    });
    check(`execute absolute imports ${ flag }`, stdout.trim(), 'ok');
  }
} finally {
  await rm(root, { recursive: true, force: true });
}
finish();
