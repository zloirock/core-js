import plugin = require('@core-js/babel-plugin');

// valid calls
plugin({}, { method: 'usage-global' }, '/path');
plugin({}, { method: 'usage-pure' }, '/path');
plugin({}, { method: 'entry-global' }, '/path');

plugin({}, { method: 'usage-global', version: '4.0' }, '/path');
plugin({}, { method: 'usage-global', mode: 'actual' }, '/path');
plugin({}, { method: 'usage-global', mode: 'es' }, '/path');
plugin({}, { method: 'usage-global', mode: 'stable' }, '/path');
plugin({}, { method: 'usage-global', mode: 'full' }, '/path');

plugin({}, { method: 'usage-global', pkg: 'core-js' }, '/path');
plugin({}, { method: 'usage-pure', pkg: '@core-js/pure' }, '/path');
plugin({}, { method: 'usage-global', pkgs: ['my-core-js'] }, '/path');

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
plugin({}, { method: 'usage-global', shouldInjectPolyfill: (name, shouldInject) => shouldInject }, '/path');
plugin({}, { method: 'usage-global', absoluteImports: true }, '/path');
plugin({}, { method: 'usage-global', absoluteImports: '/absolute/path' }, '/path');
plugin({}, { method: 'usage-global', configPath: '.' }, '/path');
plugin({}, { method: 'usage-global', ignoreBrowserslistConfig: true }, '/path');

// all options
plugin({}, {
  method: 'usage-global',
  version: '4.0',
  mode: 'actual',
  targets: {
    chrome: '80',
    node: 'current',
    browsers: ['> 1%'],
    esmodules: true,
  },
  include: ['es.array.push'],
  exclude: [/^web\./],
  debug: true,
  absoluteImports: false,
  configPath: '.',
  ignoreBrowserslistConfig: false,
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
// @ts-expect-error — pkg must be a string
plugin({}, { method: 'usage-global', pkg: 123 }, '/path');
// @ts-expect-error — pkgs must be a string array
plugin({}, { method: 'usage-global', pkgs: [123] }, '/path');
