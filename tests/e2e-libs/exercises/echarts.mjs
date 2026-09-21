// Apache ECharts driven through its SERVER-SIDE render: option in, an SVG document out. That is the
// reason this entry exists at all - it is the one interface product in the corpus that renders with
// no DOM, so one cell serves the node pre-flight and the browser leg alike, and nothing DOM-shaped is
// left for IE11 to refuse. The candidates of its class that do need a document - Leaflet, OpenLayers,
// MapLibre - need a canvas, a worker or a Proxy, and none of the three reaches this floor.
//
// Its graph is also the widest here: the cell pulls 270 modules out of echarts and zrender, against
// 158 from rxjs, 46 from htmlparser2 and 7 from three, whose dist is one bundled file. What that buys
// is the cost NOTHING else in the repo measures - how much the injection adds for the bundler to
// resolve, parse and render - and the modular entry points (`echarts/core` plus the four features
// below) keep what echarts and zrender put into the cell to about half of what importing the whole
// package does, measured on the `usage-global` cell.
//
// The artifact is the check. Every assertion below reads GEOMETRY out of the emitted SVG - bar
// heights against their data, the linear scale behind a line, two projected polygons that have to
// come out side by side - so a rewrite that lands wrong changes a number rather than throwing. An
// identity renderer, one handing its input back, reddens every one of them.
//
// The render is READ by two more real packages rather than by code written for this file: the
// document by fast-xml-parser, the path geometry by svg-pathdata. Both go through the same
// down-compile and injection as echarts, so the cell takes three libraries to the floor - which is
// the suite's whole subject. The one read left to this file is WHERE an element was placed, off its
// `transform`, and that read stays bound to the form echarts writes. That does not let a broken
// reader agree with a broken writer: the raw tier pins what both do untransformed, and the anchored
// checks tie what is read to constants this file owns - the data, the categories, the placement the
// option asked for - so a reader drifting in step with the writer still has to reproduce them.
//
// Canvas is deliberately not registered: `SVGRenderer` alone keeps the graph off `zrender`'s canvas
// paths, which no realm here can execute. Interaction is out of scope for the same reason - mouse,
// zoom and tooltips need a live document, and this exercise never builds one.
import './process-env.mjs';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, MapChart } from 'echarts/charts';
import { GeoComponent, GridComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
// fast-xml-parser stays on its 4.x line, which is maintained. 5.x depends on `xml-naming`, and that
// package runs `new RegExp(..., 'u')` at MODULE LOAD. The floor reaches engines with no `u` flag -
// IE11, and the oldest Chrome, Safari and Firefox it names - and core-js does not emulate it, so on
// those the page dies before a check runs. The flag arrives through a variable, from a transitive
// dependency, which is why no grep and no local tier saw it. 4.x and its `strnum` are also the corpus'
// only CommonJS, and what the providers inject into them is what holds the recorder in `bundle.mjs` to
// its pass in front of `commonjs()` - a reader swapped for an ESM one takes that coverage with it
import { XMLParser } from 'fast-xml-parser';
import { SVGPathData } from 'svg-pathdata';
import { checker } from './checks.mjs';

echarts.use([BarChart, LineChart, MapChart, GeoComponent, GridComponent, SVGRenderer]);

// two adjacent squares, so the projection has something whose RELATION is known: whatever scale the
// map lands on, the shared edge stays shared and both features are treated alike. NOT their shape -
// the default projection stretches the axes independently, which the geo checks below spell out
const FEATURES = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: 'west' },
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]] } },
    { type: 'Feature', properties: { name: 'east' },
      geometry: { type: 'Polygon', coordinates: [[[10, 0], [20, 0], [20, 10], [10, 10], [10, 0]]] } },
  ],
};

const VALUES = [5, 20, 36];
const CATEGORIES = ['a', 'b', 'c'];
const WIDTH = 600;
const HEIGHT = 400;

function option(values) {
  return {
    animation: false,
    grid: { left: 40, right: 300, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: CATEGORIES },
    yAxis: { type: 'value' },
    series: [
      { type: 'bar', data: values },
      { type: 'line', data: values },
      // placed on BOTH axes, and in percentages, so the check below has an absolute to compare
      // against: everything else the map draws is a relation between its own two features
      { type: 'map', map: 'demo', left: '55%', width: '40%', top: '10%', height: '70%',
        data: [{ name: 'west', value: 3 }, { name: 'east', value: 7 }] },
    ],
  };
}

// the generated class names carry a per-INSTANCE counter, so two renders of the same option differ in
// them and in nothing else; the geometry underneath is what these checks are about
function normalize(svg) {
  return svg.replace(/zr\d+-cls-\d+/g, 'cls').replace(/zr\d+-c\d+/g, 'clip');
}

function render(values) {
  const chart = echarts.init(null, null, { renderer: 'svg', ssr: true, width: WIDTH, height: HEIGHT });
  chart.setOption(option(values));
  const svg = chart.renderToSVGString();
  const roundTrip = chart.getOption();
  chart.dispose();
  return { svg, roundTrip, disposed: chart.isDisposed() };
}

