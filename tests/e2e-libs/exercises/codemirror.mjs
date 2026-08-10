// A headless CodeMirror 6 / Lezer "project": the non-DOM half of a real code editor. It builds an
// EditorState over a source document, applies a sequence of transactions (mapping positions and a
// selection through them), parses the result with the Lezer JS grammar, reparses INCREMENTALLY from
// the previous tree after a further edit, classifies tokens with highlightTree, and parses CSS + HTML
// with their own grammars - then self-checks the outcome.
//
// Only the view-independent layer is used: `@codemirror/state` plus the Lezer runtime and grammars.
// `@codemirror/language` is deliberately NOT imported - not because it breaks headlessly (it doesn't;
// it only reaches for the DOM once an `EditorView` is constructed) but because it drags in
// `@codemirror/view`, ~1.1 MB that no check here ever executes. Parsing goes straight to Lezer, which
// is what CodeMirror delegates to anyway. Everything here is pure computation, so it runs in node AND
// down-compiles to ES5 - which is how the runtime tier verifies the project stays FUNCTIONAL after
// unplugin + Babel, not merely that it builds.
//
// WHAT THIS EXERCISE IS FOR, beyond "codemirror still runs". The IE11 leg only proves per-site
// polyfill detection for the code it actually EXECUTES: under `usage-pure` a missed rewrite stays a
// native call, and a native call only fails if something reaches it. So the blocks below are chosen
// to make CODEMIRROR'S AND LEZER'S OWN implementations reach for what IE11 lacks, rather than doing
// it here on their behalf: `Symbol.iterator` on `Text` (and on its three cursor classes),
// `new Set` in `RangeSet.compare` - the only one in the whole graph, and reaching it needs two sets
// and a `ChangeSet` - three more `new Map` sites in the facet/compartment resolver, `JSON.stringify`
// in `TreeBuffer#childString` (via `Tree#toString`), `Array#join`/`#concat`/`#every` in lezer's tree
// and tag machinery, and `Array#filter` in `RangeSet.compare`. Coverage is counted by wrapping the
// natives and attributing each call to its immediate stack frame, so only the calls made from
// `@codemirror` / `@lezer` frames count. The `Text` iterator does not show up in that instrument
// because it is the library's own method, and is confirmed separately by wrapping it.
//
// Two NAME COLLISIONS ride along, and both are the interesting kind. `SelectionRange#flags` collides
// with `RegExp#flags`, and the `RangeSet` chunk's own `findIndex(pos, side, end, startAt)` collides
// with `Array#findIndex`; `usage-pure` rewrites both call sites, and the pure helper has to hand back
// codemirror's own member rather than the array/regexp one. On IE11 a broken fallback there is fatal
// and the modern-realm pre-flight cannot see it.
//
// The unicode block is a fallback test rather than a polyfill test. `@codemirror/state` implements
// `codePointAt` / `fromCodePoint` by hand out of `charCodeAt` / `String.fromCharCode` - it never
// touches the ES6 natives - and it builds its word-character regexp from `\p{Alphabetic}` inside a
// `try`/`catch` that IE11 cannot parse, so on the target the categorizer runs its manual
// per-character path. `char_categories` proves that path still answers correctly.
//
// Not reachable, and deliberately not chased: `String.fromCodePoint` in `@lezer/lr` sits behind a
// `verbose` flag read off `process.env.LOG`, which no browser satisfies. unplugin still injects it.
//
// Checks favour version-robust invariants (zero parse errors, incremental === full, ordered spans,
// semantic names) over magic node totals, so a grammar bump does not redden the suite spuriously.
import {
  Annotation, ChangeSet, CharCategory, Compartment, EditorSelection, EditorState, Facet, MapMode,
  Prec, RangeSet, RangeSetBuilder, RangeValue, StateEffect, StateField, Text,
  codePointAt, codePointSize, combineConfig, countColumn, findClusterBreak, findColumn, fromCodePoint,
} from '@codemirror/state';
import { IterMode, NodeProp, NodeWeakMap, TreeFragment, parseMixed } from '@lezer/common';
import { classHighlighter, getStyleTags, highlightTree, tagHighlighter, tags } from '@lezer/highlight';
import { parser as cssParser } from '@lezer/css';
import { configureNesting, parser as htmlParser } from '@lezer/html';
import { parser as jsParser } from '@lezer/javascript';

