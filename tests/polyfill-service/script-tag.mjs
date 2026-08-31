import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import createScriptTag from '../../packages/core-js-polyfill-service/internals/ui/script-tag.js';

const SRC = '/__core-js/abc.js';

function inserter() {
  const reported = [];
  const insert = createScriptTag({
    warn(condition) {
      reported.push(condition);
      return true;
    },
  });

  return { insert, reported };
}

const { insert, reported } = inserter();
function tagged(prefix) {
  return insert(prefix, { src: SRC });
}

// the tag has to run before the code counting on it, so it goes as early as it can - and never
// before the charset declaration: one pushed past the first 1024 bytes stops working, breaking the
// whole page rather than the tag
strictEqual(tagged('<!doctype html><html><head><meta charset="utf-8"><title>x</title>'),
  '<!doctype html><html><head><meta charset="utf-8"><script src="/__core-js/abc.js"></script><title>x</title>',
  'script-tag-2 #1');
// the other spelling of the same declaration, which a pattern is easy to miss
strictEqual(tagged('<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><title>x</title>'),
  '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">'
  + '<script src="/__core-js/abc.js"></script><title>x</title>', 'script-tag-2 #2');

strictEqual(tagged('<!doctype html><html><head><title>x</title>'),
  '<!doctype html><html><head><script src="/__core-js/abc.js"></script><title>x</title>', 'script-tag-1 #1');
strictEqual(tagged('<!doctype html><html><body>'),
  '<!doctype html><html><script src="/__core-js/abc.js"></script><body>', 'script-tag-1 #2');
// never at the very start of a document that has a doctype: a doctype that is not first puts the
// page into quirks mode, and that breaks the page rather than the tag
strictEqual(tagged('<!DOCTYPE html>\n<body>'),
  '<!DOCTYPE html><script src="/__core-js/abc.js"></script>\n<body>', 'script-tag-1 #3');
strictEqual(tagged('<script src="/app.js"></script>'),
  '<script src="/__core-js/abc.js"></script><script src="/app.js"></script>', 'script-tag-1 #4');
strictEqual(tagged('<p>a fragment</p>'), '<script src="/__core-js/abc.js"></script><p>a fragment</p>',
  'script-tag-1 #5');

// an anchor found inside a COMMENT is a tag that never runs, and nothing anywhere says so.
// A commented-out script at the top of a page is ordinary, and so is a conditional comment
// carrying an `<html>` tag
strictEqual(tagged('<!-- <script src="/analytics.js"></script> --><p>x</p>'),
  '<script src="/__core-js/abc.js"></script><!-- <script src="/analytics.js"></script> --><p>x</p>',
  'script-tag-1 #6');
strictEqual(tagged('<!--[if lt IE 9]><html class="ie8"><![endif]--><!doctype html><head>'),
  '<!--[if lt IE 9]><html class="ie8"><![endif]--><!doctype html><head>'
  + '<script src="/__core-js/abc.js"></script>', 'script-tag-1 #7');
// an unterminated comment swallows the rest of the prefix, as it does in a browser
strictEqual(tagged('<!-- <head>'), '<script src="/__core-js/abc.js"></script><!-- <head>',
  'script-tag-1 #8');

// and the charset declaration is looked for among the META TAGS, not as a word: it occurs inside
// inline scripts too, and taking the `>` that follows it there puts the tag after the page's own
// code - late is indistinguishable from absent
strictEqual(tagged('<head><script>var s = "charset=utf-8";</script>'),
  '<head><script src="/__core-js/abc.js"></script><script>var s = "charset=utf-8";</script>',
  'script-tag-2 #3');

// the same response can pass through twice - two routers, a re-entrant pipeline
const once = tagged('<head>');

strictEqual(tagged(once), once, 'script-tag #1');
deepStrictEqual(reported, [], 'script-tag #2');

// what is looked for is the TAG: a page that merely links to the bundle - a status page, a
// documentation sample - carries the address as well, and skipping it would leave that page
// without polyfills and without a word
const linking = `<head><a href="${ SRC }">the bundle</a>`;

ok(tagged(linking).startsWith(`<head><script src="${ SRC }"></script>`), 'script-tag #3');

// a policy that blocks the tag fails where nobody looks - modern browsers stay quiet about it, and
// the page breaks on the old ones the polyfills were for
function withPolicy(csp) {
  const { insert: tag, reported: warnings } = inserter();
  return { markup: tag('<head>', { src: SRC, csp }), warnings };
}

const nonce = withPolicy("script-src 'nonce-r4nd0m' 'strict-dynamic'");

strictEqual(nonce.markup, '<head><script src="/__core-js/abc.js" nonce="r4nd0m"></script>', 'script-tag-3 #1');
deepStrictEqual(nonce.warnings, [], 'script-tag-3 #2');

// `script-src` is what applies; `default-src` only when there is no `script-src`
strictEqual(withPolicy("default-src 'nonce-fallback'").markup,
  '<head><script src="/__core-js/abc.js" nonce="fallback"></script>', 'script-tag-3 #3');
strictEqual(withPolicy("default-src 'nonce-fallback'; script-src 'self'").markup,
  '<head><script src="/__core-js/abc.js"></script>', 'script-tag-3 #4');

// `'self'` lets the tag through on its own, so there is nothing to report
deepStrictEqual(withPolicy("script-src 'self'").warnings, [], 'script-tag-3 #5');
deepStrictEqual(withPolicy(null).warnings, [], 'script-tag-3 #6');
deepStrictEqual(withPolicy('img-src https://example.com').warnings, [], 'script-tag-3 #7');

// a policy of hashes alone cannot be fixed by anything we can put in the tag, and one carrying
// `strict-dynamic` without a nonce ignores `'self'` too - both are reported to the developer
deepStrictEqual(withPolicy("script-src 'sha256-abc'").warnings, ['script-tag:csp'], 'script-tag-3 #8');
deepStrictEqual(withPolicy("script-src 'self' 'strict-dynamic'").warnings, ['script-tag:csp'],
  'script-tag-3 #9');

// and `'none'` alone is the exception: the page runs no script, so it is missing nothing. the
// error page a framework generates for itself carries exactly that policy, and a complaint about it
// sends the developer looking at pages that are fine
const nothing = withPolicy("default-src 'none'");

strictEqual(nothing.markup, '<head>', 'script-tag-3 #10');
deepStrictEqual(nothing.warnings, [], 'script-tag-3 #11');
strictEqual(withPolicy("script-src 'none'").markup, '<head>', 'script-tag-3 #12');

// beside any other source a browser ignores the keyword, and so do we
strictEqual(withPolicy("script-src 'none' 'self'").markup,
  '<head><script src="/__core-js/abc.js"></script>', 'script-tag-3 #13');

// and the other spelling of the same thing: a directive whose source list is EMPTY blocks every
// script too, so it is a page that runs none - the tag would be inserted and silently blocked
const empty = withPolicy('script-src');

strictEqual(empty.markup, '<head>', 'script-tag-3 #14');
deepStrictEqual(empty.warnings, [], 'script-tag-3 #15');
strictEqual(withPolicy('default-src').markup, '<head>', 'script-tag-3 #16');
// a directive that only STARTS like one of ours is not one of ours
strictEqual(withPolicy('default-src-foo').markup,
  '<head><script src="/__core-js/abc.js"></script>', 'script-tag-3 #17');
