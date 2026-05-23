import plugin from '@core-js/babel-plugin';
import type { Options, Method, Mode, Targets } from '@core-js/babel-plugin';

// return type
const result: { name: string, visitor: object } = plugin({}, { method: 'usage-global' }, '/path');
result.name;
result.visitor;

// type exports
const method: Method = 'usage-global';
const mode: Mode = 'actual';
const opts: Options = { method: 'usage-global' };
const targets: Targets = { chrome: '80', firefox: 72 };
const targetsQuery: Targets = '> 1%';
const targetsList: Targets = ['defaults', 'not IE 11'];
const targetsEsm: Targets = { esmodules: true };
plugin({}, { method: 'usage-global', targets }, '/path');
plugin({}, { method: 'usage-global', targets: targetsQuery }, '/path');
plugin({}, { method: 'usage-global', targets: targetsList }, '/path');
plugin({}, { method: 'usage-global', targets: targetsEsm }, '/path');

// `null` accepted on all optional fields (mirrors the runtime conditional-spread idiom)
plugin({}, {
  method: 'usage-global',
  version: null,
  mode: null,
  package: null,
  additionalPackages: null,
  targets: null,
  include: null,
  exclude: null,
  debug: null,
  shouldInjectPolyfill: null,
  absoluteImports: null,
  configPath: null,
  browserslistEnv: null,
  ignoreBrowserslistConfig: null,
  shippedProposals: null,
  importStyle: null,
}, '/path');

// readonly arrays accepted for additionalPackages / include / exclude (`as const` idiom)
const additionalPkgsConst = ['@x/y'] as const;
const includeConst = ['es.array.push'] as const;
const excludeConst = [/^web\./] as const;
plugin({}, {
  method: 'usage-global',
  additionalPackages: additionalPkgsConst,
  include: includeConst,
  exclude: excludeConst,
}, '/path');

// valid calls
plugin({}, { method: 'usage-global' }, '/path');
plugin({}, { method: 'usage-pure' }, '/path');
plugin({}, { method: 'entry-global' }, '/path');

plugin({}, { method: 'usage-global', version: '4.0' }, '/path');
plugin({}, { method: 'usage-global', version: 'node_modules' }, '/path');
plugin({}, { method: 'usage-global', version: 'package.json' }, '/path');
plugin({}, { method: 'usage-global', mode: 'actual' }, '/path');
plugin({}, { method: 'usage-global', mode: 'es' }, '/path');
plugin({}, { method: 'usage-global', mode: 'stable' }, '/path');
plugin({}, { method: 'usage-global', mode: 'full' }, '/path');

plugin({}, { method: 'usage-global', package: 'core-js' }, '/path');
plugin({}, { method: 'usage-pure', package: '@core-js/pure' }, '/path');
plugin({}, { method: 'usage-global', additionalPackages: ['my-core-js'] }, '/path');

plugin({}, { method: 'usage-global', targets: { chrome: '80' } }, '/path');
plugin({}, { method: 'usage-global', targets: { chrome: '80', firefox: 72 } }, '/path');
plugin({}, { method: 'usage-global', targets: '> 1%' }, '/path');
plugin({}, { method: 'usage-global', targets: ['defaults', 'not IE 11'] }, '/path');
plugin({}, { method: 'usage-global', targets: { browsers: ['> 1%'] } }, '/path');
plugin({}, { method: 'usage-global', targets: { esmodules: true } }, '/path');
plugin({}, { method: 'usage-global', targets: { node: 'current', browsers: { chrome: '80' } } }, '/path');

plugin({}, { method: 'usage-global', include: ['es.array.push'] }, '/path');
plugin({}, { method: 'usage-global', include: ['es.array.push', /^es\.promise\./] }, '/path');
plugin({}, { method: 'usage-global', exclude: [/^es\.array\./] }, '/path');

