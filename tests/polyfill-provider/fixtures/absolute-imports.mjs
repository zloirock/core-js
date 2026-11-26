import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { rm, writeFile } from 'node:fs/promises';
// eslint-disable-next-line node/no-unsupported-features/node-builtins -- exercise a strict resolver in this child process
import { createRequire, registerHooks } from 'node:module';
import { join, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { parse } from '@babel/parser';
import 'zx/globals';
import babelPlugin from '../../../packages/core-js-babel-plugin/index.js';
import { absoluteImportsForHost, resolveImportPath } from '../../../packages/core-js-polyfill-provider/helpers/path-normalize.js';
import createUnplugin from '../../../packages/core-js-unplugin/internals/plugin.js';
import { transformBabel, transformUnplugin } from '../../transpiler-differential/harness.mjs';

const project = process.cwd();
const pkg = join(project, 'node_modules', 'entry-test');
const requireFromProject = createRequire(join(project, 'input.cjs'));
assert.throws(() => resolveImportPath('entry-test', 'actual/array/of', true, 'require'),
  ({ cause }) => cause?.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED');

const requireBabel = createRequire(import.meta.url);
const babel = requireBabel('@babel/core');
const commonjs = requireBabel('@babel/plugin-transform-modules-commonjs');
const corejs = [babelPlugin, { method: 'usage-pure', package: 'entry-test', version: '4.0', targets: { ie: 11 }, absoluteImports: true }];
for (const [kind, config] of Object.entries({
  before: { plugins: [corejs, commonjs] },
  after: { plugins: [commonjs, corejs] },
  preset: { passPerPreset: true, presets: [() => ({ plugins: [corejs, commonjs] })] },
})) {
  const { code } = await babel.transformAsync('const require = () => 99; export const r = [Array.from([]), require()];', {
    filename: join(project, 'input.mjs'), configFile: false, babelrc: false,
    ...config,
  });
  const out = join(project, `lowered-${ kind }.cjs`);
  await writeFile(out, code);
  assert.deepEqual(requireFromProject(out).r, [23, 99]);
}

const projectURL = new URL('.', pathToFileURL(join(project, 'input.mjs'))).href;
const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('/')) throw new Error('Directory imports are unsupported');
  if (specifier === 'entry-test/hook-only' && context.conditions.includes('import') && new URL('.', context.parentURL).href === projectURL) {
    return nextResolve(pathToFileURL(join(pkg, 'special.mjs')).href, context);
  }
  return nextResolve(specifier, context);
} });
try {
  const target = resolveImportPath('entry-test', 'actual/array/from', true, 'import');
  assert.equal((await import(target)).default(), 17);
  const custom = resolveImportPath('entry-test', 'hook-only', true, 'import');
  assert.equal((await import(custom)).default(), 41);
} finally {
  hook.deregister();
}

for (const entry of ['query', 'fragment']) {
  const url = new URL(resolveImportPath('entry-test', entry, true, 'import'));
  const file = fileURLToPath(url).split(sep).join('/');
  assert.ok(file.includes('#') && (url.search || url.hash));
  for (const host of ['esbuild', 'rollup', '@rollup/plugin-babel', 'webpack', 'babel-loader']) {
    const webpack = host === 'webpack' || host === 'babel-loader';
    const target = resolveImportPath('entry-test', entry, absoluteImportsForHost(true, host), 'import');
    const request = new URL(target);
    assert.equal(fileURLToPath(request).split(sep).join('/'), webpack ? file.replaceAll('#', '\0#') : file);
    assert.equal(request.search, url.search);
    assert.equal(request.hash, url.hash);
  }
}

