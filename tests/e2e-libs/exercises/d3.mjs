// A headless d3 program: grouping and set algebra over iterables, scales, number and time
// formatting, delimited text, colour interpolation, path generation, hierarchies, quadtrees,
// polygons, spherical geometry, seeded random and a force simulation - all pure computation, so it
// runs in node and down-compiles to ES5.
//
// THIS IS THE SUITE'S WIDEST GRAPH, and that is its reason to exist. d3 is a federation: the facade
// re-exports some thirty packages, so a provider scans hundreds of small modules and the bundler
// resolves the injections across all of them - the build-side cost that scales with module COUNT
// rather than with the size of any one module, which no other fixture here reaches. rxjs holds the
// small-modules profile inside a single published package; three is the opposite extreme, one module
// of over a megabyte. A large part of what the provider scans here never reaches the bundle at all,
// so a snapshot line can stand over a module this exercise never runs - `origins` is what tells the
// two apart, and `pipeline.md` measures the same shake in bytes: source loaded against tree-shaken.
//
// The stdlib calls have to happen inside d3, so the blocks below hand d3 the SHAPES its own code has
// to walk: a Set or a Map goes to `sort`/`reverse`/`superset` and d3 does the iteration, `group` and
// `rollup` build InternMaps, `merge` runs d3's own generator, and `flatGroup` reaches
// `Array#flatMap` in d3-array. The number paths are picked the same way - symlog for `Math.expm1`,
// a base-2 log scale for `Math.log2`, Scott's rule for `Math.cbrt`, the exponential and geometric
// generators for `Math.log1p`, SI and exponential formats for `Number#toExponential`, the polygon
// perimeter for `Math.hypot`. None of those has an origin in any other fixture.
//
// Deliberately out of reach:
//   - every path that touches a typed array INSIDE, which is not the same set as the one that
//     returns one: d3-delaunay / delaunator, `blur*`, `cumsum`, `rank`, `quantile` (so `median`),
//     and `d3.sort` GIVEN AN ACCESSOR - one argument sends it down an index path over
//     `Uint32Array.from(...)`, two arguments (a comparator) sort the array itself. `usage-pure`
//     cannot serve one typed-array method or static, and IE11 has none of them either: its typed
//     arrays predate all of it. This is the hole that pruned three's paths, and the reason the check
//     that read `d3.rank`'s Float64Array by index still had to go - indexing the RESULT is fine, but
//     it sorts a typed index on the way there. A poisoned-prototype run is what settles it;
//   - `Array#find` and friends called from HERE - d3 never calls them, so the specifier would have
//     this file as its only origin and the baseline would describe the harness;
//   - local time: every date path is UTC, or the expectations would move with the machine's zone.
//
// What to expect from the phase axis here: with the ES6+ surface IE11 lacks deleted from a realm,
// both `usage-*/pre` cells fail (pure throws on `Array.from`, global reddens `array_merge` and
// `hierarchy_descendants`) while every gating cell passes. `pre` runs before Babel and so never sees
// the helpers its spread, `for-of` and generators need - that is the per-library diagnostic the phase
// axis exists to print, not a regression, and `runtime.mjs` does not gate on it.
//
// d3-selection, d3-transition and d3-zoom arrive through the facade and patch their own prototypes
// on load, so they are in the graph and in the bundle, but they read no DOM until called and nothing
// here calls them - which is why this exercise runs in a bare realm at all.
//
// One blind spot worth naming: d3-dsv compiles its row converter with `new Function`, so the code
// that actually builds each parsed object exists only at runtime and no provider can see it. The
// `dsv_*` checks below still prove d3-dsv's own module-level code runs; they cannot prove anything
// about what it generates.
import * as d3 from 'd3';
import { checker } from './checks.mjs';

