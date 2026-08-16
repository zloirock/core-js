'use strict';
// QUnit's TAP reporter prints a line per PASSING test - hundreds to over a thousand per bundle, and
// the runners here start several qunit processes at once, so those lines interleave on top of that.
// what stays is failures, bail-outs and the counts, skipped tests as a number rather than by name;
// what is left is deliberately not valid TAP, and nothing here parses this stream
const NOISE = /^(?:ok \d+|TAP version)/;

module.exports = {
  init(runner) {
    return runner.reporters.tap.init(runner, {
      log(line) {
        if (!NOISE.test(line)) process.stdout.write(`${ line }\n`);
      },
    });
  },
};