globalThis.loads = [];
for (const [host, transform] of [['babel', transformBabel], ['unplugin', transformUnplugin]]) {
  for (const [style, key] of [['require', 'from'], ['import', 'from'], ['import', 'of'], ['require', 'from']]) {
    const esm = style === 'import';
    const source = `${ esm ? 'export default' : 'module.exports =' } Array.${ key }([3]);`;
    const options = { method: 'usage-pure', importStyle: style, version: '4.0', package: 'entry-test', absoluteImports: true, targets: { ie: 11 } };
    const code = await transform(source, options, false, esm ? 'module' : 'script');
    const file = join(pkg, esm ? 'import.mjs' : 'require.cjs');
    assert.ok(code.includes(esm ? pathToFileURL(file).href : file.split(sep).join('/')), code);
    const output = join(project, `${ host }-${ key }.${ esm ? 'mjs' : 'cjs' }`);
    await writeFile(output, code);
    const value = esm ? (await import(pathToFileURL(output))).default : requireFromProject(output);
    assert.equal(value, esm ? 17 : 23);
  }
  // A linked package can live in an escaped directory with a different name.
  const options = { method: 'usage-pure', package: 'renamed-test', absoluteImports: true, version: '4.0', targets: { ie: 11 } };
  const other = join(project, '..', 'other', 'node_modules', 'entry-test', 'actual', 'array', 'from.js');
  const encoded = join(project, '..', 'other #%', 'node_modules', 'entry-test', 'actual', 'array', 'from.js');
  for (const [style, name, specifier] of [
    ['import', 'plain', sep === '/' ? other : pathToFileURL(other).href],
    ['import', 'encoded', pathToFileURL(encoded).pathname],
    ['require', 'plain', other],
    ['require', 'literal', encoded],
  ]) {
    const esm = style === 'import';
    const foreign = JSON.stringify(specifier);
    const load = esm ? `import foreign from ${ foreign }; export default` : `const foreign = require(${ foreign }); module.exports =`;
    const source = `${ load } [foreign([3]), Array.from([4])];`;
    const output = join(project, `${ host }-second-copy-${ name }.${ esm ? 'mjs' : 'cjs' }`);
    const code = await transform(source, { ...options, package: 'entry-test', importStyle: style }, false, esm ? 'module' : 'script');
    await writeFile(output, code);
    assert.deepEqual(esm ? (await import(pathToFileURL(output))).default : requireFromProject(output), [53, esm ? 17 : 23]);
  }
  const from = 'entry-test/actual/array/from';
  const side = 'entry-test/modules/es.array.at';
  const relative = '../other/node_modules/entry-test/modules/es.array.at.js';
  const prelude = "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);\n";
  for (const style of ['import', 'require']) {
    const esm = style === 'import';
    const source = esm ? `const prior = require('${ from }');` : `import prior from '${ from }';`;
    const opts = { ...options, package: 'entry-test', importStyle: style };
    for (const absoluteImports of [false, true]) {
      const code = await transform(`${ source } export default [prior(), Array.from([])];`, { ...opts, absoluteImports });
      const output = join(project, `${ host }-mixed-${ style }-${ absoluteImports }.mjs`);
      await writeFile(output, prelude + code);
      assert.deepEqual((await import(pathToFileURL(output))).default,
        [esm ? 23 : 17, esm ? 17 : 23]);
    }
    const loads = esm ? `require('${ side }'); require('${ relative }');` : `import '${ side }'; import '${ relative }';`;
    for (const use of [false, true]) {
      const code = await transform(`${ loads } export default ${ use ? '[4].at(0)' : '4' };`,
        { ...opts, method: 'usage-global', absoluteImports: false });
      const output = join(project, `${ host }-effects-${ style }-${ use }.mjs`);
      await writeFile(output, prelude + code);
      const run = 'globalThis.loads = []; const { default: value } = await import(process.argv[1]); console.log(JSON.stringify([value, loads]));';
      const { stdout } = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', run, pathToFileURL(output).href]);
      const expected = esm ? [use && style, 'require', 'relative'] : ['import', 'relative', use && style];
      assert.deepEqual(JSON.parse(stdout), [4, expected.filter(Boolean)]);
    }
  }
  for (const key of ['from', 'of']) {
    const specifier = resolveImportPath('renamed-test', `actual/array/${ key }`, true, 'import');
    const canonical = key === 'of' ? '?built' : '';
    const [path] = specifier.split('?', 1);
    const linked = pathToFileURL(join(project, 'node_modules', 'renamed-test', 'actual', 'array', `${ key }.js`)).href;
    for (const [prior, suffix] of [[path, ''], [path, '?built'], [path, '?other'], [path, '#other'], [linked, canonical]]) {
      const source = `import prior from ${ JSON.stringify(prior + suffix) }; export default [prior([3]), Array.${ key }([4])];`;
      const code = await transform(source, options);
      assert.equal((code.match(/^import /gm) ?? []).length, suffix === canonical ? 1 : 2, code);
      const output = join(project, `${ host }-${ key }-reuse.mjs`);
      await writeFile(output, code);
      const url = pathToFileURL(output);
      url.searchParams.set('instance', prior + suffix);
      assert.deepEqual((await import(url)).default, [suffix || 3, canonical || 4]);
    }
  }
  const mod = resolveImportPath('renamed-test', 'modules/es.array.at', true, 'import');
  const rootPath = pathToFileURL(join(project, '..', 'renamed-test', 'actual', 'global-this.js')).pathname;
  const receiver = await transform(`import root from ${ JSON.stringify(`${ rootPath }?other`) }; export default root.Array.from([]);`, options);
  const receiverFile = join(project, `${ host }-receiver.mjs`);
  await writeFile(receiverFile, receiver);
  assert.equal((await import(pathToFileURL(receiverFile))).default, 81);
  const foreign = `${ mod }#${ host }`;
  const code = await transform(`import ${ JSON.stringify(foreign) }; export default [1].at(0);`,
    { ...options, method: 'usage-global' });
  assert.ok(code.includes(JSON.stringify(foreign)), code);
  assert.ok(code.includes(JSON.stringify(mod)), code);
  const output = join(project, `${ host }-side-effect.mjs`);
  await writeFile(output, code);
  const url = pathToFileURL(output);
  assert.equal((await import(url)).default, 1);
  assert.ok(globalThis.loads.includes(`#${ host }`));
  assert.ok(globalThis.loads.includes(''));
}
delete globalThis.loads;

