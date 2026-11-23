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
// The exercise checks the rendered SVG against the input data, including the bar heights,
// the line's scale and the relative placement of two projected polygons. It also checks
// the option and map round-trips, disposal and the ECharts version.
//
// fast-xml-parser reads the document and svg-pathdata decodes paths. Both packages pass
// through the same compilation and injection as ECharts. The exercise interprets the SVG
// viewport and composes element transforms with their ancestors to compare bar bounds,
// marker centers and text origins in a common coordinate system.
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
// dependency, which is why no grep and no local tier saw it
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
  // eslint-disable-next-line unicorn/prefer-string-replace-all -- keep the fixture from injecting replaceAll itself
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
  (function walk(nodes, parent) {
    for (const node of nodes) {
      const tag = Object.keys(node).find(key => key !== ':@');
      if (!tag || tag === '#text') continue;
      const children = node[tag];
      const attrs = node[':@'] ?? {};
      found.push({
        tag, parent, attrs,
        text: children.filter(child => '#text' in child).map(child => child['#text']).join(''),
      });
      // Only transformed ancestors affect the coordinates of their descendants.
      walk(children, attrs.transform ? { attrs, parent } : parent);
    }
  })(XML.parse(svg));
  return found;
}

// Both transform and viewBox use SVG numbers separated by whitespace or a single comma.
function numbersOf(body, count) {
  if (typeof body !== 'string' || /[^\d\t\n\r +,\-.e]/i.test(body)) return null;
  const args = body.trim().split(/\s*,\s*|\s+/);
  if (args.length !== count) return null;
  const numbers = [];
  for (const arg of args) {
    if (!/^[+-]?(?:\d+|\d*\.\d+)(?:e[+-]?\d+)?$/i.test(arg)) return null;
    if (!isFinite(arg)) return null;
    numbers.push(+arg);
  }
  return numbers;
}

// zrender emits one translation or affine matrix.
function matrixOf(value) {
  if (value.charAt(value.length - 1) !== ')') return null;
  const open = value.indexOf('(');
  const kind = value.slice(0, open);
  if (kind !== 'translate' && kind !== 'matrix') return null;
  const numbers = numbersOf(value.slice(open + 1, -1), kind === 'translate' ? 2 : 6);
  if (!numbers) return null;
  return kind === 'translate' ? [1, 0, 0, 1, numbers[0], numbers[1]] : numbers;
}

// Apply local transforms from the element outwards, so every measurement uses image coordinates.
function imagePath(element, data) {
  let path;
  try {
    path = new SVGPathData(data).toAbs();
  } catch {
    return null;
  }
  for (let node = element; node; node = node.parent) {
    if (!node.attrs.transform) continue;
    const matrix = matrixOf(node.attrs.transform);
    if (!matrix) return null;
    path.matrix(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
  }
  return path;
}

function pointOf(element, x, y) {
  const point = imagePath(element, [{ type: SVGPathData.MOVE_TO, relative: false, x, y }])?.commands[0];
  return point ? [point.x, point.y] : null;
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
function boxOf(element) {
  try {
    const bounds = imagePath(element, element.attrs.d)?.getBounds();
    if (!bounds) return NOTHING;
    if ([bounds.minX, bounds.maxX, bounds.minY, bounds.maxY].some(value => !isFinite(value))) return NOTHING;
    return { left: bounds.minX, right: bounds.maxX, top: bounds.minY, bottom: bounds.maxY };
  } catch {
    return NOTHING;
  }
}

function boxAt(paths, index) {
  const path = paths[index];
  return path ? boxOf(path) : NOTHING;
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
    const { x = 0, y = 0 } = element.attrs;
    return { text: element.text, point: pointOf(element, +x, +y) };
  });
}

