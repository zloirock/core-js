/* eslint-disable promise/prefer-await-to-callbacks -- the signature of `res.write` and `res.end` */
import { HTML_PREFIX } from '../../../config.js';

// gzip's first two bytes. if we see them, the response was compressed before it reached us
const GZIP = 0x1F8B;

function normalize(chunk, encoding, callback) {
  if (typeof chunk == 'function') return [null, null, chunk];
  if (typeof encoding == 'function') return [chunk, null, encoding];
  return [chunk, encoding, callback];
}

function isHTML(response) {
  const type = response.getHeader('content-type');
  return typeof type == 'string' && type.toLowerCase().includes('text/html');
}

// everything on this path is synchronous. `res.write` cannot be made to wait, and waiting would
// mean buffering the whole response and taking over its backpressure
function intercept(request, response, { chooseBundle, scriptTag, urlOf, warn }) {
  const original = { end: response.end, write: response.write };
  const head = [];
  let size = 0;

  // putting the originals back is what ends the interception: from here on the application's calls
  // reach them directly, and neither of the two closures below runs again
  function restore() {
    response.end = original.end;
    response.write = original.write;
  }

  // writes out what has been held: the beginning with the tag in it, then the rest untouched
  function flush() {
    restore();

    // nothing was written, so there is no document to put a tag into - and a response with no
    // body must not be given one: a 304 with a body is a protocol violation
    if (!size) return true;

    // only the beginning is ever looked at, so only the beginning is joined and decoded: doing it
    // to everything held would make three full passes over the whole response to read its first
    // few kilobytes
    const prefix = Buffer.concat(head, Math.min(size, HTML_PREFIX));

    // both this and `compression` replace `res.write`, and the one that replaces it LATER sees the
    // body first - so this middleware is registered AFTER it. the failure is silent: gzipped
    // bytes, nothing inserted, no polyfills anywhere
    if (prefix.length > 1 && prefix.readUInt16BE(0) === GZIP) {
      warn('adapter:compressed', 'the HTML response was already compressed when it reached the polyfill '
        + 'middleware, so no polyfill tag could be inserted - register this middleware AFTER '
        + '`compression`, not before it');
      return writeOut(0);
    }

    // latin1, not utf8: it is byte-preserving, so a multi-byte character split across two chunks
    // survives, where utf8 would replace the half we hold. every anchor and the tag are ASCII
    const beginning = prefix.toString('latin1');
    const patched = scriptTag(beginning, {
      src: urlOf(chooseBundle(request.headers)),
      csp: response.getHeader('content-security-policy') ?? null,
    });

    // the headers the insertion made wrong, and only when it happened. `Content-Length` cannot be
    // recomputed - we hold the beginning, not the response - and Express computed the `ETag` BEFORE
    // the edit, so a client would revalidate into an address that is no longer theirs
    if (patched !== beginning && !response.headersSent) {
      response.removeHeader('content-length');
      response.removeHeader('etag');
    }

    original.write.call(response, Buffer.from(patched, 'latin1'));

    return writeOut(prefix.length);
  }

  // everything past the beginning leaves as it arrived: never decoded, never copied
  function writeOut(from) {
    let skip = from;
    let written = true;

    for (const chunk of head) {
      if (skip >= chunk.length) {
        skip -= chunk.length;
        continue;
      }

      written = original.write.call(response, skip ? chunk.subarray(skip) : chunk);
      skip = 0;
    }

    return written;
  }

  function collect(chunk, encoding) {
    // `res.write` takes a Uint8Array as readily as a Buffer or a string, and `String(view)` turns
    // one into the comma-separated list of its byte VALUES - destroying the response, not
    // mis-decoding it
    const bytes = ArrayBuffer.isView(chunk) ? chunk : Buffer.from(String(chunk), encoding ?? 'utf8');

    head.push(bytes);
    size += bytes.length;
  }

  // borrowed bytes are copied ONLY when they outlive the call that brought them: the callback
  // below reports the write as done, and a pooled stream reuses its buffer the moment it hears
  // that. what is flushed inside the same call is never exposed
  function copyLastChunk() {
    if (head.length) head[head.length - 1] = Buffer.copyBytesFrom(head.at(-1));
  }

  response.write = function (rawChunk, rawEncoding, rawCallback) {
    const [chunk, encoding, callback] = normalize(rawChunk, rawEncoding, rawCallback);

    // decided at the first write, not at installation: the content type is only known once the
    // application has set it
    if (!isHTML(response)) {
      restore();
      return original.write.call(this, rawChunk, rawEncoding, rawCallback);
    }

    if (chunk) collect(chunk, encoding);

    if (size >= HTML_PREFIX) flush();
    else copyLastChunk();

    if (callback) callback();

    // the bytes are held, not sent, so there is no backpressure to report yet
    return true;
  };

  response.end = function (rawChunk, rawEncoding, rawCallback) {
    const [chunk, encoding, callback] = normalize(rawChunk, rawEncoding, rawCallback);

    if (!isHTML(response)) {
      restore();
      return original.end.call(this, rawChunk, rawEncoding, rawCallback);
    }

    if (chunk) collect(chunk, encoding);

    flush();

    return original.end.call(this, callback);
  };
}

// the only part that knows about Express: it answers the bundle route and puts the tag into HTML
// responses
export default function createAdapter(service) {
  const { config, warn } = service;
  const bundleRoute = new RegExp(`^${ config.route.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&') }/(?<bundleId>[\\da-f]{1,64})\\.js$`);

  return async function middleware(request, response, next) {
    const { ready } = service.start();
    let baselineReady = true;

    // the waiting happens HERE, before the interception is installed: by the time there is
    // traffic the baseline is long ready, and the wait removes a whole "not there yet" branch
    try {
      await ready;
    } catch {
      baselineReady = false;
    }

    const path = request.path ?? request.url.split('?', 1)[0];
    const found = bundleRoute.exec(path);

    if (found !== null) return service.serve(request, response, found.groups.bundleId);

    // a baseline that could not be built takes the page out of OUR hands, not the visitor's: it
    // is served exactly as it would be without this middleware. failing the request instead would
    // turn a missing bundle into a site-wide outage
    if (!baselineReady) {
      warn('adapter:no-baseline', 'the baseline bundle could not be built, so no polyfill tag is being '
        + 'inserted - the pages are served exactly as they would be without this middleware');
      return next();
    }

    intercept(request, response, service);

    return next();
  };
}
