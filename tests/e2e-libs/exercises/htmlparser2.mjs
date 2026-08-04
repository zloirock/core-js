// A headless HTML/XML processing pipeline built out of the htmlparser2 stack: the tokenizer and
// parser (htmlparser2) feeding a DOM (domhandler), traversed and serialised (domutils,
// dom-serializer), queried with CSS selectors (css-select, css-what, nth-check) and with entities
// decoded and re-encoded (entities). 48 modules across ten packages, all pure computation — no DOM,
// no streams, no node built-ins — so it runs in node AND down-compiles to ES5.
//
// THIS IS THE SUITE'S TYPESCRIPT FIXTURE, and that is its reason to exist. The runtime tier builds
// these libraries from their own `src/**/*.ts` rather than from their published JS (the redirect is
// `TS_SOURCE_PACKAGES` in build.mjs); 42 of the 48 modules in the graph are `.ts`. The remaining six
// are the two entry modules plus domhandler, domelementtype and boolbase, none of which ship sources
// — so the graph is deliberately MIXED, which is what a real TypeScript project's node_modules looks
// like anyway.
//
// The point of feeding unplugin TypeScript is the `phase` axis. `pre` runs before Babel and its
// documented advantage is "original source with full semantic context"; over a graph of published JS
// that claim cannot be tested at all, because there is no TS anywhere in it, and on the other three
// fixtures `post` is a strict superset of `pre`. Here the two phases separate in BOTH directions, and
// the six snapshots pin both halves:
//   usage-global  pre 123 / post 133 / pre+post 134. `post` gains 11 from Babel's class helpers
//     (`es.reflect.construct`, `es.symbol.*`, `es.object.get-prototype-of` …). `pre` keeps one that
//     `post` structurally cannot see: `es.error.cause`, injected off the TYPE annotations
//     `onerror(error: Error)` in `Parser.ts` and `(error: Error | null) => void` in `index.ts` —
//     positions with no runtime existence, so once types are stripped there is nothing left to detect.
//     (Confirmed by injection origin, not inferred: both are htmlparser2 modules.)
//   usage-pure    pre 26 / post 39 / pre+post 40. The pre-only one is
//     `@core-js/pure/full/array/instance/includes`. `usage-pure` does NOT walk annotations
//     (`walkAnnotations: false`), so this is not the annotation walk above — it is type-driven
//     RECEIVER RESOLUTION: `context.includes(element)` in css-select's `:scope` filter and
//     `array.includes(node, index + 1)` in domutils' `uniqueSort` both declare `Node[]`, so `pre`
//     emits the array-specific `_includesMaybeArray`; at `post` the annotation is gone and all three
//     call sites fall back to the receiver-agnostic `@core-js/pure/full/instance/includes`.
// So `pre+post` is strictly LARGER than `post` here — the first fixture where that is true — and its
// two cells gate exactly that union.
//
// The exercise imports the BARE specifiers, so `check-exercise` (raw node, no bundler) runs against
// the published JS while the runtime tier builds the sources. Same implementation either way; the
// redirect belongs to the bundler, and keeping it there is what lets the self-check stay bundler-free.
//
// WHAT THE BLOCKS ARE FOR. As with the other fixtures, they are chosen so the LIBRARIES' own
// implementations reach for what IE11 lacks rather than this file doing it on their behalf:
// `new Map` / `new Set` behind htmlparser2's implied-end-tag, void-element and foreign-content tables
// (reached by `<li>`/`<tr>`/`<td>`/`<dt>`/`<option>`/`<p>` left unclosed, by `<br>`/`<img>`/`<hr>`,
// and by the `<svg>` block whose `clipPath` and `foreignObject` only keep their camel case if
// `svgTagNameAdjustments` ran); `Map#get` in the tokenizer's entity trie; `new WeakMap` in BOTH of
// css-select's result caches — `helpers/cache.ts` and the `cachedDescendant` in `general.ts`, which
// is only compiled when the selector carries an expensive subselector, hence `body :has(li.sel) li`;
// `Object.hasOwn` in five modules across four packages; `String.fromCodePoint` in htmlparser2's
// entity callback and `String#codePointAt` in entities' escaper; `Number.parseInt` in entities'
// base-36 trie decoder, in css-what's unicode escapes and in domutils' feed media attributes;
// `Number.isNaN` in css-what's `funescape`; `String#replaceAll` in dom-serializer's raw-attribute
// path, which needs `decodeEntities: false`; `String#startsWith`/`#endsWith`/`#includes` behind the
// `[a^=]` / `[a$=]` / `[a*=]` operators; and `Array#includes` in the parser's nested-`<form>` and SVG
// stack checks. Attributing each native call to its immediate stack frame, this reaches 49 distinct
// natives from library frames across 32 library modules, in eight of the ten packages — the two it
// misses, domelementtype and boolbase, are a constants table and two stub functions with no logic to
// reach. Against 29 for the obvious "parse, query, read the text" version.
//
// NAME COLLISIONS: domutils exports module-level functions called `find` and `filter`, whose names
// collide with `Array#find` / `Array#filter`. Called bare they are ordinary identifiers, so the
// collision block below reaches them through the `DomUtils` namespace instead — `DomUtils.find(…)`
// is a member expression that `usage-pure` rewrites, and the pure helper has to hand back domutils'
// function rather than the array method. On IE11 a wrong fallback there is fatal and the
// modern-realm pre-flight cannot see it.
//
// TYPED ARRAYS are present but only ever INDEXED: htmlparser2's `Sequences` (`Uint8Array` literals)
// and entities' decode tries (`Uint16Array` built by `decodeBase64`). No prototype method is called
// on either, so the structural `usage-pure` typed-array hole — the one that forced three.js to prune
// `KeyframeTrack#trim`, `radixSort` and friends — is never reached, and these `usage-pure` cells pass
// on real IE11. That contrast is deliberate: it is what makes the two fixtures say different things.
//
// ABSENT from the whole graph, so not chased and not chaseable: `Array.from`, `Array#find`,
// `Array#flat`, `Object.assign` / `.entries` / `.values`, `Number.isInteger`, `String#matchAll` and
// `Promise`. unplugin still injects several of them at `post`, out of Babel's helpers.
// DELIBERATELY EXCLUDED: `htmlparser2/WritableStream` and `/WebWritableStream` — node streams and
// WHATWG streams respectively, neither of which is stdlib core-js can polyfill.
//
// Checks assert structural invariants (element counts, tag names, decoded text, selector ASTs) rather
// than serialisation byte-for-byte, so a patch release that shifts whitespace handling does not
// redden the suite spuriously.
import { DomUtils, Parser, parseDocument, parseFeed } from 'htmlparser2';
import { compile, is, selectAll, selectOne } from 'css-select';
import {
  existsOne, filter, findOne, getAttributeValue, getChildren, getElements, getElementsByTagName,
  getInnerHTML, getName, getOuterHTML, getSiblings, getText, hasAttrib, innerText, prepend,
  removeElement, removeSubsets, replaceElement, textContent, uniqueSort,
} from 'domutils';
import {
  decodeHTML, decodeHTMLStrict, decodeXML, encodeHTML, encodeXML, escapeAttribute, escapeUTF8,
} from 'entities';
import { parse as parseSelector, stringify as stringifySelector } from 'css-what';

