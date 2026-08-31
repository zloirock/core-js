import { deepStrictEqual, ok, strictEqual, throws } from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import configure from '../../packages/core-js-service/internals/application/configure.js';

const versions = { coreJS: '4.0.0', compat: '4.0.0' };

function resolve(options) {
  const warned = [];
  const config = configure(options, {
    warn: (condition, message) => warned.push([condition, message]),
    resolveVersions: version => ({ ...versions, asked: version }),
  });
  return { config, warned };
}

// a misspelled option means the service runs on a default nobody asked for. there is no way to
// tell "not set" from "set, spelled wrong" after the fact
const misspelled = resolve({ scope: ['es.array.at'], targests: 'defaults' });

deepStrictEqual(misspelled.warned.map(([condition]) => condition), ['configure:unknown:targests'],
  'configure-1 #1');
strictEqual(resolve({ scope: [], targets: 'defaults', version: '4.1', exclude: [], minify: false })
  .warned.length, 0, 'configure-1 #2');

// the scope is part of the input, not a refinement of it
throws(() => resolve({}), /`scope` is required/, 'configure-3 #1');
throws(() => resolve({ scope: 'es.array.at' }), /`scope` is required/, 'configure-3 #2');
throws(() => resolve({ scope: [Symbol('es.array.at')] }), /`scope` is required/, 'configure-3 #3');
// an empty scope is a legitimate answer from a build that found nothing, and not the same thing
strictEqual(resolve({ scope: [] }).config.scope.length, 0, 'configure-3 #4');

throws(() => resolve({ scope: [], exclude: 'es.array.at' }), /`exclude`/, 'configure #1');
throws(() => resolve({ scope: [], minify: 'yes' }), /`minify`/, 'configure #2');

// `null` is "keep every generation", `0` is "keep only the one being served": both ends of the
// range are reachable, because the difference is a directory that grows forever against a page that
// loses its polyfills the moment it is deployed over
strictEqual(resolve({ scope: [] }).config.retain, 1, 'configure #14');
strictEqual(resolve({ scope: [], retain: null }).config.retain, null, 'configure #15');
strictEqual(resolve({ scope: [], retain: 0 }).config.retain, 0, 'configure #16');
throws(() => resolve({ scope: [], retain: -1 }), /`retain` has to be/, 'configure #17');
throws(() => resolve({ scope: [], retain: '1' }), /`retain` has to be/, 'configure #18');
throws(() => resolve({ scope: [], retain: 1.5 }), /`retain` has to be/, 'configure #19');

// nothing downstream has to finish the resolving. the version request goes to the resolver as given,
// and what comes back is what the bundle names are built from
const resolved = resolve({ scope: ['es.array.at'], version: 'package.json' });

strictEqual(resolved.config.versions.asked, 'package.json', 'configure-2 #1');
strictEqual(resolved.config.minify, true, 'configure-2 #2');
ok(Object.isFrozen(resolved.config.scope), 'configure-2 #3');
strictEqual(resolved.config.targets, null, 'configure-2 #4');

// a declaration in any shape comes out as one object the compat parser can read, carrying the
// browserslist lookup with it - a query string loses `configPath` otherwise
deepStrictEqual(resolve({ scope: [], targets: { chrome: '110' }, configPath: '/app' }).config.targets,
  { chrome: '110', configPath: '/app', ignoreBrowserslistConfig: false }, 'configure #3');
deepStrictEqual(resolve({ scope: [], targets: 'last 2 versions', browserslistEnv: 'production' }).config.targets,
  { browsers: 'last 2 versions', browserslistEnv: 'production', ignoreBrowserslistConfig: false }, 'configure #4');

// the route is pasted in front of `/<id>.js`, so trailing slashes are stripped down to the empty
// string: a route of `'/'` would otherwise produce `//<id>.js`, a protocol-relative URL that sends
// the browser to a HOST named after the bundle instead of to us
strictEqual(resolve({ scope: [], route: '/' }).config.route, '', 'configure #8');
strictEqual(resolve({ scope: [], route: '//' }).config.route, '', 'configure #9');
strictEqual(resolve({ scope: [], route: '/a/b/' }).config.route, '/a/b', 'configure #10');
strictEqual(resolve({ scope: [] }).config.route, '/__core-js', 'configure #11');
throws(() => resolve({ scope: [], route: 'core-js' }), /`route`/, 'configure #12');

// with no declaration the project browserslist config becomes one, and it is resolved HERE:
// compat left to find it on its own would find it while building the baseline alone, leaving a
// baseline narrower than the plan around it
const directory = await mkdtemp(join(tmpdir(), 'core-js-service-'));

try {
  await writeFile(join(directory, '.browserslistrc'), 'chrome 100\n');

  deepStrictEqual(resolve({ scope: [], configPath: directory }).config.targets, { chrome: '100' },
    'configure #5');
  strictEqual(resolve({ scope: [], configPath: directory, ignoreBrowserslistConfig: true }).config.targets,
    null, 'configure #6');
  // an explicit declaration wins over the config, and says so by carrying the lookup along
  strictEqual(resolve({ scope: [], targets: { chrome: '110' }, configPath: directory }).config.targets.chrome,
    '110', 'configure #7');
} finally {
  try {
    await rm(directory, { force: true, recursive: true });
  } catch (error) {
    // a leftover temporary directory cannot break a run; a failure to remove it must not speak for
    // the assertions above
    console.warn(`could not remove ${ directory }: ${ error.message }`);
  }
}

// which representations are stored is a whole setting, not a brotli switch: what it names is what
// the store writes, what `bundles.encodings` reports and what a client can be answered with. every
// encoding is resolved to the same shape - its compressor options - so nothing downstream branches
deepStrictEqual(resolve({ scope: [] }).config.compression, { identity: {}, gzip: {} }, 'configure-4 #1');
deepStrictEqual(resolve({ scope: [], compression: { identity: true, gzip: { level: 9 }, br: true } }).config.compression,
  { identity: {}, gzip: { level: 9 }, br: {} }, 'configure-4 #2');
// `false` drops an encoding rather than storing it disabled
deepStrictEqual(resolve({ scope: [], compression: { identity: true, gzip: false } }).config.compression,
  { identity: {} }, 'configure-4 #3');
// the settings are frozen, like the rest of what the plan is built from
ok(Object.isFrozen(resolve({ scope: [] }).config.compression), 'configure-4 #4');

// a typo in an encoding name is a store that quietly holds less than asked
throws(() => resolve({ scope: [], compression: { gzpi: true } }), /`compression.gzpi`/, 'configure-4 #5');
throws(() => resolve({ scope: [], compression: [] }), /`compression`/, 'configure-4 #6');
throws(() => resolve({ scope: [], compression: null }), /`compression`/, 'configure-4 #7');
// nothing to store is one 406 per request, so it is refused at startup
throws(() => resolve({ scope: [], compression: {} }), /at least one encoding/, 'configure-4 #8');
throws(() => resolve({ scope: [], compression: { identity: false, gzip: false } }), /at least one encoding/,
  'configure-4 #9');
// the uncompressed form is the bytes themselves - there is nothing to configure about it
throws(() => resolve({ scope: [], compression: { identity: { level: 9 } } }), /`compression.identity`/,
  'configure-4 #10');
throws(() => resolve({ scope: [], compression: { gzip: 9 } }), /`compression.gzip`/, 'configure-4 #11');