function eq(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const SRC = `export function greet(name) {
  const parts = [name, 'world'];
  return parts.join(', ');
}

class Counter {
  constructor(start = 0) {
    this.value = start;
  }
  inc(by) {
    this.value += by;
    return this.value;
  }
}

const double = x => x * 2;
`;

const HEADER = '// header\n';
const TAIL = '\nconst tail = 1;\n';
const INSERT = 'const extra = 42;\n';

const CSS_SRC = 'body { color: red; margin: 0 auto; }\n.a > .b:hover { top: 1px }\n';
const HTML_SRC = '<!doctype html><html><body><p class="x">hi</p><ul><li>a</li></ul></body></html>';

// A RangeSet payload. Subclassing `RangeValue` is how the library expects callers to supply one, and
// it is what makes `RangeSet.compare` reach its `new Set` - the only one in the whole graph.
class Marker extends RangeValue {
  constructor(tag) {
    super();
    this.tag = tag;
  }
  eq(other) {
    return other.tag === this.tag;
  }
}

// A facet and a field, used by the configuration and JSON blocks below.
const total = Facet.define({ combine: values => values.reduce((a, b) => a + b, 0) });
const editCount = StateField.define({
  create: () => 0,
  update: (value, tr) => value + (tr.docChanged ? 1 : 0), // `changes.length` is the OLD doc length, not an edit count
  toJSON: value => value,
  fromJSON: json => json,
});

// Serialize a tree to a comparable shape: every node as `name:from-to`, in document order.
function shape(tree) {
  const out = [];
  tree.iterate({
    enter(node) {
      out.push(`${ node.name }:${ node.from }-${ node.to }`);
    },
  });
  return out.join('|');
}

// Walk a tree once, collecting the statistics the checks below assert on.
function survey(tree) {
  const byType = {};
  let nodes = 0;
  let errors = 0;
  let depth = 0;
  let maxDepth = 0;
  tree.iterate({
    enter(node) {
      nodes++;
      depth++;
      if (depth > maxDepth) maxDepth = depth;
      if (node.type.isError) errors++;
      byType[node.name] = (byType[node.name] || 0) + 1;
    },
    leave() {
      depth--;
    },
  });
  return { nodes, errors, maxDepth, byType };
}

export function run() {
  const checks = [];
  function check(label, actual, expected) {
    checks.push({ label, actual, expected, pass: eq(actual, expected) });
  }

  // --- document layer: state + transactions ---
  let state = EditorState.create({ doc: SRC });
  check('doc_length', state.doc.length, SRC.length);
  check('doc_lines', state.doc.lines, 17);
  check('line_text', state.doc.line(6).text, 'class Counter {');

  // an anchor we will track through the edits
  const anchor = SRC.indexOf('class Counter');
  const cursor = EditorSelection.cursor(anchor);

  const tr1 = state.update({ changes: { from: 0, to: 0, insert: HEADER } });
  state = tr1.state;
  // invariant: the mapped position still points at the same text in the NEW document
  const mapped = tr1.changes.mapPos(anchor);
  const anchorInNewDoc = state.doc.toString().indexOf('class Counter');
  check('mapped_pos_tracks_text', anchorInNewDoc, mapped);
  // map the selection RANGE through the change (not the raw int) and check it lands on the text
  check('mapped_selection', cursor.map(tr1.changes).from, anchorInNewDoc);

  const end = state.doc.length;
  state = state.update({ changes: { from: end, to: end, insert: TAIL } }).state;
  check('doc_length_after_edits', state.doc.length, SRC.length + HEADER.length + TAIL.length);
  check('doc_lines_after_edits', state.doc.lines, 20);

  const doc = state.doc.toString();
  check('doc_roundtrip', doc, HEADER + SRC + TAIL);

  // --- Text's own iterators: the iterator method drives `Text.prototype[Symbol.iterator]`, the
  // explicit cursors drive `RawTextCursor` / `PartialTextCursor` / `LineCursor` ---
  // The iterator is invoked directly rather than with `for...of`: `for...of` would make Babel emit
  // `_createForOfIteratorHelper` into THIS module, and at the `pre` phase unplugin never sees Babel's
  // helpers - so the cell's colour would end up reporting the exercise's syntax rather than anything
  // about codemirror. Calling `[Symbol.iterator]()` drives exactly the same library method
  // (`Text.prototype[Symbol.iterator]`, which returns `this.iter()`) with nothing of ours in between.
  function drain(textCursor) {
    const seen = [];
    while (!textCursor.next().done) seen.push(textCursor.value);
    return seen;
  }
  const chunks = Text.of(['one', 'two', 'three']);
  check('text_symbol_iterator', drain(chunks[Symbol.iterator]()), ['one', '\n', 'two', '\n', 'three']);
  check('text_iter', drain(Text.of(['abc', 'def']).iter()), ['abc', '\n', 'def']);
  check('text_iter_range', drain(Text.of(['hello', 'world']).iterRange(2, 8)), ['llo', '\n', 'wo']);
  check('text_iter_lines', drain(Text.of(['l1', 'l2', 'l3']).iterLines(2, 4)), ['l2', 'l3']);
  const twoLines = Text.of(['abc', 'def']);
  check('text_ops', [twoLines.length, twoLines.lines, twoLines.sliceString(1, 5), twoLines.lineAt(4).number], [7, 2, 'bc\nd', 2]);
  check('text_replace', twoLines.replace(1, 3, Text.of(['XY'])).toString(), 'aXY\ndef');

  // --- unicode helpers: String#codePointAt and String.fromCodePoint inside @codemirror/state ---
  const astral = codePointAt('\u{1F600}x', 0);
  check('unicode_code_point', [astral, codePointSize(astral), fromCodePoint(astral), fromCodePoint(0x41)], [0x1F600, 2, '\u{1F600}', 'A']);
  // a combining acute: one grapheme cluster spanning two code units
  check('unicode_cluster_break', [findClusterBreak('a\u0301bc', 0), findClusterBreak('a\u0301bc', 2)], [2, 3]);
  check('unicode_columns', [countColumn('\tab', 4), countColumn('abc', 4), findColumn('\tab', 5, 4)], [6, 3, 2]);

  // --- character categories. The library builds its word-char regexp from a unicode property escape
  // inside a try/catch; IE11 cannot parse that, so there it answers from the manual fallback path ---
  const catState = EditorState.create({ doc: 'hello world_x 42' });
  const categorize = catState.charCategorizer(0);
  check('char_categories', [categorize('a'), categorize(' '), categorize('+')], [CharCategory.Word, CharCategory.Space, CharCategory.Other]);
  const word = EditorState.create({ doc: 'hello world' }).wordAt(3);
  check('char_word_at', [word.from, word.to], [0, 5]);

  // --- RangeSet: chunked interval storage. `compare` is the only `new Set` in the whole graph ---
  const marks = RangeSet.of([new Marker('a').range(0, 2), new Marker('b').range(4, 6)]);
  const marksSeen = [];
  const markCursor = marks.iter();
  while (markCursor.value) {
    marksSeen.push([markCursor.from, markCursor.to, markCursor.value.tag]);
    markCursor.next();
  }
  check('range_of_and_iter', [marks.size, marksSeen], [2, [[0, 2, 'a'], [4, 6, 'b']]]);

  const builder = new RangeSetBuilder();
  builder.add(0, 1, new Marker('x'));
  builder.add(3, 5, new Marker('y'));
  const built = [];
  builder.finish().between(0, 10, (from, to, value) => { built.push([from, to, value.tag]); });
  check('range_builder', built, [[0, 1, 'x'], [3, 5, 'y']]);

  const changed = RangeSet.of([new Marker('a').range(0, 2), new Marker('c').range(4, 6)]);
  const differing = [];
  RangeSet.compare([marks], [changed], ChangeSet.empty(8), {
    compareRange(from, to) { differing.push([from, to]); },
    comparePoint() { /* these sets hold no point values */ },
  });
  check('range_compare', differing, [[4, 6]]);

  const shifted = marks.map(ChangeSet.of({ from: 0, to: 0, insert: 'xx' }, 10));
  const shiftedSeen = [];
  shifted.between(0, 20, (from, to) => { shiftedSeen.push([from, to]); });
  check('range_map', shiftedSeen, [[2, 4], [6, 8]]);

  const rangeSpans = [];
  RangeSet.spans([RangeSet.of([new Marker('a').range(1, 3)])], 0, 5, {
    span(from, to, active) { rangeSpans.push([from, to, active.length]); },
    point() { /* no point values */ },
  });
  check('range_spans', rangeSpans, [[0, 1, 0], [1, 3, 1], [3, 5, 0]]);

  // --- configuration: facets, precedence, fields, compartments ---
  check('config_facet_combine', EditorState.create({ doc: 'x', extensions: [total.of(1), total.of(2), total.of(4)] }).facet(total), 7);
  const orderFacet = Facet.define();
  const precState = EditorState.create({ extensions: [orderFacet.of('normal'), Prec.high(orderFacet.of('high')), Prec.low(orderFacet.of('low'))] });
  check('config_precedence', precState.facet(orderFacet), ['high', 'normal', 'low']);
  let fieldState = EditorState.create({ doc: 'abc', extensions: [editCount] });
  fieldState = fieldState.update({ changes: { from: 0, to: 0, insert: 'zz' } }).state;
  check('config_state_field', fieldState.field(editCount), 1);
  const compartment = new Compartment();
  let compState = EditorState.create({ extensions: [compartment.of(total.of(5))] });
  const beforeReconfigure = compState.facet(total);
  compState = compState.update({ effects: compartment.reconfigure(total.of(9)) }).state;
  check('config_compartment', [beforeReconfigure, compState.facet(total)], [5, 9]);
  check('config_combine', combineConfig([{ a: 1 }, { b: 2 }], { a: 0, b: 0, c: 3 }), { a: 1, b: 2, c: 3 });
  const note = Annotation.define();
  const bump = StateEffect.define();
  const annotated = EditorState.create({ doc: 'q' }).update({ annotations: note.of('hi'), effects: bump.of(7) });
  check('config_annotation_effect', [annotated.annotation(note), annotated.effects.map(e => e.is(bump) && e.value)], ['hi', [7]]);

  // --- JSON round-trips ---
  const fieldSpec = { count: editCount };
  let jsonState = EditorState.create({ doc: 'hello', selection: EditorSelection.single(1, 3), extensions: [editCount] });
  jsonState = jsonState.update({ changes: { from: 5, to: 5, insert: '!' } }).state;
  const backState = EditorState.fromJSON(jsonState.toJSON(fieldSpec), { extensions: [editCount] }, fieldSpec);
  check('json_state_roundtrip', [backState.doc.toString(), backState.selection.main.from, backState.selection.main.to, backState.field(editCount)], ['hello!', 1, 3, 1]);
  const changeJson = ChangeSet.fromJSON(ChangeSet.of([{ from: 1, to: 2, insert: 'X' }], 5).toJSON());
  check('json_changeset_roundtrip', [changeJson.length, changeJson.newLength, changeJson.apply(Text.of(['abcde'])).toString()], [5, 5, 'aXcde']);
  const selBack = EditorSelection.fromJSON(EditorSelection.create([EditorSelection.range(0, 2), EditorSelection.cursor(4)], 1).toJSON());
  check('json_selection_roundtrip', [selBack.ranges.length, selBack.mainIndex, selBack.main.from], [2, 1, 4]);

  // --- ChangeSet algebra ---
  const base = Text.of(['abcdef']);
  const first = ChangeSet.of({ from: 1, to: 2, insert: 'X' }, 6);
  const composed = first.compose(ChangeSet.of({ from: 3, to: 3, insert: 'Y' }, first.newLength));
  const appliedDoc = composed.apply(base).toString();
  check('change_compose', appliedDoc, 'aXcYdef');
  check('change_invert', composed.invert(base).apply(Text.of([appliedDoc])).toString(), 'abcdef');
  const prefix = ChangeSet.of({ from: 0, to: 0, insert: 'ab' }, 4);
  const gaps = [];
  prefix.iterGaps((posA, posB, len) => gaps.push([posA, posB, len]));
  const changeList = [];
  prefix.iterChanges((fromA, toA, fromB, toB, inserted) => changeList.push([fromA, toA, fromB, toB, inserted.toString()]));
  check('change_gaps_and_changes', [gaps, changeList], [[[0, 2, 4]], [[0, 0, 0, 2, 'ab']]]);
  const deletion = ChangeSet.of({ from: 2, to: 4, insert: '' }, 8);
  check('change_map_modes', [deletion.mapPos(3), deletion.mapPos(3, -1, MapMode.TrackDel), deletion.mapPos(6)], [2, null, 4]);

  // --- parse layer ---
  const tree = jsParser.parse(doc);
  const stats = survey(tree);
  check('parse_no_errors', stats.errors, 0);
  check('tree_covers_doc', tree.length, doc.length);
  check('function_decls', stats.byType.FunctionDeclaration, 1);
  check('class_decls', stats.byType.ClassDeclaration, 1);
  check('method_decls', stats.byType.MethodDeclaration, 2);
  check('var_decls', stats.byType.VariableDeclaration, 3);
  // an inequality, not the exact 9: max nesting depth is a grammar-internal number that shifts when
  // @lezer/javascript restructures a node, and this file's policy (see header) is version-robust
  // invariants. What it actually cares about is that the parse descended into the class body.
  check('deeply_nested_tree', stats.maxDepth >= 8, true);

  // top-level declared names, read back out of the source by node position
  const names = [];
  tree.iterate({
    enter(node) {
      if (node.name === 'FunctionDeclaration' || node.name === 'ClassDeclaration') {
        const id = node.node.getChild('VariableDefinition') || node.node.getChild('VariableName');
        if (id) names.push(doc.slice(id.from, id.to));
      }
    },
  });
  check('declared_names', names, ['greet', 'Counter']);

  // --- incremental reparse: the real editor invariant ---
  // The document MUST exceed FOUR times Lezer's `bufferLength` - @lezer/lr only builds a
  // FragmentCursor when `stream.end - from > parser.bufferLength * 4`, i.e. above 4096 chars, not
  // above 1024. Below that it reuses nothing, the "incremental" parse silently degrades to a full
  // one, and every check below passes just as happily with `fragments = []`. `doc` is only ~280
  // chars; `SRC.repeat(24)` takes it to ~6.4k, comfortably clear (repeat(16) cleared 4096 by only
  // ~280 chars, and repeat(12) does not clear it at all). The doc-layer checks above stay on the
  // small `doc`, whose line count and depth they are calibrated to.
  // built with a loop rather than `SRC.repeat(24)`: `String#repeat` appears nowhere in the
  // codemirror/lezer graph, so calling it here would inject a polyfill that only THIS file needs -
  // the opposite of what the fixture is for.
  let padding = '';
  for (let i = 0; i < 24; i++) padding += SRC;
  const bigDoc = doc + padding;
  const bigTree = jsParser.parse(bigDoc);
  const editAt = bigDoc.lastIndexOf('const double');
  const tr3 = EditorState.create({ doc: bigDoc }).update({ changes: { from: editAt, to: editAt, insert: INSERT } });
  const newDoc = tr3.state.doc.toString();
  const ranges = [];
  tr3.changes.iterChangedRanges((fromA, toA, fromB, toB) => ranges.push({ fromA, toA, fromB, toB }));
  check('changed_ranges', ranges, [{ fromA: editAt, toA: editAt, fromB: editAt, toB: editAt + INSERT.length }]);

  let fragments = TreeFragment.addTree(bigTree);
  fragments = TreeFragment.applyChanges(fragments, ranges);
  // NOTE deliberately not asserted here: `applyChanges` is a pure function of the change ranges,
  // computed before the parse and never observed by it, so every property of `fragments` alone
  // (length, extent) holds even for fragments built from a completely unrelated tree. The only
  // assertion that can distinguish reuse from a full reparse is the step count below.

  // the load-bearing assertion: the fragmented parse does strictly LESS work than the cold one.
  // Nothing above observes the parse itself, so this is what proves reuse actually happened.
  function parseSteps(src, frags) {
    const p = jsParser.startParse(src, frags);
    let n = 0;
    while (!p.advance()) n++;
    return n;
  }
  check('incremental_reuses_fragments', parseSteps(newDoc, fragments) < parseSteps(newDoc, []), true);

  const incremental = jsParser.parse(newDoc, fragments);
  const full = jsParser.parse(newDoc);
  check('incremental_matches_full', shape(incremental) === shape(full), true);
  check('incremental_no_errors', survey(incremental).errors, 0);
  check('incremental_covers_doc', incremental.length, newDoc.length);

  // --- highlight layer (pure: emits ranges + class names, no DOM) ---
  const spans = [];
  highlightTree(tree, classHighlighter, (from, to, classes) => spans.push({ from, to, classes }));
  // a real count, not `> 0`: highlightTree degrading to one whole-document span would satisfy that
  // while asserting nothing about tokenisation. (The ordering check below is separately guarded by
  // seeding `ordered` from `spans.length > 1`, since its loop never runs for <= 1 span.)
  check('highlight_span_count', spans.length > 20, true);

  let ordered = spans.length > 1;
  for (let i = 1; i < spans.length; i++) {
    if (spans[i].from < spans[i - 1].to) ordered = false;
  }
  check('highlight_spans_ordered', ordered, true);

  const tokens = spans.slice(0, 4).map(s => [doc.slice(s.from, s.to), s.classes]);
  check('highlight_tokens', tokens, [
    ['// header', 'tok-comment'],
    ['export', 'tok-keyword'],
    ['function', 'tok-keyword'],
    ['greet', 'tok-variableName tok-definition'],
  ]);

  // --- @lezer/common tree utilities ---
  // `Tree#toString` runs the node names through JSON.stringify whenever one is not a bare word
  check('tree_to_string', jsParser.parse('let x = 1;').toString().slice(0, 30), 'Script(VariableDeclaration(let');
  const weak = new NodeWeakMap();
  const { firstChild } = tree.topNode;
  weak.set(firstChild, 'tagged');
  check('tree_node_weak_map', [weak.get(firstChild), weak.get(tree.topNode) === undefined], ['tagged', true]);
  function walkCount(treeCursor) {
    let n = 0;
    do n++; while (treeCursor.next());
    return n;
  }
  // `bigTree`, not `tree`, and deliberately so. `doc` is ~280 chars - under lezer's
  // `DefaultBufferLength` (1024) - so it parses into a single `TreeBuffer` with no anonymous nodes at
  // all, and BOTH modes walk the identical set no matter how broken `TreeCursor` is: measured 107 vs
  // 107. Any assertion over those two numbers is true by construction, which is what `>=` and then
  // `===` both were. `bigDoc` is ~6.4k, well past the threshold, so anonymous nodes genuinely exist
  // and `IncludeAnonymous` really does surface more of them (2488 vs 2483) - a strict inequality with
  // a real failing side. The second half then pins the walk against the same tree counted through a
  // different API (`survey` uses `tree.iterate`), so a cursor that stops early reddens instead of
  // agreeing with itself.
  check('tree_iter_modes', [
    walkCount(bigTree.cursor(IterMode.IncludeAnonymous)) > walkCount(bigTree.cursor()),
    walkCount(tree.cursor()) === survey(tree).nodes,
  ], [true, true]);
  // offset 6 sits inside the leading `// header` line
  check('tree_resolve', tree.resolveInner(6, 1).name, 'LineComment');
  // a real NodeProp lookup on a node TYPE, not a truthiness test on the prop object: `closedBy`
  // resolves on the opening bracket of the function's parameter list
  let bracket = null;
  tree.iterate({
    enter(node) {
      const closes = node.type.prop(NodeProp.closedBy);
      if (closes && !bracket) bracket = [node.name, closes];
    },
  });
  check('tree_node_prop', bracket, ['(', [')']]);
  // `configure` clones the parser through Object.assign(Object.create(LRParser.prototype), ...)
  const configured = jsParser.configure({ strict: false });
  check('tree_parser_configure', [configured !== jsParser, configured.parse('let y = 2;').length], [true, 10]);

  // --- mixed-language parsing: one HTML parse nesting the JS and CSS grammars ---
  const MIXED_SRC = '<html><style>a{color:red}</style><script>let z = 1;</script></html>';
  const mixedParser = htmlParser.configure({
    wrap: parseMixed(node => {
      if (node.name === 'ScriptText') return { parser: jsParser };
      if (node.name === 'StyleText') return { parser: cssParser };
      return null;
    }),
  });
  const mixedNames = [];
  mixedParser.parse(MIXED_SRC).iterate({ enter(node) { mixedNames.push(node.name); } });
  check('mixed_nests_js_and_css', [mixedNames.indexOf('VariableDefinition') >= 0, mixedNames.indexOf('Declaration') >= 0], [true, true]);
  const nestedNames = [];
  htmlParser.configure({ wrap: configureNesting([{ tag: 'script', parser: jsParser }]) })
    .parse('<script>let q = 3;</script>').iterate({ enter(node) { nestedNames.push(node.name); } });
  check('mixed_configure_nesting', nestedNames.indexOf('VariableDefinition') >= 0, true);

  // --- a second highlighter, built from tags rather than the stock class map ---
  const custom = tagHighlighter([{ tag: tags.keyword, class: 'kw' }, { tag: tags.number, class: 'num' }]);
  const customSpans = [];
  highlightTree(jsParser.parse('let n = 42;'), custom, (from, to, cls) => customSpans.push([from, to, cls]));
  check('hl_custom_tags', customSpans, [[0, 3, 'kw'], [8, 10, 'num']]);
  check('hl_style_tags', getStyleTags(tree.resolveInner(0, 1)) !== undefined, true);

  // --- the other two grammars ---
  const css = survey(cssParser.parse(CSS_SRC));
  check('css_no_errors', css.errors, 0);
  check('css_parsed', css.nodes > 20, true);

  const html = survey(htmlParser.parse(HTML_SRC));
  check('html_no_errors', html.errors, 0);
  check('html_parsed', html.nodes > 20, true);

  return { checks };
}