function eq(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// domhandler nodes are not DOM nodes - no `firstElementChild` - and reading `.children[0]` in a dozen
// places reads like DOM code that it is not. Go through domutils' accessor instead.
function firstChild(node) {
  return getChildren(node)[0];
}

// One page, and every fragment of it earns its place by driving a branch of the parser that a
// well-formed document would not: the unclosed `<li>`/`<td>`/`<dt>`/`<option>`/`<p>` runs go through
// the `openImpliesClose` Map, the void elements through the `voidElements` Set, `<svg>` through the
// foreign-content Set plus the `svgTagNameAdjustments` Map (which is the only reason `clipPath` and
// `foreignObject` keep their camel case), the repeated `data-dup` through `Object.hasOwn`, `<script>`
// through the RAWTEXT tokenizer state and its `Uint8Array` end-sequence, and the final paragraph
// through four different entity forms — named, decimal, the CP1252 remap that `&#128;` triggers, an
// astral hex escape, and a trailing `&amp` with no semicolon for the legacy path.
const PAGE = '<!doctype html>\n'
  + '<html lang="en"><head><title>T &amp; t</title><style>.a{color:red}</style></head>\n'
  + '<body>\n'
  + '  <ul id="list" class="a b"><li data-n="1">one &lt;x&gt;<li data-n="2" class="sel">two &#8212; dash<li data-n="3">three &copy;</ul>\n'
  + '  <table><tr><td>r1c1<td>r1c2<tr><td>r2c1<td>r2c2</table>\n'
  + '  <dl><dt>term<dd>def<dt>t2<dd>d2</dl>\n'
  + '  <select><option value="a">A<option value="b" selected>B</select>\n'
  + '  <p>first<p>second\n'
  + '  <div title=\'he said "hi"\' data-dup="1" data-dup="2">quoted</div>\n'
  + '  <img src="x.png" alt="an image"><br><hr>\n'
  + '  <svg viewBox="0 0 1 1"><clipPath id="c"><path d="M0 0"/></clipPath><foreignObject><div>inner</div></foreignObject></svg>\n'
  + '  <script>var s = 1 < 2 && "</scr" + "ipt>";</script>\n'
  + '  <p>tail &nbsp;text &#128; &#x1F600; &amp</p>\n'
  + '  <!-- a comment -->\n'
  + '</body></html>';

// An RSS item carrying a `media:content` element, which is what reaches `Number.parseInt` in
// domutils' feed reader — the numeric media attributes are the only place in that module that parses
// one. Without the media element the feed block would exercise nothing the DOM blocks do not.
const FEED = '<?xml version="1.0"?><rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">'
  + '<channel><title>Feed</title><link>http://example.com/</link>'
  + '<item><title>Post</title><link>http://example.com/1</link>'
  + '<media:content url="http://example.com/a.png" width="640" height="480" filesize="1024"/>'
  + '</item></channel></rss>';

export function run() {
  const checks = [];
  function check(label, actual, expected) {
    checks.push({ label, actual, expected, pass: eq(actual, expected) });
  }

  const doc = parseDocument(PAGE);

  // --- parser: implied end tags, void elements, foreign content ---
  check('list_items', selectAll('#list > li', doc).length, 3);
  check('table_cells', selectAll('td', doc).map(el => textContent(el)), ['r1c1', 'r1c2', 'r2c1', 'r2c2']);
  check('dl_pairs', selectAll('dt, dd', doc).map(el => getName(el)), ['dt', 'dd', 'dt', 'dd']);
  check('options', selectAll('option', doc).map(el => getAttributeValue(el, 'value')), ['a', 'b']);
  check('paragraphs', selectAll('p', doc).length, 3);
  check('void_elements', selectAll('img, br, hr', doc).map(el => getName(el)), ['img', 'br', 'hr']);
  check('svg_adjusted', selectAll('svg *', doc).map(el => getName(el)), ['clipPath', 'path', 'foreignObject', 'div']);
  check('foreign_integration', textContent(selectOne('svg div', doc)), 'inner');
  check('script_rawtext', textContent(selectOne('script', doc)).indexOf('</scr') > 0, true);
  // the parser drops the SECOND `data-dup` — that decision is an `Object.hasOwn` call in Parser.ts
  check('dup_attribute', getAttributeValue(selectOne('div[title]', doc), 'data-dup'), '1');
  check('comment_kept', filter(n => n.type === 'comment', doc.children, true).length, 1);

  // --- entities through the tokenizer ---
  check('entity_named', textContent(selectOne('title', doc)), 'T & t');
  check('entity_numeric', textContent(selectAll('#list li', doc)[1]), 'two — dash');
  check('entity_cp1252', textContent(selectAll('p', doc)[2]).indexOf('€') > 0, true);
  check('entity_astral', textContent(selectAll('p', doc)[2]).indexOf('😀') > 0, true);

  // --- domutils ---
  const items = getElementsByTagName('li', doc, true);
  check('by_tag_name', items.length, 3);
  check('has_attrib', hasAttrib(items[1], 'class'), true);
  check('siblings', getSiblings(items[0]).length, 3);
  check('children_count', getChildren(selectOne('#list', doc)).length, 3);
  check('find_one', getName(findOne(el => el.name === 'td', doc.children, true)), 'td');
  check('exists_one', existsOne(el => el.name === 'table', doc.children), true);
  check('get_text', getText(selectOne('title', doc)), 'T & t');
  check('inner_text', innerText(selectOne('#list', doc)).indexOf('one <x>'), 0);
  // both of domutils' `Array#includes` sites: `uniqueSort` de-duplicates with
  // `array.includes(node, index + 1)`, `removeSubsets` with `nodes.includes(ancestor)`
  check('unique_sort', uniqueSort([items[2], items[0], items[0], items[1]]).length, 3);
  check('remove_subsets', removeSubsets([selectOne('#list', doc), items[0]]).length, 1);
  check('legacy_get_elements', getElements({ tag_name: 'td' }, doc, true).length, 4);

  // --- name collisions ---
  // Reached through the NAMESPACE on purpose. `filter(...)` above is a bare identifier that nothing
  // rewrites; `DomUtils.filter(...)` is a member expression whose name matches `Array#filter`, so
  // `usage-pure` rewrites it and the pure helper must hand back domutils' function. Same for `find`.
  /* eslint-disable array-func/no-unnecessary-this-arg -- these are domutils' `find(test, nodes,
     recurse, limit)` / `filter(test, node, recurse, limit)`, not `Array#find` / `Array#filter`; the
     lint reading the second argument as a `thisArg` IS the collision under test */
  check('collision_find', getName(DomUtils.find(n => n.name === 'table', doc.children, true, 1)[0]), 'table');
  check('collision_filter', DomUtils.filter(n => n.name === 'li', doc.children, true).length, 3);
  /* eslint-enable array-func/no-unnecessary-this-arg -- end of the domutils namespace block */

  // --- dom-serializer ---
  check('outer_html_quotes', getOuterHTML(selectOne('div[title]', doc)).indexOf('&quot;') > 0, true);
  check('inner_html', getInnerHTML(selectOne('#list', doc)).indexOf('<li'), 0);
  // `decodeEntities: false` swaps the attribute encoder for `replaceQuotes`, the graph's only
  // `String#replaceAll`; `xmlMode: 'foreign'` is what consults dom-serializer's two name Maps
  check('outer_html_raw', getOuterHTML(selectOne('div[title]', doc), { decodeEntities: false }).indexOf('&quot;') > 0, true);
  check('foreign_render', getOuterHTML(selectOne('svg', doc), { xmlMode: 'foreign' }).indexOf('viewBox') > 0, true);
  check('xml_cdata', textContent(firstChild(parseDocument('<r><![CDATA[<x> & y]]></r>', { xmlMode: true }))), '<x> & y');

  // --- css-select / css-what / nth-check ---
  check('attr_prefix', selectAll('li[data-n^="2"]', doc).length, 1);
  check('attr_suffix', selectAll('img[src$=".png"]', doc).length, 1);
  check('attr_substring', selectAll('img[alt*="imag"]', doc).length, 1);
  check('nth_child', textContent(selectOne('#list li:nth-child(3)', doc)), 'three ©');
  check('nth_of_type', selectAll('#list li:nth-last-of-type(2n+1)', doc).length, 2);
  check('pseudo_not', selectAll('#list li:not(.sel)', doc).length, 2);
  check('pseudo_contains', selectAll('li:contains("dash")', doc).length, 1);
  check('pseudo_icontains', selectAll('li:icontains("DASH")', doc).length, 1);
  check('pseudo_has', selectAll('ul:has(li.sel)', doc).length, 1);
  check('is_match', is(items[1], 'li.sel[data-n="2"]'), true);
  check('compiled_query', selectAll(compile('li.sel'), doc).length, 1);
  check('descendant_cache', selectAll('body #list li', doc).length, 3);
  // `:scope` has three implementations picked by context length; only the >= 2 one reaches
  // `context.includes(element)`, which is one of the two `Node[]`-annotated receivers the header is about
  check('scope_context', selectAll(':scope', items.slice(0, 2), { context: items.slice(0, 2) }).length, 2);
  check('lang_match', is(selectOne('#list', doc), ':lang(en)'), true);
  check('lang_reject', is(selectOne('#list', doc), ':lang(fr)'), false);
  // `:has()` marks the selector as carrying an expensive subselector, which is the only thing that
  // compiles `general.ts`'s `cachedDescendant` — the second of css-select's two `new WeakMap` sites
  check('expensive_descendant', selectAll('body :has(li.sel) li', doc).length, 3);

  check('selector_ast', parseSelector('a.b > c')[0].length, 4);
  check('selector_namespace', parseSelector('*|div')[0][0].type, 'tag');
  check('selector_comment', parseSelector('div/* c */ span')[0].length, 3);
  // an escape above U+FFFF takes `funescape`'s surrogate-pair branch, past `Number.parseInt` and
  // the `Number.isNaN` guard that rejects a non-codepoint
  check('selector_escape', parseSelector('#\\1F600 x')[0][0].value, '\u{1F600}');
  check('selector_stringify', stringifySelector(parseSelector('a[href^="x"]')), 'a[href^="x"]');

  // --- entities, directly ---
  check('decode_html', decodeHTML('&amp;&copy;&nbsp;&#x1F600;&amp'), '&© 😀&');
  check('decode_html_strict', decodeHTMLStrict('&amp;&amp'), '&&amp');
  check('decode_xml', decodeXML('&lt;a&gt;'), '<a>');
  check('encode_html', encodeHTML('<é & 😀>'), '&lt;&eacute; &amp; &#x1f600;&gt;');
  check('encode_xml', encodeXML('<a & "b">'), '&lt;a &amp; &quot;b&quot;&gt;');
  check('escape_utf8', escapeUTF8('a<b&c'), 'a&lt;b&amp;c');
  check('escape_attribute', escapeAttribute('a"b'), 'a&quot;b');

  // --- feeds: Number.parseInt on media attributes ---
  const feed = parseFeed(FEED);
  check('feed_title', feed.title, 'Feed');
  check('feed_media_width', feed.items[0].media[0].width, 640);

  // --- streaming parser callbacks ---
  const events = [];
  const streamed = new Parser({
    onopentag(name, attribs) { events.push(`open:${ name }${ attribs.id ? `#${ attribs.id }` : '' }`); },
    ontext(t) { if (t.trim()) events.push(`text:${ t.trim() }`); },
    onclosetag(name) { events.push(`close:${ name }`); },
  });
  streamed.write('<div id="d">hi<span>s</span></div>');
  streamed.end();
  check('stream_events', events, ['open:div#d', 'text:hi', 'open:span', 'text:s', 'close:span', 'close:div']);

  // --- tree mutation: domutils rewires the sibling/parent links by hand ---
  const detached = parseDocument('<a><b>x</b><c>y</c></a>');
  const root = firstChild(detached);
  replaceElement(selectOne('b', detached), firstChild(parseDocument('<z>z</z>')));
  check('replace_element', getName(firstChild(root)), 'z');
  prepend(firstChild(root), firstChild(parseDocument('<w/>')));
  check('prepend', getChildren(root).length, 3);
  removeElement(firstChild(root));
  check('remove_element', getChildren(root).length, 2);

  return { checks };
}