// every element of the document in order, with its attributes and the text directly inside it.
// `preserveOrder` keeps siblings as a list, `parseTagValue: false` keeps a tick label the string it
// was drawn as
const XML = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', preserveOrder: true, parseTagValue: false });

function elementsOf(svg) {
  const found = [];
  (function walk(nodes) {
    for (const node of nodes) {
      const tag = Object.keys(node).find(key => key !== ':@');
      if (!tag || tag === '#text') continue;
      const children = node[tag];
      found.push({
        tag,
        attrs: node[':@'] ?? {},
        text: children.filter(child => '#text' in child).map(child => child['#text']).join(''),
      });
      walk(children);
    }
  })(XML.parse(svg));
  return found;
}

// the numbers inside a `transform` - `matrix(a,b,c,d,e,f)` on a symbol, `translate(x y)` on a label.
// What is read off it is only where the element was PLACED; the geometry itself is svg-pathdata's.
// It knows the ONE form echarts writes - a single transform, name first, no whitespace before the
// parenthesis - and answers null for any other, including forms the SVG grammar allows: the checks
// that depend on it then fail by name, which is the right outcome for a render whose format moved
function transformOf(element, kind) {
  const value = element.attrs.transform;
  if (typeof value !== 'string' || value.indexOf(`${ kind }(`) !== 0) return null;
  return value.slice(kind.length + 1, -1).trim().split(/[\s,]+/).map(Number);
}

// the `<path>` elements of one series, found by the indices echarts stamps on them in its
// server-side mode rather than by their position in the document, in datum order
function seriesOf(elements, series) {
  return elements
    .filter(element => element.tag === 'path' && element.attrs.ecmeta_series_index === String(series))
    .sort((a, b) => Number(a.attrs.ecmeta_data_index) - Number(b.attrs.ecmeta_data_index));
}

// A shape the renderer did not emit must not take the exercise down with it: `run` would die on the
// first property read, the checks already recorded would be lost, and the tier would report a
// TypeError where it could have named the check that failed. NaN geometry fails every relation
// below by value, so the cell stays diagnostic.
const NOTHING = { left: NaN, right: NaN, top: NaN, bottom: NaN };

// svg-pathdata throws on a path it cannot parse and answers an empty one with infinite bounds; both
// are a shape that is not there, so both become NOTHING and fail by name rather than by exception
function boxOf(d) {
  try {
    const bounds = new SVGPathData(d).toAbs().getBounds();
    if (![bounds.minX, bounds.maxX, bounds.minY, bounds.maxY].every(Number.isFinite)) return NOTHING;
    return { left: bounds.minX, right: bounds.maxX, top: bounds.minY, bottom: bounds.maxY };
  } catch {
    return NOTHING;
  }
}

function boxAt(paths, index) {
  const path = paths[index];
  return path ? boxOf(path.attrs.d) : NOTHING;
}

function pointAt(points, index) {
  return points[index] ?? [NaN, NaN];
}

// pixel arithmetic lands on halves and thirds, so relations are compared at a tolerance rather than
// exactly - what must hold is the RELATION, not the rounding
function near(a, b, tolerance) {
  return Math.abs(a - b) <= (tolerance === undefined ? 0.5 : tolerance);
}

function textsOf(elements) {
  return elements.filter(element => element.tag === 'text').map(element => {
    const parts = transformOf(element, 'translate');
    return { text: element.text, at: parts && parts.length === 2 ? parts : null };
  });
}

// The tick labels are the only ABSOLUTE anchor in the picture. Every other assertion here is a
// relation between shapes, and a renderer that drew the whole value axis at 80% of its scale would
// satisfy all of them: the bars stay proportional to each other, keep their order and share their
// baseline. Reading the ticks turns "proportional" into "at this coordinate", and it costs nothing -
// the axis is drawn by a different part of the library than the series.
function valueAxis(texts) {
  const ticks = texts
    .filter(entry => entry.at && /^-?\d+(?:\.\d+)?$/.test(entry.text))
    .map(entry => ({ value: Number(entry.text), y: entry.at[1] }))
    .sort((a, b) => a.value - b.value);
  if (ticks.length < 2) return null;
  const [low] = ticks;
  const high = ticks[ticks.length - 1];
  if (high.value === low.value) return null;
  return value => low.y + (value - low.value) * ((high.y - low.y) / (high.value - low.value));
}