// Re-reading a bundler path must retain its literal '#' and its original installation.
for (const method of ['usage-pure', 'usage-global']) {
  const pure = method === 'usage-pure';
  const opts = { method, package: 'renamed-test', absoluteImports: true, version: '4.0', targets: { ie: 11 } };
  const subpath = pure ? 'actual/array/from' : 'modules/es.array.at';
  const target = fileURLToPath(resolveImportPath(opts.package, subpath, true, 'import')).split(sep).join('/');
  const relative = pure ? 'actual/array/from.js' : 'modules/es.array.at.js';
  const foreign = join(project, '..', 'other #%', 'node_modules', 'entry-test', relative).split(sep).join('/');
  const use = pure ? 'Array.from([4])' : '[4].at(0)';
  const file = join(project, `bundle-${ method }.mjs`);
  for (const previous of [target, foreign]) {
    const source = `import ${ pure ? 'prior from ' : '' }${ JSON.stringify(previous) }; export default ${ use };`;
    const babelResult = await babel.transformAsync(source, {
      filename: file, babelrc: false, configFile: false, caller: { name: 'esbuild' }, plugins: [[babelPlugin, opts]],
    });
    const unpluginResult = createUnplugin({ ...opts, bundler: 'esbuild' }).transform(source, file)?.code ?? source;
    for (const code of [babelResult.code, unpluginResult]) {
      const sources = parse(code, { sourceType: 'module' }).program.body.filter(node => node.type === 'ImportDeclaration').map(node => node.source.value);
      assert.equal(sources.filter(id => id === target).length, 1, code);
      assert.equal(sources.includes(foreign), previous === foreign, code);
    }
  }
}

// Post must identify a pre-emitted binding even when exports hides the entry's name.
// A sibling can also replace or rename either an authored or an injected binding.
for (const authored of [false, true]) for (const edit of ['keep', 'foreign', 'local', authored ? 'renamed' : 'removed']) {
  const plugin = createUnplugin({ method: 'usage-pure', package: 'entry-test', version: '4.0', targets: { ie: 11 }, absoluteImports: true });
  const file = join(project, `snapshot-${ authored }-${ edit }.mjs`);
  const original = `${ authored ? "import prior from 'entry-test/actual/array/from';" : '' } export const first = Array.from([3]);`;
  const pre = plugin.transform(original, file, 'pre')?.code ?? original;
  const [declaration] = parse(pre, { sourceType: 'module' }).program.body;
  assert.equal(declaration.type, 'ImportDeclaration');
  const { name } = declaration.specifiers[0].local;
  const other = join(project, '..', 'other', 'node_modules', 'entry-test', 'actual', 'array', 'from.js');
  const imports = {
    keep: pre.slice(0, declaration.end),
    foreign: `import ${ name } from ${ JSON.stringify(pathToFileURL(other).href) };`,
    local: `const ${ name } = () => 53;`,
    removed: '',
  };
  const edited = edit === 'renamed' ? pre.replaceAll(name, 'alternate') : `${ imports[edit] }${ pre.slice(declaration.end) }`;
  const source = `${ edited }\nexport const second = Array.from([4]);`;
  const post = plugin.transform(source, file, 'post')?.code ?? source;
  await writeFile(file, post);
  const { first, second } = await import(pathToFileURL(file));
  const replaced = edit === 'local' || edit === 'foreign';
  assert.deepEqual([first, second], [replaced ? 53 : 17, 17], `${ authored }/${ edit }`);
}

const target = join(pkg, 'later.cjs');
assert.equal(requireFromProject(resolveImportPath('entry-test', 'exact-target', true, 'require'))(), 23);
assert.throws(() => resolveImportPath('entry-test', 'exact-target', true, 'import'), /cannot resolve/);
for (const style of ['import', 'require']) {
  assert.throws(() => resolveImportPath('entry-test', 'directory', true, style), /cannot resolve/);
  assert.throws(() => resolveImportPath('entry-test', 'missing', true, style), /cannot resolve/);
}
await writeFile(target, 'module.exports = 31;');
assert.equal((await import(resolveImportPath('entry-test', 'missing', true, 'import'))).default, 31);
assert.equal(requireFromProject(resolveImportPath('entry-test', 'missing', true, 'require')), 31);
await rm(target);
// The other installation has no exports map. Keep its .js and directory-index entries.
process.chdir(join(project, '..', 'other'));
try {
  for (const [entry, expected] of [['actual/array/from', 53], ['actual/array', 57]]) {
    assert.equal((await import(resolveImportPath('entry-test', entry, true, 'import'))).default(), expected);
  }
  assert.equal(requireFromProject.cache[join(process.cwd(), 'node_modules/entry-test/package.json')], undefined);
} finally {
  process.chdir(project);
}
console.log('ok');
