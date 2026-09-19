// The matrix both bundler suites drive: the injection methods, the phases each one supports, and the
// options that select them. It has no dependencies of its own, so `tests/e2e-libs` imports it across
// the directory boundary without installing anything from here.
//
// Spelled out rather than read off the plugin's own option validation: a suite that derives the axis
// it covers from the code under test stops covering whatever that code drops.

export const METHODS = ['entry-global', 'usage-global', 'usage-pure'];
// The two things that inject, and the phases the one with a phase axis has. `tests/e2e-libs` crosses
// both axes and takes both from here; this suite names the two providers at its one `phasesFor` call,
// where `checkAxis` turns a typo into an error. That check is the point: `provider === 'babel-plugin'`
// has a false side that means "everything else", so an unchecked name lands there and builds and runs
// as unplugin under a cell label carrying the typo.
export const PROVIDERS = ['babel-plugin', 'unplugin'];
export const PHASES = ['pre', 'post', 'pre+post'];

// An axis owns its vocabulary: a value this matrix does not cover is a mistake to report, never a
// branch to fall out of. Silence here is expensive - the run stays GREEN and covers something other
// than what its labels say, which is the one failure a test suite must not have.
function checkAxis(axis, value, covered) {
  if (!covered.includes(value)) {
    throw new Error(`unknown ${ axis } '${ value }' - this matrix covers ${ covered.join(', ') }`);
  }
}

// `undefined` means "this pair has no phase axis", which is a real answer rather than a missing one
export function isPhase(value) {
  return value === undefined || PHASES.includes(value);
}

// `entry-global` carries no phase for either provider - it expands `import 'core-js'`, so its set is
// a function of `targets`/`version`/`mode` alone - and `@core-js/babel-plugin` runs inside the Babel
// pass, so it has none for any method.
export function phasesFor(method, provider = 'unplugin') {
  checkAxis('method', method, METHODS);
  checkAxis('provider', provider, PROVIDERS);
  return provider === 'babel-plugin' || method === 'entry-global' ? [undefined] : PHASES;
}

// `targets` is the caller's: this suite passes none on purpose, e2e-libs is about IE11. Everything
// else is identical by intent - two suites that pin different core-js versions would be measuring
// different libraries and calling the difference a plugin change.
//
// `'node_modules'` is the provider's own way of saying "whatever core-js is installed", which here is
// the workspace one both suites bundle. A literal minor would go stale silently: bump the runtime and
// the suites keep asking for the older module set, every gate stays green, and nothing covers what
// the bump added.
export function pluginOpts(method, phase, extra) {
  checkAxis('method', method, METHODS);
  // without this an unrecognised phase splits two ways, and only one of them is loud: a falsy one is
  // dropped by the `&&` below and lands on the plugin's own default `pre` - the weakest phase, and
  // the one cell e2e-libs deliberately does not gate - so the typo becomes a green cell measuring
  // something other than what its label says, while a truthy one gets the plugin's own message,
  // which names an option rather than the axis this file owns
  if (!isPhase(phase)) throw new Error(`unknown phase '${ phase }' - this matrix covers ${ PHASES.join(', ') }`);
  return { method, version: 'node_modules', mode: 'full', ...extra, ...phase && { phase } };
}
