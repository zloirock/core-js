// What "deep-checked" means, in one place. Three legs can abstain on a given snippet - the pure
// stripped realm, the AST print-through, the usage-global stripped realm - and each one is allowed
// to abstain only for the reasons listed here. The shard records exactly one outcome per snippet per
// leg; the coordinator then requires checked + skipped to equal the corpus.
//
// The equation is EXACT rather than a mere floor: a printed count nothing reads cannot tell a leg
// that abstained for a stated reason from a leg that stopped checking. An unnamed outcome is a
// throw, not a smaller number.
//
// The equation ALONE is not enough, because it is scale-free: it holds just as well at
// `checked: 0` with the whole corpus under a reason the leg declares, which is exactly what a leg
// that stopped checking produces. All three legs can be switched off at once and the run stays
// green - and gets three times faster. So each leg also declares the SHARE of the corpus it must
// deep-check; below that it stopped checking rather than abstained.
//
// The reasons, per leg:
// - `transform-crash` - an emitter threw, so there is no output to run (already a loud failure)
// - `not-strip-family` - the generator does not assert that this shape must inject
// - `native-throw` - the native reference is an error key, so the comparison would be ERR == ERR
// - `unparsable` - oxc could not parse the source, so there is nothing to print through
// - `pure-only` / `full-env` - the run or the family switched the usage-global leg off
// - `not-armed` - the untransformed source does not depend on a stripped builtin
// - `harness-crash` - the snippet died outside the legs' own guards
export const LEGS = {
  'pure-stripped': ['transform-crash', 'not-strip-family', 'native-throw', 'harness-crash'],
  'ast-print-through': ['transform-crash', 'native-throw', 'unparsable', 'harness-crash'],
  'global-stripped': ['pure-only', 'full-env', 'transform-crash', 'native-throw', 'not-armed', 'harness-crash'],
};

// measured shares of the corpus each leg deep-checks: pure-stripped 0.60, ast-print-through 0.99,
// global-stripped 0.90. The floors are those halved - corpus drift never reaches them, a leg that
// stopped checking always does
export const LEG_FLOORS = {
  'pure-stripped': 0.3,
  'ast-print-through': 0.5,
  'global-stripped': 0.45,
};

export function emptyCoverage() {
  return Object.fromEntries(Object.keys(LEGS).map(leg => [leg, { checked: 0, skipped: {} }]));
}

export function skippedTotal(stats) {
  let total = 0;
  for (const count of Object.values(stats.skipped)) total += count;
  return total;
}

// record one snippet across every leg. an outcome that is neither `checked` nor one of that leg's
// named skips THROWS here instead of going unrecorded: the coordinator's equation would report the
// resulting hole, but only this throw names what produced it
export function accountSnippet(coverage, outcomes) {
  for (const [leg, reasons] of Object.entries(LEGS)) {
    const outcome = outcomes[leg];
    const stats = coverage[leg];
    if (outcome === 'checked') stats.checked++;
    else if (reasons.includes(outcome)) stats.skipped[outcome] = (stats.skipped[outcome] ?? 0) + 1;
    else throw new Error(`differential coverage: leg '${ leg }' reported the unnamed outcome '${ outcome }'`);
  }
}

export function mergeCoverage(parts) {
  const merged = emptyCoverage();
  for (const part of parts) {
    for (const [leg, stats] of Object.entries(merged)) {
      const from = part?.[leg];
      if (!from) continue;
      stats.checked += from.checked ?? 0;
      for (const [reason, count] of Object.entries(from.skipped ?? {})) stats.skipped[reason] = (stats.skipped[reason] ?? 0) + count;
    }
  }
  return merged;
}

// the gate itself: one line per leg whose accounting does not cover the corpus, empty when they all
// do. a leg missing from every shard's payload lands here too - `mergeCoverage` seeds all of them.
// the reason names are re-checked rather than trusted: the shard validates its own bookkeeping, and
// a gate that reads only the shard's word for it is the same unread number one level up
export function coverageShortfalls(coverage, total) {
  const shortfalls = [];
  for (const [leg, stats] of Object.entries(coverage)) {
    const skipped = skippedTotal(stats);
    const accounted = stats.checked + skipped;
    const unnamed = Object.keys(stats.skipped).filter(reason => !LEGS[leg].includes(reason));
    if (unnamed.length) shortfalls.push(`${ leg } skipped snippets under reasons it does not declare: ${ unnamed.join(', ') }`);
    const floor = Math.ceil(total * LEG_FLOORS[leg]);
    if (stats.checked < floor) {
      shortfalls.push(`${ leg } deep-checked ${ stats.checked } of ${ total } snippets, under its floor of ${ floor }`
        + ' - the leg stopped checking rather than abstained');
    }
    if (accounted !== total) {
      const gap = accounted < total
        ? `${ total - accounted } neither checked nor skipped for a named reason`
        : `${ accounted - total } counted more than once`;
      shortfalls.push(`${ leg } accounted for ${ accounted } of ${ total } snippets (${ stats.checked } checked, ${ skipped } skipped) - ${ gap }`);
    }
  }
  return shortfalls;
}
