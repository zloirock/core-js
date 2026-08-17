// How this suite says what went wrong. Five surfaces report a failure - the raw tier, the gating
// tier, the reporting tier and the two harness targets on the page - and which one a failure reaches
// may not decide whether it names a reason; the two tiers that compare checks share the line for a
// failing one as well.
//
// No dependencies: the raw tier is the fast one and may not pull in rollup, Babel and esbuild to print
// a line, and the page needs the ES5 twin below as TEXT rather than as a callable.

const REASON_MAX = 200; // a line or two; long enough for a named error and the message after it
// A frame is `at <site>` carrying a POSITION - `file:line:col`, which is what node prints and what
// zx's own frame has. Without that requirement the words "at least one ..." read as a frame and are
// dropped, and a child whose whole reason opened that way would be reported as having given none.
const STACK_FRAME = /^at\s.*:\d+:\d+\)?$/;
const ZX_FOOTER = /^(?:exit code|signal):/;

// Turn an unknown throwable into one console-width line.
//
// Child-process failures are read off `stderr` first: zx builds `message` from that same stderr with
// its own call site and the exit code appended, so stderr is the shorter road to the same text. What
// neither may contribute is a STACK FRAME. node prints the offending `file:line` before the actual
// `TypeError: ...`, and zx's frame names the `$` call inside this runner - so a child that died with
// nothing on stderr, killed by a timeout or a signal, would otherwise be reported as the runner's own
// source line, with the exit code and the signal one line further down and dropped.
export function errorReason(err) {
  // each source is tried for CONTENT, not for truthiness: a child whose stderr is a lone newline
  // would otherwise win the `||` chain and reduce the whole line to `FAIL <label>: `. The default
  // `[object Object]` is skipped on the same ground - it is a stringification, not a reason
  for (const source of [err?.stderr, err?.message, err]) {
    // a throwable that cannot be stringified is still a throwable: `Object.create(null)` and anything
    // with a throwing `toString` reach here from a rejected promise, and this function runs INSIDE the
    // `catch` that reports a cell - a throw of its own takes the run down with the reason unprinted
    let text;
    try {
      text = String(source ?? '');
    } catch { continue; }
    if (text === '[object Object]') continue;
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean).filter(l => !STACK_FRAME.test(l));
    if (!lines.length) continue;
    const named = lines.find(l => /^\w*(?:Error|Exception)\b/.test(l));
    if (named) return named.slice(0, REASON_MAX);
    // what zx leaves once its frame is gone is `exit code: N` and, for a killed child, `signal: SIG`.
    // The signal is the half that says WHY it stopped, so a child that died without a word reports
    // both - and BESIDE whatever it did say, never instead of it: zx appends that footer to the
    // child's own output, so returning the footer alone drops the sentence the reader came for
    const footer = lines.filter(l => ZX_FOOTER.test(l));
    const said = lines.find(l => !ZX_FOOTER.test(l));
    return [said, ...footer].filter(Boolean).join(', ').slice(0, REASON_MAX);
  }
  // nothing said anything - still name what failed rather than print an empty reason
  return [err?.name, err?.exitCode === undefined ? null : `exit ${ err.exitCode }`].filter(Boolean).join(', ')
    || 'failed without a message';
}

// Removing what a run left behind, in the shape `tests/AGENTS.md` requires of every suite: reported,
// never thrown. Every cleanup that runs while a cell holds a verdict goes through it - the two temp
// files a cell writes, and the sweep that runs before the first cell and so has no cell to blame at
// all. The wipes that stand outside every verdict remove directly instead - `artifacts/` or the
// libraries a filtered run rebuilds, a manifest refused before the first cell, this run's own Karma
// directory, an orphan baseline - and there a removal that fails has to stop the run: each of them is
// output a later step reads back.
export async function discard(remove, what) {
  try {
    await remove();
  } catch (err) {
    echo(chalk.yellow(`  could not remove ${ chalk.cyan(what) } - ${ errorReason(err) } (left behind on purpose)`));
  }
}

// What `JSON.stringify` cannot say and `exercises/checks.mjs` keeps apart: NaN and the infinities
// become `null`, and `undefined`, a function and a symbol become `null` inside an array or vanish
// from an object. Every one of them compares UNEQUAL to `null` there, so rendering them as it would
// describe the failure as the one shape the comparison exists to distinguish. `-0` is not in the set:
// `eq` holds it equal to `0`, so rendering both as `0` says exactly what the comparison saw.
//
// The pre-flight child applies the same rule, spelled again there because it runs in `node -e` with
// nothing imported: see `PREFLIGHT` in runtime.mjs.
function jsonLossyAsText(key, value) {
  if (typeof value === 'number' && !isFinite(value)) return String(value);
  if (value === undefined || typeof value === 'symbol') return String(value);
  return typeof value === 'function' ? `[function ${ value.name || 'anonymous' }]` : value;
}

// A check's two sides, rendered. `JSON.stringify` throws on a circular structure, and a circular
// structure is a LEGAL value here - `actual` is whatever the library handed back, and a DOM node
// knows its parent - so a value that cannot be rendered may cost its own line and nothing more.
// Printing it raw is not the fallback: `[object Object]` for both sides would read as a match.
export function renderValue(value) {
  // through the replacer above, nested as well as at the top: almost every check in this suite
  // compares a tuple, so a NaN from a broken `Math.sign` and the `undefined` an optional-chained
  // guard produces both reach the reader from INSIDE one
  if (typeof value === 'number' && !isFinite(value)) return String(value);
  try {
    return JSON.stringify(value, jsonLossyAsText) ?? String(value);
  } catch {
    return `<unrenderable ${ Object.prototype.toString.call(value) }>`;
  }
}

// The one line a failing check gets, on every surface that reports one. BOTH sides: `checker()` keeps
// them for exactly this, and a lone `actual` leaves the reader to find the expectation in the fixture
// - for a failure that, in this suite, often reproduces only on the CI windows runner.
export function checkFailureLine(check) {
  return `${ check.label } actual=${ renderValue(check.actual) } expected=${ renderValue(check.expected) }`;
}

// The same policy as `errorReason`, for the page, as ES5 TEXT rather than as a callable. Only the
// policy carries over: the page has no stderr and no line to trim to. `[object Object]` is skipped
// here too - a rejected promise in the browser leg carries whatever the library threw, and the
// stringification of an object is not a reason.
//
// It calls nothing the bundle under test can replace - `String` and property reads only. A harness
// computing its verdict with a polyfilled method would be measuring itself.
export const ES5_REASON_SOURCE = `
    function e2eReason(err) {
      if (err && err.message) return String(err.message);
      var text;
      // guarded like the module twin above: a throwable that cannot be stringified is still a
      // throwable, and this runs on the path that reports one. On the banner target the page is
      // already latched settled by then, so a throw here leaves it on "running..." for good
      try {
        text = String(err);
      } catch (stringifyFailed) {
        return err && err.name ? String(err.name) : 'failed without a message';
      }
      if (text !== '[object Object]') return text;
      return err && err.name ? String(err.name) : 'failed without a message';
    }
`;