// Rows shaped so that every grouping key has more than one member and the values are distinct: a
// grouping that lost its keys, or a reducer that returned its input, changes the numbers below.
const ROWS = [
  { name: 'a', cat: 'x', kind: 'p', value: 3 },
  { name: 'b', cat: 'y', kind: 'q', value: 7 },
  { name: 'c', cat: 'x', kind: 'q', value: 5 },
  { name: 'd', cat: 'y', kind: 'p', value: 2 },
  { name: 'e', cat: 'x', kind: 'p', value: 9 },
];
const VALUES = ROWS.map(row => row.value);
function rowCat(row) { return row.cat; }
// `kind`, not `sub`: a field named after `String.prototype.sub` is a member expression the provider
// resolves to a polyfill nothing in d3 asks for, and the specifier would land in the baseline with
// this file as its only origin
function rowKind(row) { return row.kind; }
function rowValue(row) { return row.value; }
// A two-argument COMPARATOR, not a one-argument accessor: given an accessor, `d3.sort` orders a
// `Uint32Array.from(...)` index instead, and neither `usage-pure` nor IE11 has a single typed-array
// method to do it with.
function byKey(a, b) { return d3.ascending(a[0], b[0]); }

// Two draws from the same seed have to agree, and that is only true if the generator threads the
// source it was given - `Math.random` would pass every other assertion here.
const SEED = 42;
function lcg() { return d3.randomLcg(SEED); }

// A sample large enough for the mean to sit near the distribution's, small enough to stay cheap.
// Never averaged with `d3.mean` where the check is ABOUT d3's arithmetic - the sum is what is
// under test then, so the loop is here.
function draw(random, count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(random());
  return out;
}

function treemapArea(leaf) {
  return (leaf.x1 - leaf.x0) * (leaf.y1 - leaf.y0);
}

// Clustered and off-centre, so that both force assertions name a movement away from it.
const FORCE_START = [{ x: 10, y: 10 }, { x: 10.1, y: 10 }, { x: 10, y: 10.1 }];

// The closest pair, which is what "the charge force pushed them apart" means as a number. Hand-rolled
// for the same reason as `mean` below: d3 must not be the one to compute the verdict on d3's output.
function spread(nodes) {
  let closest = Infinity;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      closest = Math.min(closest, Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y));
    }
  }
  return closest;
}

function mean(numbers) {
  let total = 0;
  for (let i = 0; i < numbers.length; i++) total += numbers[i];
  return total / numbers.length;
}