plugin({}, { method: 'usage-global', debug: true }, '/path');
plugin({}, { method: 'usage-global', debug: false }, '/path');
plugin({}, { method: 'usage-global', shouldInjectPolyfill: (name, shouldInject) => shouldInject }, '/path');
plugin({}, { method: 'usage-global', shouldInjectPolyfill: (_name: string, _default: boolean) => true }, '/path');
plugin({}, { method: 'usage-global', absoluteImports: true }, '/path');
plugin({}, { method: 'usage-global', absoluteImports: false }, '/path');
plugin({}, { method: 'usage-global', configPath: '.' }, '/path');
plugin({}, { method: 'usage-global', ignoreBrowserslistConfig: true }, '/path');
plugin({}, { method: 'usage-global', ignoreBrowserslistConfig: false }, '/path');
plugin({}, { method: 'usage-global', shippedProposals: true }, '/path');
plugin({}, { method: 'usage-global', shippedProposals: false }, '/path');
plugin({}, { method: 'usage-global', importStyle: 'import' }, '/path');
plugin({}, { method: 'usage-global', importStyle: 'require' }, '/path');
plugin({}, { method: 'usage-global', browserslistEnv: 'production' }, '/path');

// all options combined
plugin({}, {
  method: 'usage-global',
  version: '4.0',
  mode: 'actual',
  package: 'my-core-js',
  additionalPackages: ['@x/y'],
  targets: {
    chrome: '80',
    node: 'current',
    browsers: ['> 1%'],
    esmodules: true,
  },
  include: ['es.array.push'],
  exclude: [/^web\./],
  debug: true,
  shouldInjectPolyfill: (name, shouldInject) => shouldInject,
  absoluteImports: false,
  configPath: '.',
  shippedProposals: true,
  importStyle: 'import',
}, '/path');

// all targets
plugin({}, {
  method: 'usage-global',
  targets: {
    android: 1,
    bun: '1',
    chrome: 1,
    'chrome-android': '1',
    deno: 1,
    edge: '1',
    electron: 1,
    firefox: '1',
    'firefox-android': 1,
    hermes: '1',
    ie: 1,
    ios: '1',
    opera: 1,
    'opera-android': '1',
    quest: '1',
    'react-native': 1,
    rhino: '1',
    safari: 1,
    samsung: '1',
    node: 'current',
    esmodules: true,
    browsers: ['> 1%'],
  },
}, '/path');

// @ts-expect-error — method is required
plugin({}, {}, '/path');
// @ts-expect-error — invalid method
plugin({}, { method: 'invalid' }, '/path');
// @ts-expect-error — invalid mode
plugin({}, { method: 'usage-global', mode: 'invalid' }, '/path');
// @ts-expect-error — targets must not be a number
plugin({}, { method: 'usage-global', targets: 123 }, '/path');
// @ts-expect-error — version must be a string
plugin({}, { method: 'usage-global', version: 4 }, '/path');
// @ts-expect-error — debug must be a boolean
plugin({}, { method: 'usage-global', debug: 'yes' }, '/path');
// @ts-expect-error — package must be a string
plugin({}, { method: 'usage-global', package: 123 }, '/path');
// @ts-expect-error — additionalPackages must be a string array
plugin({}, { method: 'usage-global', additionalPackages: [123] }, '/path');
// @ts-expect-error — include must be an array
plugin({}, { method: 'usage-global', include: 'es.array.push' }, '/path');
// @ts-expect-error — exclude must be an array
plugin({}, { method: 'usage-global', exclude: 123 }, '/path');
// @ts-expect-error — shouldInjectPolyfill must be a function
plugin({}, { method: 'usage-global', shouldInjectPolyfill: true }, '/path');
// @ts-expect-error — absoluteImports must be a boolean
plugin({}, { method: 'usage-global', absoluteImports: 123 }, '/path');
// @ts-expect-error — absoluteImports must be a boolean
plugin({}, { method: 'usage-global', absoluteImports: '/absolute/path' }, '/path');
// @ts-expect-error — configPath must be a string
plugin({}, { method: 'usage-global', configPath: 123 }, '/path');
// @ts-expect-error — configPath must be a string
plugin({}, { method: 'usage-global', configPath: 123 }, '/path');
// @ts-expect-error — shippedProposals must be a boolean
plugin({}, { method: 'usage-global', shippedProposals: 'yes' }, '/path');
// @ts-expect-error — importStyle must be 'import' or 'require'
plugin({}, { method: 'usage-global', importStyle: 'esm' }, '/path');
// @ts-expect-error — browserslistEnv must be a string
plugin({}, { method: 'usage-global', browserslistEnv: 1 }, '/path');
