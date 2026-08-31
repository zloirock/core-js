import { CACHE_CONTROL, CONTENT_TYPE, ENCODING_PREFERENCE, HEADER_LIMIT } from '../../config.js';

// the header is parsed in full rather than searched for a substring: testing whether it contains
// `gzip` breaks on exactly `gzip;q=0`, which is the case the uncompressed copy is stored for
function parseAcceptEncoding(header) {
  const quality = new Map();
  let wildcard = null;

  for (const part of header.split(',')) {
    const [name, ...parameters] = part.split(';');
    const encoding = name.trim().toLowerCase();

    if (!encoding) continue;

    let q = 1;

    for (const parameter of parameters) {
      const match = /^\s*q=(?<q>[\d.]+)/i.exec(parameter);
      if (match) q = Number.parseFloat(match.groups.q);
    }

    if (Number.isNaN(q)) q = 1;

    if (encoding === '*') wildcard ??= q;
    else if (!quality.has(encoding)) quality.set(encoding, q);
  }

  return { quality, wildcard };
}

// the encoding to answer with, or `null` when the client has refused everything we hold
export function negotiate(header, stored) {
  // past the bound the header is not read, and what it might have refused is unknowable - so the
  // answer is the one representation acceptable by default. `identity` is always stored
  if (typeof header == 'string' && header.length > HEADER_LIMIT) return 'identity';

  // no header means any coding is acceptable (RFC 9110), not that the client wants it
  // uncompressed
  const rank = typeof header == 'string' ? rankFrom(parseAcceptEncoding(header)) : () => 1;
  let chosen = null;
  let best = 0;

  for (const encoding of ENCODING_PREFERENCE) {
    if (!stored.includes(encoding)) continue;

    const q = rank(encoding);

    if (q > best) {
      best = q;
      chosen = encoding;
    }
  }

  return chosen;
}

// the uncompressed representation is acceptable by default - only `identity;q=0` or `*;q=0` refuses
// it - but ranked LAST: read as a full q=1 it would beat every coding the client asked for with a
// q of its own
const IMPLICIT_IDENTITY = 0.0001;

function rankFrom({ quality, wildcard }) {
  return function rank(encoding) {
    return quality.get(encoding) ?? wildcard ?? (encoding === 'identity' ? IMPLICIT_IDENTITY : 0);
  };
}

// one handler: the bundle under an identifier. where the identifier came from it does not know -
// the adapter wrote it into the tag
export default function createServe({ getBundle, encodings, baselineId, urlOf, warn }) {
  return async function serve(request, response, bundleId) {
    const encoding = negotiate(request.headers['accept-encoding'], encodings);

    // a client that has refused everything we hold, `*;q=0` and all. a degenerate case and a
    // client-side mistake: an ordinary proxy asking for `identity` is served the uncompressed copy
    if (encoding === null) return end(response, 406);

    const bundle = await getBundle(bundleId, encoding);

    // an unknown identifier is a 404 and nothing else - no building, no searching. otherwise the
    // path is an amplifier: a cheap request against expensive work
    if (bundle.state === 'unknown') return end(response, 404);

    if (bundle.state === 'cold') {
      // the baseline is waited for before the first request is taken, so it is never cold here -
      // and if it somehow were, redirecting to it would send the client round in a circle
      if (bundleId === baselineId) {
        warn('serve:cold-baseline', 'the baseline bundle is missing while requests are being served');
        return end(response, 404);
      }

      response.statusCode = 302;
      response.setHeader('location', urlOf(baselineId));
      // never cached: after the warm-up the client has to come back for its own bucket
      response.setHeader('cache-control', 'no-store');
      return end(response);
    }

    // the encoding is part of the identity of what is being sent, so it is part of the tag:
    // the gzip copy and the uncompressed one are different bytes under one identifier
    const etag = `"${ bundleId }-${ encoding }"`;

    response.setHeader('cache-control', CACHE_CONTROL);
    response.setHeader('content-type', CONTENT_TYPE);
    response.setHeader('x-content-type-options', 'nosniff');
    // always, because at least two encodings are stored and the answer therefore depends on the
    // header by construction
    response.setHeader('vary', 'accept-encoding');
    response.setHeader('etag', etag);

    if (encoding !== 'identity') response.setHeader('content-encoding', encoding);

    if (matches(request.headers['if-none-match'], etag)) return end(response, 304);

    response.statusCode = 200;
    response.setHeader('content-length', bundle.bytes.length);
    response.end(bundle.bytes);
  };
}

function matches(header, etag) {
  // past the bound the header is not read: a validator we did not read is a validator that does
  // not match, which costs one full response and never a wrong one
  if (typeof header != 'string' || header.length > HEADER_LIMIT) return false;
  if (header.trim() === '*') return true;

  return header.split(',').some(candidate => candidate.trim().replace(/^W\//, '') === etag);
}

function end(response, status) {
  if (status !== undefined) response.statusCode = status;
  response.end();
}
