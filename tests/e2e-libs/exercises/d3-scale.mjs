// d3-scale and the d3-array under it: grouping, set algebra, search, and the scales a chart maps data
// through. Every expected value is DEFINED by the input or by the operation - the ends of a domain map
// onto the ends of a range, a log scale is linear in the exponent, a band is the range split evenly -
// not observed from a run.
//
// Its reason is the SURFACE axis, reached through a shape no library here has: `internmap` declares
// `InternMap extends Map` and `InternSet extends Set`, and every method of both is a `super.get` /
// `set` / `has` / `add` / `delete` on the built-in parent - the only other `extends` of a built-in
// in the corpus is three's `Error`, and nothing else calls a built-in parent through `super`.
// `internmap` EXPORTS those classes, and an exported subclass hands its parent's statics to
// importers the provider cannot see, so it imports the whole namespace - a subclass kept inside its
// module costs only `.../constructor`. Measured on the babel-plugin cells against the union of the
// ten reference baselines before it, `usage-pure` gains `@core-js/pure/full/map` and `.../set`,
// where the corpus only ever held `.../constructor`, and `usage-global` gains `es.map.group-by`,
// which nothing here calls. The two flavors lower the class differently. The global one keeps the
// built-in's name, so Babel wraps it in `_wrapNativeSuper`, which asks whether the parent reads as
// native; in the pure one the parent is core-js's own `Map`, a name Babel does not know, so
// `_callSuper` constructs it directly. Both go through `Reflect.construct` where there is one. A
// copy of `internmap` holding its Map and Set in a field instead takes the namespaces and
// `es.map.group-by` out of the reference sets, and with them `reflect/construct`, `reflect/get`,
// `reflect/namespace` and `object/get-own-property-descriptor` - what the subclassing helpers read.
//
// What the checks hold is the INTERNING: two distinct Date objects of one instant are one key. A
// `Map` / `Set` in `internmap`'s place that keys by identity reddens six of them - `group_interned`,
// `rollup_nested`, `index_unique`, `union_interned`, `intersection`, `ordinal`. Each name called
// below, replaced by one handing its input back, reddens the checks built on it, or throws out of the
// exercise where the product it hands back has no method to call.
//
// Nothing here reaches a typed array: `quantile`, `median`, `rank`, `fsum`, `cumsum` and `sort` with an
// accessor copy through `Float64Array.from` / `Uint32Array.from`, statics `usage-pure` cannot serve
// and IE11 does not have (see AGENTS.md).
import { bisector, difference, extent, group, groupSort, index, intersection, rollup, sum, ticks, union } from 'd3-array';
import { scaleBand, scaleLinear, scaleLog, scaleOrdinal, scaleQuantize, scaleThreshold, scaleUtc } from 'd3-scale';
import { checker } from './checks.mjs';

// two DISTINCT Date objects for one instant: a plain Map keys them apart, an InternMap by `valueOf`
function day(n) {
  return new Date(Date.UTC(2024, 0, n));
}

const ROWS = [
  { when: day(1), kind: 'a', value: 3 },
  { when: day(1), kind: 'b', value: 4 },
  { when: day(2), kind: 'a', value: 5 },
  { when: day(2), kind: 'a', value: 6 },
];

export function run() {
  const { checks, check } = checker();

  // --- InternMap: grouping by a Date key merges equal instants, which only interning does. Read
  // with `?.`, so a map that did not intern reddens these checks instead of throwing past the rest ---
  const byDay = group(ROWS, row => row.when);
  check('group_interned', [byDay.size, byDay.get(day(1))?.length, byDay.has(day(2))], [2, 2, true]);
  const totals = rollup(ROWS, rows => sum(rows, row => row.value), row => row.when, row => row.kind);
  check('rollup_nested', [totals.get(day(1))?.get('b'), totals.get(day(2))?.get('a'), totals.get(day(2))?.has('b')], [4, 11, false]);
  check('index_unique', index(ROWS.slice(0, 3), row => row.when, row => row.kind).get(day(2))?.get('a').value, 5);
  check('group_sort', groupSort(ROWS, rows => -rows.length, row => row.kind), ['a', 'b']);

  // --- InternSet: the set algebra over Dates counts instants, not objects ---
  check('union_interned', union([day(1), day(2)], [day(2), day(3)]).size, 3);
  // read through the set's own methods: a spread here would be the exercise iterating on its behalf
  const both = intersection([day(1), day(2)], [day(2)]);
  check('intersection', [both.size, both.has(day(2)), both.has(day(1))], [1, true, false]);
  const rest = difference([1, 2, 3], [2]);
  check('difference', [rest.size, rest.has(1), rest.has(2)], [2, true, false]);

  // --- scaleOrdinal keeps its domain in an InternMap, so a Date seen twice is one entry ---
  const colour = scaleOrdinal(['x', 'y']);
  check('ordinal', [colour(day(1)), colour(day(2)), colour(day(1)), colour.domain().length], ['x', 'y', 'x', 2]);
  const band = scaleBand().domain(['p', 'q', 'r', 's']).range([0, 100]);
  check('band', [band('p'), band('s'), band.bandwidth()], [0, 75, 25]);

  // --- continuous scales: linear maps the ends of its domain onto the ends of its range, log is
  // linear in the exponent, and `ticks` over [0, 1] at count 5 are the multiples of 0.2 - compared in
  // tenths, so the float arithmetic d3 computes them with does not decide ---
  const linear = scaleLinear().domain([10, 20]).range([0, 100]);
  check('linear', [linear(10), linear(15), linear(20), linear.invert(50)], [0, 50, 100, 15]);
  check('log', [scaleLog().domain([1, 1000]).range([0, 3])(100)], [2]);
  check('ticks', ticks(0, 1, 5).map(tick => Math.round(tick * 10)), [0, 2, 4, 6, 8, 10]);
  check('nice', scaleLinear().domain([0.3, 9.7]).nice().domain(), [0, 10]);
  check('quantize_threshold', [scaleQuantize().domain([0, 1]).range(['lo', 'hi'])(0.75), scaleThreshold([0, 1], ['n', 'z', 'p'])(0.5)], ['hi', 'z']);

  // --- time: a UTC scale over a day maps noon to the middle, and its ticks are whole hours ---
  const utc = scaleUtc().domain([day(1), day(2)]).range([0, 24]);
  check('utc', [utc(new Date(Date.UTC(2024, 0, 1, 12))), utc.ticks(4).map(date => date.getUTCHours())], [12, [0, 6, 12, 18, 0]]);

  // --- search and extent, on the accessor forms. Dates compare by their `toJSON`: `.map(Number)` on
  // what `extent` returns would hand `Number` to a call the provider cannot resolve, and it would
  // import the whole namespace on this file's behalf ---
  const byValue = bisector(row => row.value);
  check('bisect', [byValue.left(ROWS, 5), byValue.right(ROWS, 5)], [2, 3]);
  check('extent', extent(ROWS, row => row.when), [day(1), day(2)]);

  return { checks };
}
