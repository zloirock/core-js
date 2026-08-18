'use strict';
// The e2e-libs IE11 leg, after tests/karma/karma.conf.js but with only that target - modern
// engines are covered by runtime.mjs's node pre-flight, so no Playwright dep either.
//
// ONE bundle via `-f=`, relative to this directory: a UMD from runtimeBuild with a QUnit driver
// appended. One per page is the isolation rule in AGENTS.md, hence no way to spell a second.
//
// The launcher is unconditional: runtime.mjs decides where IE11 exists, and a second check here would
// run in a process holding none of its state.
const customLaunchers = {
  IE_NFM: {
    base: 'IE',
    // prevents crash on launch of multiple IE11 instances
    flags: ['-noframemerging'],
  },
};

// Named here rather than inlined below: without it the `.slice` of `undefined` is the whole error
// message, and this config is normally started by runtime.mjs rather than by hand.
const bundle = process.argv.find(arg => arg.startsWith('-f='));
if (!bundle) throw new Error('karma.conf.cjs needs the bundle to load: karma start karma.conf.cjs -f=<file>');

module.exports = config => config.set({
  plugins: ['karma-*'],
  files: [bundle.slice(3)],
  frameworks: ['qunit'],
  basePath: '.',
  customLaunchers,
  browsers: ['IE_NFM'],
  // a green QUnit run is otherwise near-silent (just "Executed N of N"), and the line that says what
  // actually ran - "[e2e-libs] <lib>/<provider>/<method>[/<phase>]: N/N checks passed in this IE11",
  // printed by the driver - reaches the terminal on karma's own defaults. Only the level is set
  // here, and it narrows them: `debug` would carry the client's chatter into a forty-page log.
  // Partial by design - `config.set` deep-merges, so `format` and `terminal` stay as they are
  browserConsoleLogOptions: { level: 'log' },
  logLevel: config.LOG_INFO,
  // karma's own default today, spelled out because the number is not free to move: harness.mjs
  // orders its QUnit timeout UNDER it, so that a `run()` which never settles is reported as a
  // timed-out test - the shape that names a broken `Promise` polyfill - and not as a disconnected
  // browser
  browserNoActivityTimeout: 30_000,
  // karma's own defaults again, spelled out for the same reason: `runtime.mjs`'s deadline has to sit
  // above the whole capture ladder - one attempt plus `retryLimit` retries, each bounded by
  // `captureTimeout` - so neither number is free to move without moving that one. Nor are they all of
  // what sits under it: karma's own kill and disconnect grace and the run window above add to the
  // ladder, so the margin is thinner than the difference of these two numbers. Lowered they would fit
  // more easily, at the cost of the flaky IE11 captures this leg is full of; the unit leg beside it
  // raises both instead
  captureTimeout: 60_000,
  retryLimit: 2,
  singleRun: true,
});