// The tick labels are the only ABSOLUTE anchor in the picture. Every other assertion here is a
// relation between shapes, and a renderer that drew the whole value axis at 80% of its scale would
// satisfy all of them: the bars stay proportional to each other, keep their order and share their
// baseline. Reading the ticks turns "proportional" into "at this coordinate", and it costs nothing -
// the axis is drawn by a different part of the library than the series.
function valueAxis(texts) {
  const ticks = texts
    .filter(entry => /^-?\d+(?:\.\d+)?$/.test(entry.text))
    .map(entry => ({ value: Number(entry.text), y: entry.point?.[1] }))
    .sort((a, b) => a.value - b.value);
  if (ticks.length < 2) return null;
  const [low] = ticks;
  const high = ticks[ticks.length - 1];
  if (high.value === low.value || high.y === low.y) return null;
  function yAt(value) {
    return low.y + (value - low.value) * ((high.y - low.y) / (high.value - low.value));
  }
  for (const tick of ticks) if (!near(tick.y, yAt(tick.value), 1)) return null;
  return yAt;
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
  // The renderer requests this viewport. A shifted viewBox can put the entire map off-screen
  // while every coordinate measured inside it still agrees.
  check('svg: rendered at the requested size and viewBox',
    root ? [root.attrs.width, root.attrs.height, numbersOf(root.attrs.viewBox, 4)] : null,
    [String(WIDTH), String(HEIGHT), [0, 0, WIDTH, HEIGHT]]);
  check('svg: no NaN reached the output', /NaN/.test(svg), false);
  check('svg: the same option renders the same picture', normalize(second.svg), normalize(svg));
  check('svg: a changed datum renders a different one', normalize(variant.svg) === normalize(svg), false);

  // --- the bars: one per datum, and their heights ARE the data
  const bars = seriesOf(elements, 0);
  check('bars: a shape per datum', bars.length, VALUES.length);
  const boxes = VALUES.map((value, index) => boxAt(bars, index));
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
  // Read the center of the rendered marker; an empty path or zero scale has no marker.
  const symbols = seriesOf(elements, 1).map(symbol => {
    const box = boxOf(symbol);
    return box.left < box.right && box.top < box.bottom ? [(box.left + box.right) / 2, (box.top + box.bottom) / 2] : null;
  });
  const vertices = VALUES.map((value, index) => pointAt(symbols, index));
  check('line: a symbol per datum', symbols.length === VALUES.length && symbols.indexOf(null) === -1, true);
  check('line: a larger value sits higher',
    vertices[0][1] > vertices[1][1] && vertices[1][1] > vertices[2][1], true);
  const firstStep = (vertices[0][1] - vertices[1][1]) / (VALUES[1] - VALUES[0]);
  const secondStep = (vertices[1][1] - vertices[2][1]) / (VALUES[2] - VALUES[1]);
  check('line: the value axis is linear', near(firstStep, secondStep, 0.05), true);
  const aligned = [];
  for (let i = 0; i < vertices.length; i++) aligned.push(near(vertices[i][0], (boxes[i].left + boxes[i].right) / 2, 1));
  check('line: it tracks the bars', aligned, [true, true, true]);
  check('line: the path joins the symbols', elements.some(element => {
    if (element.tag !== 'path' || element.attrs.fill !== 'none' || !element.attrs.stroke) return false;
    const commands = imagePath(element, element.attrs.d)?.commands;
    if (commands?.length !== vertices.length) return false;
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.type !== (i ? SVGPathData.LINE_TO : SVGPathData.MOVE_TO)
        || !near(command.x, vertices[i][0]) || !near(command.y, vertices[i][1])) return false;
    }
    return true;
  }), true);

  // --- the axes
  const texts = textsOf(elements);
  const labels = texts.map(entry => entry.text);
  check('axis: every category is labelled',
    CATEGORIES.every(category => labels.indexOf(category) !== -1), true);
  const ticks = labels.map(label => +label).filter(value => !isNaN(value));
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
    near(Math.min(west.top, east.top), HEIGHT * 0.1, 2)
      && near(Math.max(west.bottom, east.bottom), HEIGHT * 0.8, 2), true);
  check('geo: the two features share that band',
    near(west.top, east.top, 1) && near(west.bottom, east.bottom, 1), true);
  check('geo: the map sits beside the grid', west.left > boxes[2].right, true);
  check('geo: the registered map round-trips',
    echarts.getMap('demo').geoJSON.features.length, FEATURES.features.length);

  // --- the instance
  check('option: the data round-trips', [first.roundTrip.series?.[0]?.data, first.roundTrip.xAxis?.[0]?.data], [VALUES, CATEGORIES]);
  check('instance: dispose is reported', first.disposed, true);
  check('module: it names its version', typeof echarts.version, 'string');

  return { checks };
}
