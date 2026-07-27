'use strict';
// Karma config for the e2e-libs IE11 leg. Mirrors tests/unit-karma/karma.conf.js but trimmed to the
// only target that matters here: real IE11. No Chromium/Firefox/WebKit (and so no Playwright dep) —
// modern engines are already covered by artifacts.mjs's node pre-flight. This leg runs the full runtime
// matrix (every library × method × unplugin phase) on real IE11, where a usage-pure detection miss
// cannot hide; karma-bundles.mjs invokes it once per bundle (one page per cell, so nothing is
// co-loaded) — see README.
//
// QUnit is the same karma-qunit@4 / qunit@2 stack the unit-karma job already runs green in IE11.
// The bundles come in via `-f=` (absolute paths, comma-separated): each is a self-contained UMD from
// runtimeBuild with a QUnit driver appended (see karma-bundles.mjs / harness.mjs).
const { sync: which } = require('which');

const customLaunchers = {
  IE_NFM: {
    base: 'IE',
    // prevents crash on launch of multiple IE11 instances
    flags: ['-noframemerging'],
  },
};

// IE only, and only where it exists: on the windows CI runner (CI set) or a dev box with iexplore.
// karma-bundles.mjs makes the same check before starting Karma, so this list is never empty here.
const browsers = [];
if (process.env.CI || which('iexplore.exe', { nothrow: true })) browsers.push('IE_NFM');

module.exports = config => config.set({
  plugins: ['karma-*'],
  files: process.argv.find(it => it.startsWith('-f=')).slice(3).split(','),
  frameworks: ['qunit'],
  basePath: '.',
  customLaunchers,
  browsers,
  // a green QUnit run is otherwise near-silent (just "Executed N of N"). Forward each bundle's
  // console.log — the "[e2e-libs] <lib>/<method>/<phase>: N/N checks passed in this IE11" line the
  // driver prints — to the CI terminal, so the log states what actually ran, not just bundle counts.
  client: { captureConsole: true },
  browserConsoleLogOptions: { terminal: true, level: 'log' },
  logLevel: config.LOG_INFO,
  singleRun: true,
});
