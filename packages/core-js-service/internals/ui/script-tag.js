import { html, parse } from 'parse5';

// Classic script MIME types, including their historical spellings.
const JAVASCRIPT_TYPE = /^(?:(?:application|text)\/(?:x-)?(?:ecma|java)script|text\/(?:javascript1\.[0-5]|jscript|livescript))$/i;

// Recognize common document openings without building a tree for the rest of the response.
// Leave optional tags, comments and unfamiliar attribute syntax to the HTML parser.
const OPEN_HEAD = /^[\t\n\r ]*(?:<!doctype html>[\t\n\r ]*)?(?:<html(?:[\t\n\r ]+[\w\-:]+=(?:"[^"<]*"|'[^'<]*'|[\w-]+))*[\t\n\r ]*>[\t\n\r ]*)?<head[\t\n\r ]*>/i;
const SCRIPT_START = /<script(?=[\t\n\f\r />])/gi;
const SCRIPT_TOKEN = /[\t\n\f\r ]*(?:(?<end>\/?>)|(?<name>[^\t\n\f\r "'/<=>]+)(?:[\t\n\f\r ]*=[\t\n\f\r ]*(?<value>"[^"<]*"|'[^'<]*'|[^\t\n\f\r "'<>]+))?)/y;
const CHARACTER_REFERENCE = /&[#a-z]/i;
const FIRST_CHARSET = /[\t\n\r ]*<meta[\t\n\r ]+charset=(?:"[\w-]+"|'[\w-]+'|[\w-]+)[\t\n\r ]*\/?>/iy;

function mayHaveScript(prefix, src) {
  SCRIPT_START.lastIndex = 0;
  if (prefix.includes(src)) return SCRIPT_START.test(prefix);
  const lastAmpersand = prefix.lastIndexOf('&');
  if (lastAmpersand === -1) return false;
  while (SCRIPT_START.test(prefix) && SCRIPT_START.lastIndex <= lastAmpersand) {
    SCRIPT_TOKEN.lastIndex = SCRIPT_START.lastIndex;
    let token;
    while ((token = SCRIPT_TOKEN.exec(prefix)) && !token.groups.end) {
      const { name, value } = token.groups;
      if (name.toLowerCase() === 'src' && value && CHARACTER_REFERENCE.test(value)) return true;
    }
    // Hand unfamiliar syntax to the parser, including '<' inside an attribute value.
    if (!token) return true;
    SCRIPT_START.lastIndex = SCRIPT_TOKEN.lastIndex;
  }
  return false;
}

function simpleInsertionPoint(prefix, src) {
  const opening = OPEN_HEAD.exec(prefix);
  if (!opening) {
    if (!/<(?:!doctype|head|html|meta|script)\b/i.test(prefix)) return { at: 0 };
    return undefined;
  }
  const headEnd = opening[0].length;
  FIRST_CHARSET.lastIndex = headEnd;
  let at = headEnd;
  if (FIRST_CHARSET.test(prefix)) at = FIRST_CHARSET.lastIndex;
  else if (/<meta[\t\n\f\r />]/i.test(prefix) && /charset|http-equiv/i.test(prefix)) return undefined;

  if (prefix.startsWith(`<script src="${ src }"></script>`, at) && !/[\r"&]/.test(src)) return null;
  if (mayHaveScript(prefix, src)) return undefined;
  return { at };
}

// Locations refer to the original prefix, including comments and raw script text.
// Only inspect actual HTML elements; a template's inert content is a separate fragment.
function insertionPoint(prefix, src) {
  const simple = simpleInsertionPoint(prefix, src);
  if (simple !== undefined) return simple;

  const document = parse(prefix, { sourceCodeLocationInfo: true });
  let headEnd, htmlEnd, doctypeEnd, firstScript, firstExecutable, charsetEnd, installed;
  const pending = [document];
  while (pending.length) {
    const node = pending.pop();
    const location = node.sourceCodeLocation;
    if (node.nodeName === '#documentType') doctypeEnd = location.endOffset;
    if (location?.startTag && node.namespaceURI === html.NS.HTML) {
      const { startOffset, endOffset } = location.startTag;
      switch (node.tagName) {
        case 'head':
          headEnd = endOffset;
          break;
        case 'html':
          htmlEnd = endOffset;
          break;
        case 'meta': {
          const attrs = Object.fromEntries(node.attrs.map(({ name, value }) => [name, value]));
          if (attrs.charset || (attrs['http-equiv']?.toLowerCase() === 'content-type' && /charset\s*=/i.test(attrs.content))) {
            charsetEnd = Math.min(charsetEnd ?? Infinity, endOffset);
          }

          break;
        }
        case 'script': {
          firstScript = Math.min(firstScript ?? Infinity, startOffset);
          const attrs = Object.fromEntries(node.attrs.map(({ name, value }) => [name, value]));
          const type = (attrs.type ?? (attrs.language ? `text/${ attrs.language }` : '')).trim();
          const classic = !type || JAVASCRIPT_TYPE.test(type);
          if (classic || type.toLowerCase() === 'module') firstExecutable = Math.min(firstExecutable ?? Infinity, startOffset);
          if (attrs.src === src && classic
            && attrs.async === undefined && attrs.defer === undefined && attrs.nomodule === undefined
            && (!installed || startOffset < installed.startOffset)) installed = location;

          break;
        }
      // No default
      }
    }
    for (const child of node.childNodes ?? []) pending.push(child);
  }

  if (installed && installed.startOffset === firstExecutable) return null;
  const at = charsetEnd !== undefined && charsetEnd <= (firstScript ?? Infinity)
    ? charsetEnd : headEnd ?? htmlEnd ?? doctypeEnd ?? firstScript ?? 0;
  return { at: Math.min(at, firstScript ?? Infinity), installed };
}

// a policy that blocks the tag fails where nobody is looking - modern browsers stay silent about it
// and the page breaks on the old ones the polyfills were for
function policy(csp) {
  if (typeof csp != 'string') return { nonce: null, blocked: false };

  const directives = csp.split(';').map(directive => directive.trim());
  const relevant = directives.find(directive => /^script-src-elem(?:\s|$)/i.test(directive))
    ?? directives.find(directive => /^script-src(?:\s|$)/i.test(directive))
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
    const allows = policy(csp);

    // nothing runs on this page, so nothing can arrive too late for it
    if (allows === null) return prefix;

    const { nonce, blocked } = allows;

    const point = insertionPoint(prefix, src);
    if (point === null) return prefix;
    const { at, installed } = point;
    if (installed) {
      const { startOffset, startTag, endTag } = installed;
      // Keep nonce, integrity and other attributes when moving an existing external script.
      // Its closing tag may be outside the prefix. Preserve the raw-text context in that case.
      const tag = endTag ? prefix.slice(startOffset, endTag.endOffset)
        : `${ prefix.slice(startOffset, startTag.endOffset) }</script>`;
      const rest = endTag ? prefix.slice(endTag.endOffset)
        : `<script type="application/octet-stream">${ prefix.slice(startTag.endOffset) }`;
      return prefix.slice(0, at) + tag + prefix.slice(at, startOffset) + rest;
    }

    if (blocked) {
      warn('script-tag:csp', 'the content security policy of the page allows no nonce, so the polyfill '
        + 'tag will be blocked - add a nonce to the policy, or allow the origin serving the bundles');
    }

    const tag = `<script src="${ src }"${ nonce === null ? '' : ` nonce="${ nonce }"` }></script>`;

    return prefix.slice(0, at) + tag + prefix.slice(at);
  };
}
