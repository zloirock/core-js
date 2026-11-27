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
const PHASES = ['pre', 'post', 'pre+post'];

// An axis owns its vocabulary: a value this matrix does not cover is a mistake to report, never a
// branch to fall out of. Silence here is expensive - the run stays GREEN and covers something other
// than what its labels say, which is the one failure a test suite must not have.
function checkAxis(axis, value, covered) {
  if (!covered.includes(value)) {
    throw new Error(`unknown ${ axis } '${ value }' - this matrix covers ${ covered.join(', ') }`);
  }
}

// `undefined` means "this pair has no phase axis", which is a real answer rather than a missing one
function isPhase(value) {
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

// `targets` is the caller's: transpiler-integration hands every builder the same explicit IE11 list,
// e2e-libs states the floor its own way. Everything
// else is identical by intent - two suites that pin different core-js versions would be measuring
// different libraries and calling the difference a plugin change.
//
// `'node_modules'` is the provider's own way of saying "whatever core-js is installed", which here is
// the workspace one both suites bundle. A literal minor would go stale silently: bump the runtime and
// the suites keep asking for the older module set, every gate stays green, and nothing covers what
// the bump added.
export function pluginOpts(method, phase, extra) {
  checkAxis('method', method, METHODS);
  // A falsy invalid phase would silently select the plugin's default pre phase and
  // mislabel the result. This matters in e2e-libs, where a stripped-realm exercise
  // exception in pre is diagnostic. Reject invalid values at the shared matrix boundary.
  if (!isPhase(phase)) throw new Error(`unknown phase '${ phase }' - this matrix covers ${ PHASES.join(', ') }`);
  return { method, version: 'node_modules', mode: 'full', ...extra, ...phase && { phase } };
}
