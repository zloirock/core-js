'use strict';
// Karma config for the e2e-libs IE11 leg. Mirrors tests/unit-karma/karma.conf.js but trimmed to the
// only target that matters here: real IE11. No Chromium/Firefox/WebKit (and so no Playwright dep) -
// modern engines are already covered by runtime.mjs's node pre-flight. This leg runs the full runtime
// matrix (every library x method x unplugin phase) on real IE11, where a usage-pure detection miss
// cannot hide; runtime.mjs invokes it once per bundle (one page per cell, so nothing is
// co-loaded) - see AGENTS.md.
//
// QUnit is the same karma-qunit@4 / qunit@2 stack the unit-karma job already runs green in IE11.
// The bundles come in via `-f=` (paths relative to this directory, comma-separated): each is a
// self-contained UMD from runtimeBuild with a QUnit driver appended (see runtime.mjs / harness.mjs).
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
const files = process.argv.find(it => it.startsWith('-f='));
if (!files) throw new Error('karma.conf.cjs needs the bundles to load: karma start karma.conf.cjs -f=<file>[,<file>...]');

module.exports = config => config.set({
  plugins: ['karma-*'],
  files: files.slice(3).split(','),
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
  singleRun: true,
});