export function run() {
  const { checks, check } = checker();

  // -------- d3-array: iterables, InternMap, set algebra --------
  // A Set and a Map reach d3 as ITERABLES; d3-array walks them itself, and `Array.from` is the call it
  // reaches for to do it - so a missed injection is d3's call site, not this file's.
  check('array_sort_set', d3.sort(new Set([5, 1, 9, 3])), [1, 3, 5, 9]);
  check('array_sort_map', d3.sort(new Map([['b', 2], ['a', 1]]), byKey), [['a', 1], ['b', 2]]);
  check('array_reverse_set', d3.reverse(new Set([1, 2, 3])), [3, 2, 1]);
  check('array_map_iterable', d3.map(new Set([1, 2, 3]), value => value * 2), [2, 4, 6]);
  check('array_reduce_iterable', d3.reduce(new Set([1, 2, 3]), (a, b) => a + b, 0), 6);
  check('array_filter_iterable', d3.filter(new Set([1, 2, 3, 4]), value => value % 2 === 0), [2, 4]);
  // group/rollup/index return InternMaps - Map subclasses - and `d3.sort` turns them back into
  // entries, again inside d3
  check('array_group', d3.sort(d3.group(ROWS, rowCat), byKey).map(entry => [entry[0], entry[1].length]),
    [['x', 3], ['y', 2]]);
  check('array_rollup', d3.sort(d3.rollup(ROWS, rows => d3.sum(rows, rowValue), rowCat), byKey),
    [['x', 17], ['y', 9]]);
  check('array_index', d3.index(ROWS, row => row.name).get('c').value, 5);
  check('array_groups_nested', d3.groups(ROWS, rowCat, rowKind).length, 2);
  // flatGroup / flatRollup are d3-array's `Array#flatMap` site
  check('array_flat_rollup', d3.sort(d3.flatRollup(ROWS, rows => d3.sum(rows, rowValue), rowCat, rowKind)
    .map(row => row.join(':'))), ['x:p:12', 'x:q:5', 'y:p:2', 'y:q:7']);
  check('array_flat_group_arity', d3.flatGroup(ROWS, rowCat, rowKind)[0].length, 3);
  // `Object.is` lives in superset/disjoint, which d3 uses to compare values pulled off two iterators
  check('array_superset', d3.superset([1, 2, 3, 4], new Set([2, 4])), true);
  check('array_subset', d3.subset(new Set([2, 4]), [1, 2, 3, 4]), true);
  check('array_disjoint', d3.disjoint(new Set([1, 2]), new Set([3, 4])), true);
  check('array_intersection', d3.sort(d3.intersection([1, 2, 3], new Set([2, 3, 4]))), [2, 3]);
  check('array_difference', d3.sort(d3.difference([1, 2, 3], new Set([2]))), [1, 3]);
  check('array_union', d3.sort(d3.union([1, 2], new Set([2, 3]))), [1, 2, 3]);
  // `merge` is a generator inside d3-array
  check('array_merge', d3.merge([[1, 2], [3], [4, 5]]), [1, 2, 3, 4, 5]);
  check('array_zip', d3.zip([1, 2], ['a', 'b']).map(pair => pair.join('')), ['1a', '2b']);
  check('array_cross', d3.cross([1, 2], ['a', 'b'], (n, s) => s + n), ['a1', 'b1', 'a2', 'b2']);
  check('array_pairs', d3.pairs([1, 2, 4], (a, b) => b - a), [1, 2]);
  check('array_least', d3.least(ROWS, (a, b) => a.value - b.value).name, 'd');
  check('array_greatest_index', d3.greatestIndex(VALUES), 4);
  check('array_mode', d3.mode([1, 2, 2, 3]), 2);
  check('array_deviation_relation', Math.abs(d3.deviation(VALUES) - Math.sqrt(d3.variance(VALUES))) < 1e-12, true);
  // fsum is the compensated sum: it lands on 0.6 exactly where `0.1 + 0.2 + 0.3` does not, so an
  // implementation that just added the terms up would redden this
  check('array_fsum_exact', d3.fsum([0.1, 0.2, 0.3]), 0.6);
  check('array_extent', d3.extent(VALUES), [2, 9]);
  // `Math.log10` decides the tick step in d3-array
  check('array_ticks', d3.ticks(0, 10, 5), [0, 2, 4, 6, 8, 10]);
  check('array_tick_step_decade', d3.tickStep(0, 1000, 10), 100);
  check('array_bisect', d3.bisect(d3.sort(VALUES), 6), 3);
  // Scott's rule is d3-array's `Math.cbrt` site; the bin edges have to cover the data either way
  const scottBins = d3.bin().thresholds(d3.thresholdScott)(VALUES);
  check('array_bin_scott_covers', d3.sum(scottBins, bin => bin.length), VALUES.length);
  check('array_bin_scott_ordered', d3.sort(scottBins.map(bin => bin.x0)).join(',') ===
    scottBins.map(bin => bin.x0).join(','), true);

  // -------- d3-scale --------
  const linear = d3.scaleLinear().domain(d3.extent(VALUES)).range([0, 100]);
  check('scale_linear_ends', [Math.round(linear(2)), Math.round(linear(9))], [0, 100]);
  check('scale_linear_invert', Math.round(linear.invert(50) * 1000) / 1000, 5.5);
  check('scale_linear_ticks', linear.ticks(4), [2, 4, 6, 8]);
  // base 10 and base 2 are d3-scale's `Math.log10` / `Math.log2` branches
  // the decade ladder is the assertion: a `ticks` that handed the domain back would keep the ends
  // and have neither 10 nor 100 in between
  const logTicks = d3.scaleLog().domain([1, 1000]).ticks();
  check('scale_log10_ticks_span', [logTicks[0], logTicks[logTicks.length - 1]], [1, 1000]);
  check('scale_log10_ticks_decades', logTicks.indexOf(100) > logTicks.indexOf(10) &&
    logTicks.indexOf(10) > 0, true);
  check('scale_log10_midpoint', d3.scaleLog().domain([1, 100]).range([0, 2])(10), 1);
  check('scale_log2_ticks', d3.scaleLog().base(2).domain([1, 8]).ticks(4), [1, 2, 4, 8]);
  // symlog runs `Math.sign` and `Math.log1p` on the way in and `Math.expm1` on the way back
  const symlog = d3.scaleSymlog().domain([-100, 100]).range([-1, 1]);
  check('scale_symlog_odd', Math.abs(symlog(-50) + symlog(50)) < 1e-12, true);
  check('scale_symlog_roundtrip', Math.round(symlog.invert(symlog(37)) * 1000) / 1000, 37);
  // radial is the other `Math.sign` site: it squares through zero and has to keep the sign
  check('scale_radial_signs', d3.scaleRadial().domain([-1, 1]).range([-10, 10])(-1) < 0, true);
  check('scale_pow_sqrt', d3.scaleSqrt().domain([0, 100]).range([0, 10])(25), 5);
  check('scale_quantize', d3.scaleQuantize().domain([0, 10]).range(['lo', 'mid', 'hi'])(7), 'hi');
  check('scale_quantile', d3.scaleQuantile().domain(VALUES).range(['lo', 'hi'])(9), 'hi');
  check('scale_threshold', d3.scaleThreshold().domain([5]).range(['under', 'over'])(7), 'over');
  check('scale_ordinal', d3.scaleOrdinal(['x', 'y'], [10, 20])('y'), 20);
  check('scale_band_step', d3.scaleBand().domain(['a', 'b']).range([0, 100]).step(), 50);
  const point = d3.scalePoint().domain(['a', 'b', 'c']).range([0, 100]);
  check('scale_point_positions', point.domain().map(key => point(key)), [0, 50, 100]);
  check('scale_utc_ticks', d3.scaleUtc()
    .domain([new Date(Date.UTC(2026, 0, 1)), new Date(Date.UTC(2026, 0, 5))])
    .ticks(4).map(date => date.getUTCDate()), [1, 2, 3, 4, 5]);

  // -------- d3-format: `Number#toExponential` --------
  check('format_fixed', d3.format('.2f')(Math.PI), '3.14');
  check('format_exponential', d3.format('.2e')(1234.5), '1.23e+3');
  check('format_si', d3.format('.3s')(42e6), '42.0M');
  check('format_grouped', d3.format('08,.2f')(1234.5), '1,234.50');
  check('format_percent', d3.format('.1%')(0.256), '25.6%');
  check('format_prefix', d3.formatPrefix('.1', 1e6)(1.3e6), '1.3M');
  check('format_precision_round', d3.precisionRound(0.01, 1.01), 3);
  check('format_precision_prefix', d3.precisionPrefix(1e-6, 1), 6);

  // -------- d3-time / d3-time-format, UTC throughout --------
  check('time_format', d3.utcFormat('%Y-%m-%dT%H:%M')(new Date(Date.UTC(2026, 7, 18, 9, 30))),
    '2026-08-18T09:30');
  check('time_parse', d3.utcParse('%Y-%m-%d')('2026-08-18').getTime(), Date.UTC(2026, 7, 18));
  // the TYPE is part of this assertion: the comparison unwraps a Date through `toJSON`, which
  // renders the same ISO string, so a formatter that handed its argument back would pass on the
  // value alone
  const iso = d3.isoFormat(d3.isoParse('2026-08-18T09:30:00.000Z'));
  check('time_iso_roundtrip', [typeof iso, iso], ['string', '2026-08-18T09:30:00.000Z']);
  check('time_day_range', d3.utcDay.range(new Date(Date.UTC(2026, 0, 1)), new Date(Date.UTC(2026, 0, 4)))
    .map(date => date.getUTCDate()), [1, 2, 3]);
  check('time_month_count', d3.utcMonth.count(new Date(Date.UTC(2026, 0, 15)), new Date(Date.UTC(2026, 3, 15))), 3);
  check('time_week_floor', d3.utcMonday.floor(new Date(Date.UTC(2026, 7, 18))).getUTCDay(), 1);
  check('time_every', d3.utcHour.every(6).range(new Date(Date.UTC(2026, 0, 1)), new Date(Date.UTC(2026, 0, 2)))
    .map(date => date.getUTCHours()), [0, 6, 12, 18]);

  // -------- d3-dsv --------
  const csv = d3.csvParse('name,value\nfoo,1\nbar,2');
  check('dsv_columns', csv.columns, ['name', 'value']);
  check('dsv_rows', csv.map(row => `${ row.name }=${ row.value }`), ['foo=1', 'bar=2']);
  check('dsv_parse_rows', d3.csvParseRows('1,2\n3,4').map(row => row.join('')), ['12', '34']);
  check('dsv_format', d3.csvFormat([{ a: 1, b: 2 }]), 'a,b\n1,2');
  check('dsv_format_quotes', d3.csvFormatRows([['a,b', 'c']]), '"a,b",c');
  check('dsv_tsv', d3.tsvParse('a\tb\n1\t2')[0].b, '2');

  // -------- d3-color / d3-interpolate --------
  check('color_hsl', d3.color('#ff0000').formatHsl(), 'hsl(0, 100%, 50%)');
  check('color_darker_channel', Math.round(d3.color('#808080').darker(1).rgb().r), 90);
  check('color_rgb_roundtrip', d3.rgb('steelblue').formatRgb(), 'rgb(70, 130, 180)');
  // the Lab channels, not a hex round trip: `d3.rgb(d3.lab(hex)).formatHex()` is the input hex again
  // under an identity conversion, so it observed nothing
  const lab = d3.lab('#4682b4');
  check('color_lab_channels', [Math.round(lab.l), Math.round(lab.a), Math.round(lab.b)], [52, -8, -33]);
  check('interpolate_rgb', d3.interpolateRgb('#000', '#fff')(0.5), 'rgb(128, 128, 128)');
  check('interpolate_hsl_ends', d3.interpolateHsl('#f00', '#00f')(1), 'rgb(0, 0, 255)');
  check('interpolate_object', d3.interpolate({ a: 0 }, { a: 10 })(0.25).a, 2.5);
  check('interpolate_array', d3.interpolate([0, 10], [10, 20])(0.5), [5, 15]);
  check('interpolate_string', d3.interpolate('0px', '10px')(0.4), '4px');
  check('interpolate_date', d3.interpolate(new Date(Date.UTC(2026, 0, 1)), new Date(Date.UTC(2026, 0, 3)))(0.5)
    .getTime(), Date.UTC(2026, 0, 2));
  check('interpolate_quantize', d3.quantize(d3.interpolateNumber(0, 1), 3), [0, 0.5, 1]);
  check('interpolate_piecewise', d3.piecewise(d3.interpolateNumber, [0, 2, 10])(0.5), 2);

  // -------- d3-shape / d3-path: tagged templates inside d3-path --------
  // `d3.stack()` is absent on purpose: its keys are set through a `.keys(...)` call, which the
  // provider reads as the iterator/DOM-collection method of that name - and d3 calls `.keys` nowhere
  // else, so the specifier would enter the baseline with this file as its only origin.
  check('shape_line', d3.line()([[0, 0], [10, 20], [20, 5]]), 'M0,0L10,20L20,5');
  check('shape_line_curve_differs', d3.line().curve(d3.curveCatmullRom)([[0, 0], [10, 20], [20, 5]]) !==
    d3.line()([[0, 0], [10, 20], [20, 5]]), true);
  check('shape_area_closed', d3.area().y0(0)([[0, 5], [10, 15]]).slice(-1), 'Z');
  check('shape_pie_full_turn', Math.abs(d3.pie()([1, 3])[0].endAngle - Math.PI * 2) < 1e-12, true);
  // half a turn, so the centroid sits on the +x axis at half the outer radius - a value, not a shape
  check('shape_arc_centroid', d3.arc().innerRadius(0).outerRadius(100)
    .centroid({ startAngle: 0, endAngle: Math.PI }).map(Math.round), [50, 0]);
  check('shape_symbol_path_starts', d3.symbol(d3.symbolCircle, 100)().charAt(0), 'M');

  // -------- d3-hierarchy: the node iterator is a generator inside d3 --------
  const root = d3.hierarchy({
    name: 'r',
    children: [
      { name: 'a', v: 2 },
      { name: 'b', children: [{ name: 'c', v: 4 }, { name: 'd', v: 1 }] },
    ],
  }).sum(node => node.v || 0).sort((a, b) => b.value - a.value);
  check('hierarchy_sum', root.value, 7);
  check('hierarchy_sorted', root.children.map(node => node.data.name), ['b', 'a']);
  check('hierarchy_descendants', root.descendants().length, 5);
  check('hierarchy_leaves', d3.sort(root.leaves().map(node => node.data.name)), ['a', 'c', 'd']);
  check('hierarchy_path_length', root.path(root.leaves()[0]).length, root.leaves()[0].depth + 1);
  check('hierarchy_ancestors', root.leaves()[0].ancestors().length, root.leaves()[0].depth + 1);
  const stratified = d3.stratify()([
    { id: 'r' }, { id: 'a', parentId: 'r' }, { id: 'b', parentId: 'r' },
  ]);
  check('hierarchy_stratify', stratified.children.length, 2);
  const treemapRoot = d3.treemap().size([100, 100])(d3.hierarchy({
    name: 'r', children: [{ name: 'a', v: 1 }, { name: 'b', v: 3 }],
  }).sum(node => node.v || 0));
  const treemapLeaves = treemapRoot.leaves();
  check('treemap_area_proportional',
    Math.round(treemapArea(treemapLeaves[1]) / treemapArea(treemapLeaves[0])), 3);
  check('partition_covers', d3.partition().size([100, 100])(d3.hierarchy({
    name: 'r', children: [{ name: 'a', v: 1 }, { name: 'b', v: 1 }],
  }).sum(node => node.v || 0)).x1, 100);

  // -------- d3-quadtree --------
  const quadtree = d3.quadtree().addAll([[0, 0], [1, 1], [4, 4]]);
  check('quadtree_size', quadtree.size(), 3);
  check('quadtree_extent_covers', quadtree.extent()[1][0] >= 4, true);
  let visited = 0;
  quadtree.visit(() => { visited++; });
  // three points cannot sit in fewer than three visited nodes, and a visitor that walked nothing
  // leaves the counter at zero
  check('quadtree_visited_nodes', visited >= 3, true);
  check('quadtree_data_sorted', d3.sort(quadtree.data().map(corner => corner.join(','))),
    ['0,0', '1,1', '4,4']);
  check('quadtree_remove', quadtree.remove(quadtree.data()[0]).size(), 2);

  // -------- d3-polygon: `Math.hypot` in the perimeter --------
  const square = [[0, 0], [4, 0], [4, 3], [0, 3]];
  check('polygon_area', Math.abs(d3.polygonArea(square)), 12);
  check('polygon_length', d3.polygonLength(square), 14);
  check('polygon_centroid', d3.polygonCentroid(square), [2, 1.5]);
  check('polygon_contains', d3.polygonContains(square, [1, 1]), true);
  check('polygon_hull_drops_interior', d3.polygonHull(square.concat([[2, 2]])).length, 4);

  // -------- d3-geo: headless, path strings and spherical measures --------
  const projection = d3.geoEquirectangular().scale(100).translate([0, 0]);
  check('geo_path_starts', d3.geoPath(projection)({
    type: 'LineString', coordinates: [[0, 0], [10, 10]],
  }).charAt(0), 'M');
  check('geo_path_measure', Math.round(d3.geoPath(projection).measure({
    type: 'LineString', coordinates: [[0, 0], [10, 0]],
  })), 17);
  check('geo_distance_quarter_turn', Math.abs(d3.geoDistance([0, 0], [0, 90]) - Math.PI / 2) < 1e-12, true);
  check('geo_area_hemisphere', Math.abs(d3.geoArea({
    type: 'Polygon', coordinates: [[[0, 0], [0, 90], [90, 0], [0, 0]]],
  }) - Math.PI / 2) < 1e-9, true);
  check('geo_centroid_point', d3.geoCentroid({ type: 'Point', coordinates: [10, 20] }), [10, 20]);
  check('geo_bounds', d3.geoBounds({ type: 'MultiPoint', coordinates: [[-10, -5], [10, 5]] }),
    [[-10, -5], [10, 5]]);
  check('geo_interpolate_midpoint', d3.geoInterpolate([0, 0], [0, 90])(0.5).map(Math.round), [0, 45]);
  check('geo_rotation_inverse', d3.geoRotation([30, 0]).invert(d3.geoRotation([30, 0])([10, 20]))
    .map(value => Math.round(value)), [10, 20]);

  // -------- d3-random: `Math.log1p` in exponential and geometric --------
  const exponential = draw(d3.randomExponential.source(lcg())(1), 400);
  check('random_exponential_positive', d3.min(exponential) > 0, true);
  check('random_exponential_mean', Math.abs(mean(exponential) - 1) < 0.2, true);
  const geometric = draw(d3.randomGeometric.source(lcg())(0.5), 400);
  check('random_geometric_integers', geometric.every(value => value === Math.floor(value) && value >= 1), true);
  check('random_geometric_mean', Math.abs(mean(geometric) - 2) < 0.3, true);
  const normal = draw(d3.randomNormal.source(lcg())(5, 1), 400);
  check('random_normal_mean', Math.abs(mean(normal) - 5) < 0.3, true);
  check('random_int_bounds', draw(d3.randomInt.source(lcg())(0, 10), 200)
    .every(value => value >= 0 && value < 10 && value === Math.floor(value)), true);
  // the same seed twice: a generator ignoring its source would answer differently here
  check('random_seed_reproducible', draw(d3.randomLcg(SEED), 5), draw(d3.randomLcg(SEED), 5));

  // -------- d3-force: seeded, checked by invariants rather than coordinates --------
  // The start is deliberately BOTH clustered and off-centre: a simulation whose `tick` did nothing
  // would leave a spread of 0.1 and a centroid at (10, 10), and both assertions below name a
  // movement away from exactly that.
  function simulate() {
    const nodes = FORCE_START.map(node => ({ x: node.x, y: node.y }));
    d3.forceSimulation(nodes).randomSource(d3.randomLcg(SEED))
      .force('charge', d3.forceManyBody().strength(-30))
      .force('center', d3.forceCenter(0, 0))
      .stop()
      .tick(20);
    return nodes;
  }
  const settled = simulate();
  // `forceCenter` shifts the nodes before the tick's velocity step, so the centroid lands NEAR the
  // target rather than on it - the bound is what the remaining velocity leaves, and it is orders
  // below the 30.1 the untouched start would give
  check('force_centered', Math.abs(d3.sum(settled, node => node.x)) < 1e-3, true);
  // the charge force has to open the cluster by orders, not by a hair; NaN coordinates fail this
  // same comparison, which is why finiteness needs no assertion of its own
  check('force_separated', spread(settled) > 10 * spread(FORCE_START), true);
  // same seed, same simulation: reproducibility is what makes the two checks above assertions
  check('force_reproducible', simulate().map(node => node.x), settled.map(node => node.x));

  return { checks };
}
