// A headless HTML/XML pipeline over the htmlparser2 stack - parser, DOM, traversal, serialisation,
// CSS selectors, entity decoding - a wide graph of small modules across ten packages, all pure
// computation, so it runs in node AND down-compiles to ES5.
//
// THIS IS THE SUITE'S TYPESCRIPT FIXTURE and that is its reason to exist: the runtime tier builds
// these libraries from their own `src/**/*.ts` (`TS_SOURCE_PACKAGES` in ts-sources.mjs) while the
// packages shipping no sources stay JS, so the graph is deliberately mixed. Here alone the phases
// separate in BOTH directions - `pre` resolves receivers from type annotations no later phase can
// see, so `pre+post` is strictly larger than `post` and its cells gate exactly that union.
//
// The exercise imports BARE specifiers, so `check-exercise` runs against the published JS while the
// runtime tier builds the sources: the redirect belongs to the bundler, and keeping it there is what
// lets the self-check stay bundler-free.
//
// domutils exports module-level `find` and `filter`. Called bare they are ordinary identifiers, so
// the block below reaches them as `DomUtils.find(...)` - a member expression `usage-pure` rewrites,
// whose helper has to hand back domutils' function.
//
// Typed arrays are present but only ever INDEXED, so the structural `usage-pure` hole that pruned
// three's paths is never reached and these cells pass on IE11 - the contrast is the point.
// `htmlparser2/WritableStream` and `/WebWritableStream` are excluded: node and WHATWG streams are not
// stdlib that core-js can polyfill.
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
import { checker } from './checks.mjs';

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
// through five different entity forms - named, decimal, the CP1252 remap that `&#128;` triggers, an
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
// domutils' feed reader - the numeric media attributes are the only place in that module that parses
// one. Without the media element the feed block would exercise nothing the DOM blocks do not.
const FEED = '<?xml version="1.0"?><rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">'
  + '<channel><title>Feed</title><link>http://example.com/</link>'
  + '<item><title>Post</title><link>http://example.com/1</link>'
  + '<media:content url="http://example.com/a.png" width="640" height="480" filesize="1024"/>'
  + '</item></channel></rss>';

export function run() {
  const { checks, check } = checker();

  const doc = parseDocument(PAGE);

  // --- parser: implied end tags, void elements, foreign content ---
  check('list_items', selectAll('#list > li', doc).length, 3);
  check('table_cells', selectAll('td', doc).map(element => textContent(element)), ['r1c1', 'r1c2', 'r2c1', 'r2c2']);
  check('dl_pairs', selectAll('dt, dd', doc).map(element => getName(element)), ['dt', 'dd', 'dt', 'dd']);
  check('options', selectAll('option', doc).map(element => getAttributeValue(element, 'value')), ['a', 'b']);
  check('paragraphs', selectAll('p', doc).length, 3);
  check('void_elements', selectAll('img, br, hr', doc).map(element => getName(element)), ['img', 'br', 'hr']);
  check('svg_adjusted', selectAll('svg *', doc).map(element => getName(element)), ['clipPath', 'path', 'foreignObject', 'div']);
  check('foreign_integration', textContent(selectOne('svg div', doc)), 'inner');
  check('script_rawtext', textContent(selectOne('script', doc)).indexOf('</scr') > 0, true);
  // the parser drops the SECOND `data-dup` - that decision is an `Object.hasOwn` call in Parser.ts
  check('dup_attribute', getAttributeValue(selectOne('div[title]', doc), 'data-dup'), '1');
  check('comment_kept', filter(node => node.type === 'comment', doc.children, true).length, 1);

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
  check('find_one', getName(findOne(element => element.name === 'td', doc.children, true)), 'td');
  check('exists_one', existsOne(element => element.name === 'table', doc.children), true);
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
  check('collision_find', getName(DomUtils.find(node => node.name === 'table', doc.children, true, 1)[0]), 'table');
  check('collision_filter', DomUtils.filter(node => node.name === 'li', doc.children, true).length, 3);
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
  // the compiled query is USED as one, not just handed back to `selectAll` - that entry point takes a
  // raw string too, so `compile = source => source` satisfied the count and the check said nothing
  // about compilation having happened
  const isSelected = compile('li.sel');
  check('compiled_query', selectAll(isSelected, doc).length, 1);
  // called behind a `typeof` guard, so that the same degraded `compile` reddens this check instead of
  // throwing "isSelected is not a function" out of the exercise and costing every check after it
  check('compiled_query_predicate',
    typeof isSelected === 'function' ? [isSelected(items[1]), isSelected(items[0])] : ['not a predicate'], [true, false]);
  check('descendant_cache', selectAll('body #list li', doc).length, 3);
  // `:scope` has three implementations picked by context length; only the >= 2 one reaches
  // `context.includes(element)`, which is one of the two `Node[]`-annotated receivers the header is about
  //
  // The element list is WIDER than the context on purpose. Handing the same two arrays to both never
  // asks `includes` a question whose answer is `false`, so an `includes` degraded to always-true
  // returned the same count and the check stayed green - the receiver it exists to observe was never
  // observed. Three elements against a context of two: only the two are in scope
  check('scope_context', selectAll(':scope', items.slice(0, 3), { context: items.slice(0, 2) }).length, 2);
  check('lang_match', is(selectOne('#list', doc), ':lang(en)'), true);
  check('lang_reject', is(selectOne('#list', doc), ':lang(fr)'), false);
  // `:has()` marks the selector as carrying an expensive subselector, which is the only thing that
  // compiles `general.ts`'s `cachedDescendant` - the second of css-select's two `new WeakMap` sites
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
  // the children in ORDER, not how many of them there are: `append` satisfies a count of three exactly
  // as `prepend` does, and where the node landed is the whole of what `prepend` decides. `remove_element`
  // was the same shape and is fixed by the same change
  prepend(firstChild(root), firstChild(parseDocument('<w/>')));
  check('prepend', getChildren(root).map(getName), ['w', 'z', 'c']);
  removeElement(firstChild(root));
  check('remove_element', getChildren(root).map(getName), ['z', 'c']);

  return { checks };
}
