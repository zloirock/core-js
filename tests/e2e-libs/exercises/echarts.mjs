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
// below) keep the artifact near three's own bundle size rather than the 3.7mb the whole package
// would cost.
//
// The artifact is the check. Every assertion below reads GEOMETRY out of the emitted SVG - bar
// heights against their data, the linear scale behind a line, two projected polygons that have to
// come out side by side - so a rewrite that lands wrong changes a number rather than throwing. An
// identity renderer, one handing its input back, reddens every one of them.
//
// Canvas is deliberately not registered: `SVGRenderer` alone keeps the graph off `zrender`'s canvas
// paths, which no realm here can execute. Interaction is out of scope for the same reason - mouse,
// zoom and tooltips need a live document, and this exercise never builds one.
import './echarts-env.mjs';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, MapChart } from 'echarts/charts';
import { GeoComponent, GridComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
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

// `<path>` elements with the series/datum echarts stamps on them, so a shape is found by WHAT IT IS
// rather than by its position in the document
function pathsOf(svg, series) {
  const found = [];
  const chunks = svg.split('<path');
  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i].slice(0, chunks[i].indexOf('>'));
    const seriesIndex = /ecmeta_series_index="(?<value>\d+)"/.exec(chunk);
    if (!seriesIndex || Number(seriesIndex.groups.value) !== series) continue;
    const data = /ecmeta_data_index="(?<value>\d+)"/.exec(chunk);
    const d = /\sd="(?<value>[^"]*)"/.exec(chunk);
    // the line series stamps its SYMBOLS rather than its polyline, and a symbol is an arc carried on
    // a transform: its `d` describes the marker, so the datum is read off the matrix instead. That
    // transform is also the one discriminator between the two - a plain shape carries none
    if (!d) continue;
    const matrix = /transform="matrix\((?<values>[^)]*)\)"/.exec(chunk);
    const parts = matrix ? matrix.groups.values.split(',').map(Number) : null;
    found.push({
      index: data ? Number(data.groups.value) : null,
      d: d.groups.value,
      at: parts && parts.length === 6 ? [parts[4], parts[5]] : null,
    });
  }
  return found.sort((a, b) => a.index - b.index);
}

// M/L in both cases, which is all bars, polygons and polylines are made of here. The renderer also
// emits `A`, but only for the line's symbols, which are read off their transform instead - and a
// shape that did arrive with one (a bar with a border radius, say) must not be parsed as if the arc
// were not there: skipping its coordinates would hand back a box that looks plausible and is wrong.
// An unknown command yields no points, which `boxOf` turns into the same NaN geometry a missing
// shape gets, so the relation fails by name.
function pointsOf(d) {
  if (/[^\s\d+,\-.lmz]/i.test(d)) return [];
  const tokens = d.match(/[lmz]|-?\d*\.?\d+/gi) || [];
  const points = [];
  let command = 'M';
  let x = 0;
  let y = 0;
  for (let i = 0; i < tokens.length;) {
    if (/[a-z]/i.test(tokens[i])) {
      command = tokens[i];
      i++;
      continue;
    }
    // a close takes no coordinates, so a number after one is malformed - refuse the path rather than
    // skip the number and hand back a box computed from the rest of it
    if (command === 'Z' || command === 'z') return [];
    const first = Number(tokens[i]);
    const second = Number(tokens[i + 1]);
    i += 2;
    const relative = command === command.toLowerCase();
    x = relative ? x + first : first;
    y = relative ? y + second : second;
    points.push([x, y]);
    // a repeated coordinate pair after M continues as a line, per the SVG grammar
    if (command === 'M') command = 'L';
    else if (command === 'm') command = 'l';
  }
  return points;
}

// A shape the renderer did not emit must not take the exercise down with it: `run` would die on the
// first property read, the checks already recorded would be lost, and the tier would report a
// TypeError where it could have named the check that failed. NaN geometry fails every relation
// below by value, so the cell stays diagnostic.
const NOTHING = { left: NaN, right: NaN, top: NaN, bottom: NaN };

function boxAt(paths, index) {
  const path = paths[index];
  return path ? boxOf(path.d) : NOTHING;
}

function pointAt(points, index) {
  return points[index] ?? [NaN, NaN];
}

function boxOf(d) {
  const points = pointsOf(d);
  if (!points.length) return NOTHING;
  const xs = points.map(point => point[0]);
  const ys = points.map(point => point[1]);
  return {
    left: Math.min.apply(null, xs), right: Math.max.apply(null, xs),
    top: Math.min.apply(null, ys), bottom: Math.max.apply(null, ys),
  };
}

// pixel arithmetic lands on halves and thirds, so relations are compared at a tolerance rather than
// exactly - what must hold is the RELATION, not the rounding
function near(a, b, tolerance) {
  return Math.abs(a - b) <= (tolerance === undefined ? 0.5 : tolerance);
}

function textsOf(svg) {
  const found = [];
  const chunks = svg.split('<text');
  for (let i = 1; i < chunks.length; i++) {
    const end = chunks[i].indexOf('</text>');
    if (end === -1) continue;
    const open = chunks[i].slice(0, chunks[i].indexOf('>'));
    const matrix = /transform="translate\((?<values>[^)]*)\)"/.exec(open);
    const parts = matrix ? matrix.groups.values.trim().split(/[\s,]+/).map(Number) : null;
    found.push({
      text: chunks[i].slice(chunks[i].indexOf('>') + 1, end),
      at: parts && parts.length === 2 ? parts : null,
    });
  }
  return found;
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

  // --- the document itself
  check('svg: rendered at the requested size',
    svg.indexOf(`<svg width="${ WIDTH }" height="${ HEIGHT }"`), 0);
  check('svg: no NaN reached the output', /NaN/.test(svg), false);
  check('svg: the same option renders the same picture', normalize(second.svg), normalize(svg));
  check('svg: a changed datum renders a different one', normalize(variant.svg) === normalize(svg), false);

  // --- the bars: one per datum, and their heights ARE the data
  const bars = pathsOf(svg, 0);
  check('bars: a shape per datum', bars.length, VALUES.length);
  const shapes = bars.filter(bar => !bar.at);
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
  const symbols = pathsOf(svg, 1).filter(path => path.at).map(path => path.at);
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
  const texts = textsOf(svg);
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
  const regions = pathsOf(svg, 2);
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
