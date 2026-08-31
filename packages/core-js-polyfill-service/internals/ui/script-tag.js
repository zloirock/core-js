// the anchors below the charset declaration, in the order they are tried. never the very start
// of a document that has a doctype: a doctype which is not first is rendered in quirks mode, and
// the page breaks for a reason that has nothing to do with the tag
const HEAD = /<head[^>]{0,200}>/i;
const HTML = /<html[^>]{0,200}>/i;
const DOCTYPE = /<!doctype[^>]{0,200}>/i;
const SCRIPT = /<script\b/i;

// every anchor is looked for OUTSIDE comments, whose contents are blanked at the same length so
// that the offsets survive: a commented-out `<script>` at the top of a page is ordinary, and a tag
// inserted inside one never runs
function withoutComments(prefix) {
  let masked = prefix;
  let at = masked.indexOf('<!--');

  while (at !== -1) {
    const closed = masked.indexOf('-->', at + 4);
    // an unterminated comment swallows the rest, which is what a browser does with it too
    const end = closed === -1 ? masked.length : closed + 3;

    masked = masked.slice(0, at) + ' '.repeat(end - at) + masked.slice(end);
    at = masked.indexOf('<!--', end);
  }

  return masked;
}

// the declaration is found by walking the META TAGS rather than by looking for the word - a
// pattern misses an unusual attribute order, and the bare word occurs inside inline scripts too,
// where taking the next `>` puts the tag after the page's own code
function charsetEnd(lower) {
  let at = lower.indexOf('<meta');

  while (at !== -1) {
    const closed = lower.indexOf('>', at);

    if (closed === -1) return -1;
    if (lower.slice(at, closed).includes('charset')) return closed + 1;

    at = lower.indexOf('<meta', closed);
  }

  return -1;
}

// the polyfills have to run before the code that counts on them. arriving late is indistinguishable
// from not arriving at all
function anchor(prefix) {
  const markup = withoutComments(prefix);
  const charset = charsetEnd(markup.toLowerCase());

  if (charset !== -1) return charset;

  for (const [pattern, after] of [[HEAD, true], [HTML, true], [DOCTYPE, true], [SCRIPT, false]]) {
    const found = pattern.exec(markup);
    if (found) return after ? found.index + found[0].length : found.index;
  }

  return 0;
}

// a policy that blocks the tag fails where nobody is looking - modern browsers stay silent about it
// and the page breaks on the old ones the polyfills were for
function policy(csp) {
  if (typeof csp != 'string') return { nonce: null, blocked: false };

  const directives = csp.split(';').map(directive => directive.trim());
  const relevant = directives.find(directive => /^script-src(?:-elem)?(?:\s|$)/i.test(directive))
    ?? directives.find(directive => /^default-src(?:\s|$)/i.test(directive));

  if (relevant === undefined) return { nonce: null, blocked: false };

  const [, ...sources] = relevant.split(/\s+/);

  // a page that runs no script at all - most often the error page a framework generated for
  // itself - cannot be missing a polyfill, and it is spelled two ways: `'none'` on its own, and a
  // source list that is empty. beside any other source a browser ignores the keyword, and so do we
  if (!sources.length || (sources.length === 1 && sources[0].toLowerCase() === "'none'")) return null;

  const nonce = /'nonce-(?<nonce>[^']+)'/.exec(relevant)?.groups.nonce ?? null;

  if (nonce !== null) return { nonce, blocked: false };

  // `strict-dynamic` makes host allowlists - `'self'` among them - stop applying, so a policy
  // carrying it and no nonce leaves nothing that would let the tag through
  const trusted = !/'strict-dynamic'/i.test(relevant)
    && /(?:^|\s)(?:'self'|'unsafe-inline'|\*|https?:)/i.test(relevant);

  return { nonce: null, blocked: !trusted };
}

// the beginning of the markup, the address of the bundle and the policy of the response, to the
// same beginning with the tag in it
export default function createScriptTag({ warn }) {
  return function insert(prefix, { src, csp }) {
    // the tag is looked for, never the address alone: the same response can pass through twice -
    // two routers, a re-entrant pipeline - but a page that merely LINKS to the bundle carries the
    // address too, and skipping it would leave that page without polyfills and without a word
    if (prefix.includes(`src="${ src }"`)) return prefix;

    const allows = policy(csp);

    // nothing runs on this page, so nothing can arrive too late for it
    if (allows === null) return prefix;

    const { nonce, blocked } = allows;

    if (blocked) {
      warn('script-tag:csp', 'the content security policy of the page allows no nonce, so the polyfill '
        + 'tag will be blocked - add a nonce to the policy, or allow the origin serving the bundles');
    }

    const at = anchor(prefix);
    const tag = `<script src="${ src }"${ nonce === null ? '' : ` nonce="${ nonce }"` }></script>`;

    return prefix.slice(0, at) + tag + prefix.slice(at);
  };
}