export function run() {
  const { check, checks } = checker();

  echarts.registerMap('demo', FEATURES);
  const first = render(VALUES);
  const second = render(VALUES);
  const variant = render([5, 20, 12]);
  const { svg } = first;
  const elements = elementsOf(svg);
  const root = elements.find(element => element.tag === 'svg');

  // --- the document itself
  check('svg: rendered at the requested size',
    root ? [root.attrs.width, root.attrs.height] : null, [String(WIDTH), String(HEIGHT)]);
  check('svg: no NaN reached the output', /NaN/.test(svg), false);
  check('svg: the same option renders the same picture', normalize(second.svg), normalize(svg));
  check('svg: a changed datum renders a different one', normalize(variant.svg) === normalize(svg), false);

  // --- the bars: one per datum, and their heights ARE the data
  // a symbol carries a `matrix` transform and a plain shape carries none - the one discriminator
  const bars = seriesOf(elements, 0);
  check('bars: a shape per datum', bars.length, VALUES.length);
  const shapes = bars.filter(bar => !transformOf(bar, 'matrix'));
  const boxes = VALUES.map((value, index) => boxAt(shapes, index));
  const ratios = boxes.map((box, index) => (box.bottom - box.top) / VALUES[index]);
  check('bars: height is proportional to value',
    ratios.every(ratio => near(ratio, ratios[0], 0.01)), true);
  check('bars: the tallest is the largest datum',
    boxes.indexOf(boxes.slice().sort((a, b) => (b.bottom - b.top) - (a.bottom - a.top))[0]),
    VALUES.indexOf(Math.max.apply(null, VALUES)));
  check('bars: drawn in category order',
    boxes[0].left < boxes[1].left && boxes[1].left < boxes[2].left, true);
  check('bars: they share a baseline',
    near(boxes[0].bottom, boxes[1].bottom) && near(boxes[1].bottom, boxes[2].bottom), true);

  // --- the line: the same data through a linear scale, read off the symbol placed on each datum
  // the line stamps its SYMBOLS rather than its polyline, and a symbol is a marker carried on a
  // transform: the datum is where the matrix PLACED it, which is its translation
  const symbols = seriesOf(elements, 1)
    .map(symbol => transformOf(symbol, 'matrix'))
    .filter(matrix => matrix && matrix.length === 6)
    .map(matrix => [matrix[4], matrix[5]]);
  const vertices = VALUES.map((value, index) => pointAt(symbols, index));
  check('line: a symbol per datum', symbols.length, VALUES.length);
  check('line: a larger value sits higher',
    vertices[0][1] > vertices[1][1] && vertices[1][1] > vertices[2][1], true);
  const firstStep = (vertices[0][1] - vertices[1][1]) / (VALUES[1] - VALUES[0]);
  const secondStep = (vertices[1][1] - vertices[2][1]) / (VALUES[2] - VALUES[1]);
  check('line: the value axis is linear', near(firstStep, secondStep, 0.05), true);
  check('line: it tracks the bars',
    near(vertices[1][0], (boxes[1].left + boxes[1].right) / 2, 1), true);

  // --- the axes
  const texts = textsOf(elements);
  const labels = texts.map(entry => entry.text);
  check('axis: every category is labelled',
    CATEGORIES.every(category => labels.indexOf(category) !== -1), true);
  const ticks = labels.map(Number).filter(value => !isNaN(value));
  check('axis: the ticks cover the largest datum',
    Math.max.apply(null, ticks) >= Math.max.apply(null, VALUES), true);
  const axis = valueAxis(texts);
  check('axis: its labels are placed, so the scale can be read back', typeof axis, 'function');
  check('bars: each top lands on the axis coordinate of its value',
    axis ? VALUES.every((value, index) => near(boxes[index].top, axis(value), 1)) : false, true);
  check('line: each symbol sits on the axis coordinate of its value',
    axis ? VALUES.every((value, index) => near(vertices[index][1], axis(value), 1)) : false, true);

  // --- the map: two squares projected into the same picture
  const regions = seriesOf(elements, 2);
  check('geo: a shape per feature', regions.length, FEATURES.features.length);
  const west = boxAt(regions, 0);
  const east = boxAt(regions, 1);
  check('geo: the features share their border', near(west.right, east.left), true);
  // NOT "a square projects to a square": the default geo projection fits the features to the box it
  // is given and stretches the axes independently, so what is invariant is that both features get the
  // SAME treatment and that the pair lands where the option placed it
  check('geo: both are drawn at the same scale',
    near(west.right - west.left, east.right - east.left, 1)
      && near(west.bottom - west.top, east.bottom - east.top, 1), true);
  check('geo: the pair honours the placement it was given',
    near(Math.min(west.left, east.left), WIDTH * 0.55, 2)
      && near(Math.max(west.right, east.right) - Math.min(west.left, east.left), WIDTH * 0.4, 2), true);
  // the vertical band is the other half of the same statement: without it the whole map could be
  // drawn off the canvas and every relation between its two features would still hold
  check('geo: it sits in the vertical band it was given',
    Math.min(west.top, east.top) >= HEIGHT * 0.1 - 2
      && Math.max(west.bottom, east.bottom) <= HEIGHT * 0.8 + 2, true);
  check('geo: the two features share that band',
    near(west.top, east.top, 1) && near(west.bottom, east.bottom, 1), true);
  check('geo: the map sits beside the grid', west.left > boxes[2].right, true);
  check('geo: the registered map round-trips',
    echarts.getMap('demo').geoJSON.features.length, FEATURES.features.length);

  // --- the instance
  check('option: the data round-trips', first.roundTrip.series?.[0]?.data, VALUES);
  check('instance: dispose is reported', first.disposed, true);
  check('module: it names its version', typeof echarts.version, 'string');

  return { checks };
}
