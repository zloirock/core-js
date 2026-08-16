'use strict';
// QUnit's TAP reporter prints a line per PASSING test - hundreds to over a thousand per bundle, and
// the runners here start several qunit processes at once, so those lines interleave on top of that.
// what stays is failures, bail-outs and the counts, skipped tests as a number rather than by name;
// what is left is deliberately not valid TAP, and nothing here parses this stream
const NOISE = /^(?:ok \d+|TAP version)/;

// a timer still armed when the run ends holds node alive for its whole remaining delay, so a
// fallback timeout left undisarmed on the path that wins turns the tail of every run into
// idling - and the cost is the fallback's own delay, not the suite's. only node pays for it:
// a browser page never has to exit, so the karma legs stay silent about the same leak
function reportArmedTimers() {
  // the bun leg shares this reporter and runs the qunit cli on whatever node is on PATH,
  // which is not necessarily one that has this
  if (typeof process.getActiveResourcesInfo != 'function') return;
  const armed = process.getActiveResourcesInfo().filter(type => type === 'Timeout').length;
  if (!armed) return;
  process.stdout.write(`# ${ armed } timer(s) still armed after the run - a fallback timeout ` +
    'is not disarmed on its winning path; find it with an async_hooks Timeout trace\n');
  // the qunit cli sets the exit code from its own `runEnd` listener, registered after this
  // one, so a verdict claimed here would be overwritten by its clean-run zero
  process.on('exit', () => {
    process.exitCode = 1;
  });
}

module.exports = {
  init(runner) {
    const reporter = runner.reporters.tap.init(runner, {
      log(line) {
        if (!NOISE.test(line)) process.stdout.write(`${ line }\n`);
      },
    });
    // after the tap init, so the counts print before the verdict
    runner.on('runEnd', reportArmedTimers);
    return reporter;
  },
};
