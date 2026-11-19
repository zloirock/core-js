// Project-local packages supply both version metadata and emitted import paths. Run in a
// child so changing the working directory cannot disturb concurrently loaded test suites.
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { normalizeCoreJSVersion } from '../../packages/core-js-compat/helpers.js';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { createPolyfillContext } from '../../packages/core-js-polyfill-provider/index.js';
import { packageRootPrefix, resolveImportPath } from '../../packages/core-js-polyfill-provider/helpers/path-normalize.js';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const ROOT = process.cwd();

async function runProjects() {
  const directory = await realpath(await mkdtemp(join(tmpdir(), 'core-js-package-resolution-')));
  const rows = [];
  function check(label, got, want) { rows.push({ label, got, want }); }
  function errorOf(fn) {
    try {
      fn();
      return '';
    } catch (error) { return error.message; }
  }
  async function json(file, value) {
    await mkdir(resolve(file, '..'), { recursive: true });
    await writeFile(file, JSON.stringify(value));
  }
  async function checkTransform(host, source, options, cwd, installed, project) {
    const { method, version } = options;
    const label = `${ project }/${ method }/${ version }/${ host }`;
    const file = join(cwd, `${ method }-${ version }-${ host }.cjs`);
    const dependencies = [];
    let output;
    let error = '';
    try {
      output = host === 'babel'
        ? (await transformAsync(source, { configFile: false, babelrc: false, filename: file, plugins: [[babelPlugin, options]] })).code
        : createUnplugin(options).transform(source, file, 'single', '', {
          onRequire: (dependency, pure) => dependencies.push([dependency, pure]),
        })?.code;
    } catch (error_) { error = error_.message; }
    check(`${ label } transform`, error, '');
    if (error) return;
    check(`${ label } path`, output.includes(installed.replaceAll('\\', '/')), true);
    if (host === 'unplugin' && method !== 'entry-global') {
      const subpath = method === 'usage-pure' ? 'actual/array/instance/at' : 'modules/es.array.at';
      check(`${ label } finalized dependency`, JSON.stringify(dependencies),
        JSON.stringify([[resolveImportPath('project-polyfills', subpath, true), method === 'usage-pure']]));
    }
    await writeFile(file, output);
    const require = createRequire(file);
    delete globalThis.packageResolutionMarker;
    const modulePath = resolveImportPath('project-polyfills', 'modules/es.array.at', true);
    delete require.cache[require.resolve(modulePath)];
    // eslint-disable-next-line import/no-dynamic-require -- execute this project's transformed file
    const result = require(file);
    check(`${ label } runtime`, method === 'usage-pure' ? result : globalThis.packageResolutionMarker, project);
  }
  try {
    for (const project of ['first project #one', 'second project #two']) {
      const cwd = join(directory, project);
      const installed = join(cwd, 'vendor', 'runtime');
      await mkdir(join(installed, 'actual/array/instance'), { recursive: true });
      await mkdir(join(installed, 'modules'), { recursive: true });
      await mkdir(join(cwd, 'node_modules'), { recursive: true });
      await symlink(installed, join(cwd, 'node_modules/project-polyfills'), 'junction');
      await json(join(installed, 'package.json'), { name: 'project-polyfills', version: '4.0.0',
        exports: { './package.json': './package.json', './*': './*.js' } });
      await json(join(cwd, 'package.json'), { dependencies: { 'project-polyfills': '^4.0.0', 'core-js': '^3.0.0' } });
      await json(join(cwd, 'node_modules/core-js/package.json'), { name: 'core-js', version: '3.0.0' });
      await mkdir(join(cwd, 'node_modules/@core-js'), { recursive: true });
      await symlink(installed, join(cwd, 'node_modules/@core-js/pure'), 'junction');
      await writeFile(join(installed, 'actual/array/instance/at.js'),
        `module.exports = function () { return function () { return ${ JSON.stringify(project) }; }; };`);
      await writeFile(join(installed, 'modules/es.array.at.js'),
        `globalThis.packageResolutionMarker = ${ JSON.stringify(project) };`);
      process.chdir(cwd);
      check(`${ project }/pure default uses pure version`, errorOf(() => createPolyfillContext({ method: 'usage-pure' })), '');
      check(`${ project }/global default rejects old version`, errorOf(() => createPolyfillContext({
        method: 'usage-global',
      })).startsWith('[core-js] invalid `version` option:'), true);
      const manifest = resolveImportPath('project-polyfills', 'package.json', true);
      check(`${ project }/project manifest`, manifest, join(installed, 'package.json').replaceAll('\\', '/'));
      check(`${ project }/warm manifest`, resolveImportPath('project-polyfills', 'package.json', true), manifest);
      check(`${ project }/resolved root`, packageRootPrefix('project-polyfills'), `${ installed.replaceAll('\\', '/').toLowerCase() }/`);
      check(`${ project }/bare path`, resolveImportPath('missing-package', 'actual/array/at', false), 'missing-package/actual/array/at');
      check(`${ project }/missing recognition`, packageRootPrefix('missing-package'), null);
      for (const subpath of ['actual/missing', 'missing']) {
        const error = errorOf(() => resolveImportPath('project-polyfills', subpath, true));
        check(`${ project }/${ subpath } fails clearly`, error.includes('[core-js] cannot resolve'), true);
        check(`${ project }/${ subpath } names project`, error.includes(JSON.stringify(cwd)), true);
      }
      for (const version of [undefined, 'node_modules', 'package.json', '4.0']) {
        for (const method of ['entry-global', 'usage-global', 'usage-pure']) {
          const options = { method, version, package: 'project-polyfills///', targets: { ie: 11 }, absoluteImports: true };
          check(`${ project }/${ method }/${ version } version`, errorOf(() => createPolyfillContext(options)), '');
          const source = method === 'entry-global'
            ? 'require("project-polyfills/actual/array/at"); module.exports = 1;'
            : 'module.exports = [1].at(0);';
          for (const host of ['babel', 'unplugin']) {
            await checkTransform(host, source, options, cwd, installed, project);
          }
        }
      }
      for (const [name, version] of [['old', '3.99.0'], ['invalid', 'bad'], ['absent', undefined]]) {
        await json(join(cwd, `node_modules/${ name }/package.json`), { name, version });
        check(`${ project }/${ name } metadata rejects`, errorOf(() => createPolyfillContext({
          method: 'usage-pure', package: name,
        })).startsWith('[core-js] invalid `version` option:'), true);
      }
      // Each range is read from its own project: the JSON module cache is intentionally stable.
      for (const [label, fields, want] of [
        ['dependencies first', { dependencies: { 'project-polyfills': '^4.1.2' }, devDependencies: { 'project-polyfills': '^3.0.0' } }, '4.1.2'],
        ['dev dependency', { devDependencies: { 'project-polyfills': '~4.2.0' } }, '4.2.0'],
        ['peer dependency', { peerDependencies: { 'project-polyfills': '>=4.3' } }, '4.3.0'],
        ['wildcard', { dependencies: { 'project-polyfills': '*' } }, '4.0.0'],
        ['npm alias', { dependencies: { 'project-polyfills': 'npm:core-js@^4.1.0' } }, '4.1.0'],
      ]) {
        const nested = join(cwd, label);
        await json(join(nested, 'package.json'), fields);
        process.chdir(nested);
        check(`${ project }/${ label }`, normalizeCoreJSVersion('package.json', {
          package: 'project-polyfills', resolve: source => createRequire(join(nested, 'package.json')).resolve(source),
        }).toString(), want);
        check(`${ project }/${ label } provider`, errorOf(() => createPolyfillContext({
          method: 'usage-pure', package: 'project-polyfills', version: 'package.json',
        })), '');
      }
      process.chdir(cwd);
      check(`${ project }/additional package cannot supply main version`, errorOf(() => createPolyfillContext({
        method: 'usage-pure', package: 'project-polyfills', additionalPackages: ['old', 'missing-package'],
      })), '');
      check(`${ project }/missing version rejects`, errorOf(() => createPolyfillContext({
        method: 'usage-pure', package: 'missing-package',
      })).includes('missing-package'), true);
      check(`${ project }/explicit version needs no install`, errorOf(() => createPolyfillContext({
        method: 'usage-pure', package: 'missing-package', version: '4.0',
      })), '');
    }
  } finally {
    process.chdir(ROOT);
    delete globalThis.packageResolutionMarker;
    await rm(directory, { recursive: true, force: true });
  }
  return rows;
}

if (process.argv.includes('--child')) {
  console.log(JSON.stringify(await runProjects()));
} else {
  const { createChecker } = await import('../polyfill-provider/harness.mjs');
  const { check, finish } = createChecker('package-resolution');
  const { stdout } = await promisify(execFile)(process.execPath, [import.meta.filename, '--child'], { cwd: ROOT });
  const rows = JSON.parse(stdout);
  check('complete project matrix', rows.length, 238);
  for (const { label, got, want } of rows) check(label, got, want);
  finish();
}
