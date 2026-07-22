// A headless CodeMirror 6 / Lezer "project": the non-DOM half of a real code editor. It builds an
// EditorState over a source document, applies a sequence of transactions (mapping positions and a
// selection through them), parses the result with the Lezer JS grammar, reparses INCREMENTALLY from
// the previous tree after a further edit, classifies tokens with highlightTree, and parses CSS + HTML
// with their own grammars — then self-checks the outcome.
//
// Only the view-independent layer is used: `@codemirror/state` plus the Lezer runtime and grammars.
// `@codemirror/language` is deliberately NOT imported — not because it breaks headlessly (it doesn't;
// it only reaches for the DOM once an `EditorView` is constructed) but because it drags in
// `@codemirror/view`, ~1.1 MB that no check here ever executes. Parsing goes straight to Lezer, which
// is what CodeMirror delegates to anyway. Everything here is pure computation, so it runs in node AND
// down-compiles to ES5 — which is how the runtime tier verifies the project stays FUNCTIONAL after
// unplugin + Babel, not merely that it builds.
//
// Checks favour version-robust invariants (zero parse errors, incremental === full, ordered spans,
// semantic names) over magic node totals, so a grammar bump does not redden the suite spuriously.
import { EditorSelection, EditorState } from '@codemirror/state';
import { TreeFragment } from '@lezer/common';
import { classHighlighter, highlightTree } from '@lezer/highlight';
import { parser as cssParser } from '@lezer/css';
import { parser as htmlParser } from '@lezer/html';
import { parser as jsParser } from '@lezer/javascript';

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
    checks.push({ label, actual, expected, pass: JSON.stringify(actual) === JSON.stringify(expected) });
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
  // The document MUST exceed FOUR times Lezer's `bufferLength` — @lezer/lr only builds a
  // FragmentCursor when `stream.end - from > parser.bufferLength * 4`, i.e. above 4096 chars, not
  // above 1024. Below that it reuses nothing, the "incremental" parse silently degrades to a full
  // one, and every check below passes just as happily with `fragments = []`. `doc` is only ~280
  // chars; `SRC.repeat(24)` takes it to ~6.4k, comfortably clear (repeat(16) cleared 4096 by only
  // ~280 chars, and repeat(12) does not clear it at all). The doc-layer checks above stay on the
  // small `doc`, whose line count and depth they are calibrated to.
  const bigDoc = doc + SRC.repeat(24);
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

  // --- the other two grammars ---
  const css = survey(cssParser.parse(CSS_SRC));
  check('css_no_errors', css.errors, 0);
  check('css_parsed', css.nodes > 20, true);

  const html = survey(htmlParser.parse(HTML_SRC));
  check('html_no_errors', html.errors, 0);
  check('html_parsed', html.nodes > 20, true);

  return { checks };
}
