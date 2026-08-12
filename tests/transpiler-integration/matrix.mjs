// The matrix both bundler suites drive: the injection methods, the phases each one supports, and the
// options that select them. It has no dependencies of its own, so `tests/e2e-libs` imports it across
// the directory boundary without installing anything from here.
//
// Spelled out rather than read off the plugin's own option validation: a suite that derives the axis
// it covers from the code under test stops covering whatever that code drops.

export const METHODS = ['entry-global', 'usage-global', 'usage-pure'];

// `entry-global` carries no phase for either provider - it expands `import 'core-js'`, so its set is
// a function of `targets`/`version`/`mode` alone - and `@core-js/babel-plugin` runs inside the Babel
// pass, so it has none for any method.
export function phasesFor(method, provider = 'unplugin') {
  return provider === 'babel-plugin' || method === 'entry-global' ? [undefined] : ['pre', 'post', 'pre+post'];
}

// `targets` is the caller's: this suite passes none on purpose, e2e-libs is about IE11. Everything
// else is identical by intent - two suites that pin different core-js versions would be measuring
// different libraries and calling the difference a plugin change.
export function pluginOpts(method, phase, extra) {
  return { method, version: '4.0', mode: 'full', ...extra, ...phase && { phase } };
}
