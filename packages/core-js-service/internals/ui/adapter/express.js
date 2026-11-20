/* eslint-disable promise/prefer-await-to-callbacks -- the signature of `res.write` and `res.end` */
import { ServerResponse } from 'node:http';
import { HTML_PREFIX } from '../../../config.js';
import varyBy from '../vary.js';

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

// what a document begins with, read from the first chunk alone and only to tell the developer that
// their pages are going out without a tag
function looksLikeHTML(chunk) {
  if (!chunk) return false;

  const start = ArrayBuffer.isView(chunk)
    ? Buffer.from(chunk.buffer, chunk.byteOffset, Math.min(chunk.byteLength, 64)).toString('latin1')
    : String(chunk).slice(0, 64);

  return /^\s*<(?:!doctype html|html[\s>])/i.test(start);
}

// everything on this path is synchronous. `res.write` cannot be made to wait, and waiting would
// mean buffering the whole response and taking over its backpressure
function intercept(request, response, base, { config, srcFor, scriptTag, warn }) {
  const original = { end: response.end, write: response.write };
  const head = [];
  let size = 0;
  let rangeHidden = false;
  let validatingHTML = false;

  const { headers, method } = request;
  const { range } = headers;
  const ifRange = headers['if-range'];
  const retrieval = method === 'GET' || method === 'HEAD';

  function canTransform() {
    const encoding = response.getHeader('content-encoding');
    return isHTML(response) && (!encoding || String(encoding).trim().toLowerCase() === 'identity');
  }

  // express.static snapshots Range before it knows the file type, then checks If-Range
  // after setting it. An obsolete source range must fall back to a full transformed GET.
  function restoreRange() {
    if (!rangeHidden) return;
    rangeHidden = false;
    headers.range = range;
    if (ifRange === undefined) delete headers['if-range'];
    else headers['if-range'] = ifRange;
  }

  if (retrieval && range) {
    original.setHeader = response.setHeader;
    function updateRange() {
      if (canTransform()) {
        rangeHidden = true;
        delete headers.range;
        headers['if-range'] = 'W/"core-js-transformed"';
      } else restoreRange();
    }
    response.setHeader = function (name, value) {
      const result = original.setHeader.call(this, name, value);
      if (/^content-(?:encoding|type)$/i.test(name)) updateRange();
      return result;
    };
    updateRange();
  }

  if (retrieval && (range || headers['if-modified-since'] || headers['if-none-match'])) {
    original.getHeader = response.getHeader;
    response.getHeader = function (name) {
      if (/^(?:etag|last-modified)$/i.test(name)) {
        validatingHTML = canTransform();
        if (validatingHTML) return undefined;
      }
      return original.getHeader.call(this, name);
    };
  }

  function restore() {
    if (original.setHeader) {
      restoreRange();
      response.setHeader = original.setHeader;
    }
    if (original.getHeader) response.getHeader = original.getHeader;
    response.end = original.end;
    response.write = original.write;
  }

  function documentHeaders() {
    response.removeHeader('content-length');
    response.removeHeader('etag');
    response.removeHeader('last-modified');
    response.removeHeader('accept-ranges');
    if (config.delivery !== 'fixed') {
      varyBy(response, 'user-agent');
      varyBy(response, 'accept-encoding');
    }
  }

  // the three ways the insertion is given up on: the beginning goes out exactly as it arrived, and
  // the developer is told once - a page without polyfills is a page, but nobody can see it is one
  function giveUp(condition, message, callback) {
    warn(condition, message);

    return writeOut(0, null, callback);
  }

  function flush(callback) {
    restore();

    // nothing was written, so there is no document to put a tag into - and a response with no
    // body must not be given one: a 304 with a body is a protocol violation
    if (!size) return true;
    if (response.statusCode === 206 || response.getHeader('content-range') !== undefined) {
      return writeOut(0, null, callback);
    }

    // only the beginning is ever looked at, so only the beginning is joined and decoded: doing it
    // to everything held would make three full passes over the whole response to read its first
    // few kilobytes
    const prefix = Buffer.concat(head, Math.min(size, HTML_PREFIX));

    // both this and `compression` replace `res.write`, and the one that replaces it LATER sees the
    // body first - so this middleware is registered AFTER it. the failure is silent: gzipped
    // bytes, nothing inserted, no polyfills anywhere
    const encoding = response.getHeader('content-encoding');
    const alreadyEncoded = !response.headersSent && encoding && String(encoding).trim().toLowerCase() !== 'identity';
    if (alreadyEncoded || (prefix.length > 1 && prefix.readUInt16BE(0) === GZIP)) {
      return giveUp('adapter:compressed', 'the HTML response was already compressed when it reached the '
        + 'polyfill middleware, so no polyfill tag could be inserted - register this middleware AFTER '
        + '`compression`, not before it', callback);
    }

    // latin1, not utf8: it is byte-preserving, so a multi-byte character split across two chunks
    // survives, where utf8 would replace the half we hold. every anchor and the tag are ASCII
    const beginning = prefix.toString('latin1');
    let patched;

    // a failure here happens inside the application's own `res.write`, halfway through a response -
    // a page without polyfills is a page, a `res.write` that throws is the site
    try {
      patched = scriptTag(beginning, {
        // the address is written from where the MIDDLEWARE is mounted, not from the root: a router
        // that mounts it under a path strips that path from everything it hands on, so a route
        // matched against `/__core-js/<id>.js` is reached at `/app/__core-js/<id>.js` from outside
        src: `${ base }${ srcFor(request.headers) }`,
        csp: response.getHeader('content-security-policy') ?? null,
      });
    } catch (error) {
      return giveUp('adapter:tag-failed', `the polyfill tag could not be built (${ error.message }), so `
        + 'the page is served exactly as it would be without this middleware', callback);
    }

    // the headers the insertion made wrong: the length and the `ETag` were computed before the edit,
    // and the tag is chosen by `User-Agent` and `Accept-Encoding` - the latter is ours to name too,
    // since on iOS one string comes from 15 and from 26, and only `zstd` tells them apart. the fixed
    // address is the same for everyone, so with it the page varies by neither (adapter-6)
    if (patched !== beginning) {
      // with the headers already sent by `res.writeHead` none of it can be repaired, and a stale
      // `Content-Length` cuts the page off at the client - half a page is worse than no tag
      if (response.headersSent) {
        return giveUp('adapter:headers-sent', 'the response headers were already sent when the polyfill '
          + 'tag was ready, so no tag could be inserted - `Content-Length` would no longer match the '
          + 'body. Set the headers with `res.setHeader` rather than `res.writeHead`', callback);
      }

      documentHeaders();
    }

    return writeOut(prefix.length, Buffer.from(patched, 'latin1'), callback);
  }

  // everything past the beginning leaves as it arrived: never decoded, never copied
  function writeOut(skip, first, callback) {
    let pending = first;
    let writable = true;
    for (const chunk of head) {
      if (skip >= chunk.length) {
        skip -= chunk.length;
        continue;
      }
      if (pending && !original.write.call(response, pending)) writable = false;
      pending = chunk.subarray(skip);
      skip = 0;
    }

    // The last write owns the callback, including when the prefix is the entire body.
    return original.write.call(response, pending, callback) && writable;
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

  // a response not declared as HTML leaves untouched, but one that BEGINS like a document had its type
  // set through `res.writeHead`, or none at all - a page that never gets its polyfills, said once
  function decline(chunk) {
    restore();

    if (looksLikeHTML(chunk)) {
      warn('adapter:undeclared-html', 'a response that begins like an HTML document was not declared as '
        + 'HTML, so no polyfill tag could be inserted into it - set `Content-Type` with '
        + '`res.setHeader` or `res.type`, before the body is written and not through `res.writeHead`');
    }
  }

  response.write = function (rawChunk, rawEncoding, rawCallback) {
    const [chunk, encoding, callback] = normalize(rawChunk, rawEncoding, rawCallback);

    // decided at the first write, not at installation: the content type is only known once the
    // application has set it
    if (!isHTML(response)) {
      decline(chunk);
      return original.write.call(this, rawChunk, rawEncoding, rawCallback);
    }

    if (chunk) collect(chunk, encoding);

    if (size >= HTML_PREFIX) {
      if (!callback || original.write === ServerResponse.prototype.write) return flush(callback);
      // Middleware such as compression accepts the bytes but drops the write callback.
      // Own the caller's view before acknowledging it, even if the encoder is still reading it.
      if (ArrayBuffer.isView(chunk)) copyLastChunk();
      const writable = flush();
      queueMicrotask(callback);
      return writable;
    }
    copyLastChunk();

    if (callback) callback();

    // the bytes are held, not sent, so there is no backpressure to report yet
    return true;
  };

  response.end = function (rawChunk, rawEncoding, rawCallback) {
    const [chunk, encoding, callback] = normalize(rawChunk, rawEncoding, rawCallback);

    // Express removes Content-Type before ending a wildcard 304. It still describes
    // the negotiated document, just like HEAD, even though neither has bytes to inspect.
    const { statusCode } = response;
    const metadataOnly = (statusCode === 304 && validatingHTML)
      || (method === 'HEAD' && statusCode >= 200 && ![204, 205, 206, 304].includes(statusCode)
        && !response.getHeader('content-range') && canTransform());
    if (metadataOnly && !response.headersSent) {
      restore();
      documentHeaders();
      return original.end.call(this, callback);
    }

    if (!isHTML(response)) {
      decline(chunk);
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

  // the fixed address is answered only in its own mode: in the other one nothing points at it
  const isFixed = config.delivery === 'fixed';

  return async function middleware(request, response, next) {
    const path = request.path ?? request.url.split('?', 1)[0];
    const found = bundleRoute.exec(path);
    const isScriptRoute = isFixed && path === service.scriptUrl;

    // Express before 5 does not await a middleware, and an unheard rejection ends the process - so
    // nothing leaves: a page goes out as without us, the bundle route to the framework's error handling
    try {
      return await answer(request, response, next, found, isScriptRoute);
    } catch (error) {
      warn('adapter:failed', `the polyfill middleware could not answer ${ path } (${ error.message })`);
      return found === null && !isScriptRoute ? next() : next(error);
    }
  };

  async function answer(request, response, next, found, isScriptRoute) {
    const { ready } = service.start();
    let isBaselineReady = true;

    // the waiting happens HERE, before the interception is installed: by the time there is
    // traffic the baseline is long ready, and the wait removes a whole "not there yet" branch
    try {
      await ready;
    } catch {
      isBaselineReady = false;
    }

    if (found !== null) return service.serve(request, response, found.groups.bundleId);
    // without a baseline it answers `503` itself - a statement about the moment, not about the page
    if (isScriptRoute) return service.serveScript(request, response);

    // a baseline that could not be built takes the page out of OUR hands, not the visitor's: it
    // is served exactly as it would be without this middleware. failing the request instead would
    // turn a missing bundle into a site-wide outage
    if (!isBaselineReady) {
      warn('adapter:no-baseline', 'the baseline bundle could not be built, so no polyfill tag is being '
        + 'inserted - the pages are served exactly as they would be without this middleware');
      return next();
    }

    // read HERE and not at the flush: a router restores what it stripped as soon as this middleware
    // hands the request on, and by the time the application writes the body it is gone
    const base = request.baseUrl ?? '';

    intercept(request, response, base, service);

    return next();
  }
}
