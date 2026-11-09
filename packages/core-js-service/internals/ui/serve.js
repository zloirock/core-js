import varyBy from './vary.js';
import parseAcceptEncoding from '../domain/accept-encoding.js';
import { CACHE_CONTROL, CONTENT_TYPE, ENCODING_PREFERENCE, HEADER_LIMIT } from '../../config.js';

// the encoding to answer with, or `null` when the client has refused everything we hold
export function negotiate(header, stored) {
  // past the bound the header is not read, and what it might have refused is unknowable - so the
  // answer is the representation acceptable by default, and the most preferred one we hold if that
  // is not among them: a store told to keep no `identity` still has to answer
  if (typeof header == 'string' && header.length > HEADER_LIMIT) {
    return stored.includes('identity') ? 'identity' : ENCODING_PREFERENCE.find(it => stored.includes(it)) ?? null;
  }

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
      // from the mount point, like the tag: a router hands this middleware a path with its own
      // prefix already taken off, and an address written from the root would leave the client
      // following it to nothing
      response.setHeader('location', `${ request.baseUrl ?? '' }${ urlOf(baselineId) }`);
      // never cached: after the warm-up the client has to come back for its own bucket
      response.setHeader('cache-control', 'no-store');
      return end(response);
    }

    // the encoding is part of the identity of what is being sent, so it is part of the tag:
    // the gzip copy and the uncompressed one are different bytes under one identifier
    response.setHeader('cache-control', CACHE_CONTROL);
    // always, because at least two encodings are stored and the answer therefore depends on the
    // header by construction - and added to what the rest of the stack already said it varies by
    varyBy(response, 'accept-encoding');
    send(request, response, bundle.bytes, encoding, `"${ bundleId }-${ encoding }"`);
  };
}

// the other handler: one address for every browser, the bundle chosen when the script is asked
// for. what sits behind it changes with the browser, the warm-up and the deploy
export function createServeScript({ getBundle, encodings, baselineId, chooseBundle, generation, warn }) {
  return async function serveScript(request, response) {
    const encoding = negotiate(request.headers['accept-encoding'], encodings);

    if (encoding === null) return end(response, 406);

    let bundleId = chooseBundle(request.headers);
    let bundle = await getBundle(bundleId, encoding);

    // a bucket still warming is the baseline's bytes under this same address: the address promises
    // no particular bundle, so there is nothing to redirect to
    if (bundle.state !== 'ready' && bundleId !== baselineId) {
      bundleId = baselineId;
      bundle = await getBundle(bundleId, encoding);
    }

    if (bundle.state !== 'ready') {
      warn('serve:cold-baseline', 'the baseline bundle is missing while requests are being served');
      // a 404 here is a statement about the address a cache may keep; this is a statement about the
      // moment, and nothing keeps it
      response.setHeader('cache-control', 'no-store');
      return end(response, 503);
    }

    // the browser may keep the bytes but has to ask before using them again, and a shared cache
    // keeps nothing: the answer depends on who is asking
    response.setHeader('cache-control', 'private, no-cache');
    varyBy(response, 'user-agent');
    varyBy(response, 'accept-encoding');
    // the identifier names the module list, not the targets it was built for: across a deploy one
    // identifier can carry another syntax level, and a tag without the generation would confirm the
    // previous deploy's bytes with a 304
    send(request, response, bundle.bytes, encoding, `"${ generation }-${ bundleId }-${ encoding }"`);
  };
}

function send(request, response, bytes, encoding, etag) {
  response.setHeader('content-type', CONTENT_TYPE);
  response.setHeader('x-content-type-options', 'nosniff');
  response.setHeader('etag', etag);

  if (encoding !== 'identity') response.setHeader('content-encoding', encoding);

  if (matches(request.headers['if-none-match'], etag)) return end(response, 304);

  response.statusCode = 200;
  response.setHeader('content-length', bytes.length);
  response.end(bytes);
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
