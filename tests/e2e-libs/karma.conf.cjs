'use strict';
// Karma config for the e2e-libs IE11 leg. Mirrors tests/unit-karma/karma.conf.js but trimmed to the
// only target that matters here: real IE11. No Chromium/Firefox/WebKit (and so no Playwright dep) -
// modern engines are already covered by runtime.mjs's node pre-flight. This leg runs the full runtime
// matrix (every library x method x unplugin phase) on real IE11, where a usage-pure detection miss
// cannot hide; runtime.mjs invokes it once per bundle (one page per cell, so nothing is
// co-loaded) - see AGENTS.md.
//
// QUnit is the same karma-qunit@4 / qunit@2 stack the unit-karma job already runs green in IE11.
// ONE bundle comes in via `-f=`, a path relative to this directory: a self-contained UMD from
// runtimeBuild with a QUnit driver appended (see runtime.mjs / harness.mjs). One per page is a
// requirement rather than a convenience - see the isolation rule in AGENTS.md - so this takes a
// single path and has no way to spell a second.
//
// IE is the only launcher, and it is unconditional: runtime.mjs starts Karma only where IE11 exists,
// so a second check here would run in a process with none of its state and could only disagree.
const customLaunchers = {
  IE_NFM: {
    base: 'IE',
    // prevents crash on launch of multiple IE11 instances
    flags: ['-noframemerging'],
  },
};

// Named here rather than inlined below: without it the `.slice` of `undefined` is the whole error
// message, and this config is normally started by runtime.mjs rather than by hand.
const bundle = process.argv.find(it => it.startsWith('-f='));
if (!bundle) throw new Error('karma.conf.cjs needs the bundle to load: karma start karma.conf.cjs -f=<file>');

module.exports = config => config.set({
  plugins: ['karma-*'],
  files: [bundle.slice(3)],
  frameworks: ['qunit'],
  basePath: '.',
  customLaunchers,
  browsers: ['IE_NFM'],
  // a green QUnit run is otherwise near-silent (just "Executed N of N"). Forward each bundle's
  // console.log - the "[e2e-libs] <lib>/<provider>/<method>[/<phase>]: N/N checks passed in this
  // IE11" line the driver prints - to the CI terminal, so the log states what actually ran rather
  // than how many bundles there were.
  client: { captureConsole: true },
  browserConsoleLogOptions: { terminal: true, level: 'log' },
  logLevel: config.LOG_INFO,
  // pinned rather than left to karma's default, because harness.mjs orders its own QUnit timeout
  // UNDER this number: a `run()` that never settles has to be reported as a timed-out test - the
  // shape that names a broken `Promise` polyfill - and not as a disconnected browser
  browserNoActivityTimeout: 30_000,
  singleRun: true,
});
