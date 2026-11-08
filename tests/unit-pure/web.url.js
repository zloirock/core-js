/* eslint-disable es/no-object-getownpropertydescriptor, unicorn/relative-url-style -- required for testing */
import { DESCRIPTORS, GLOBAL, NODE } from '../helpers/constants.js';
import urlTestData from '../wpt-url-resources/urltestdata.js';
import settersTestData from '../wpt-url-resources/setters.js';
import toASCIITestData from '../wpt-url-resources/toascii.js';

import URL from 'core-js-pure/stable/url';
import URLSearchParams from 'core-js-pure/stable/url-search-params';

const { hasOwnProperty } = Object.prototype;

QUnit.test('URL constructor', assert => {
  assert.isFunction(URL);
  if (!NODE) assert.arity(URL, 1);

  if (typeof GLOBAL.URL == 'function') {
    assert.notSame(URL, GLOBAL.URL, 'static polyfills do not modify the native constructor');
    if (GLOBAL.URL.createObjectURL) assert.isFunction(URL.createObjectURL);
    if (GLOBAL.URL.revokeObjectURL) assert.isFunction(URL.revokeObjectURL);
  }

  if (URL.createObjectURL) assert.enumerable(URL, 'createObjectURL');
  if (URL.revokeObjectURL) assert.enumerable(URL, 'revokeObjectURL');

  assert.same(String(new URL('http://www.domain.com/a/b')), 'http://www.domain.com/a/b');
  assert.same(String(new URL('/c/d', 'http://www.domain.com/a/b')), 'http://www.domain.com/c/d');
  assert.same(String(new URL('b/c', 'http://www.domain.com/a/b')), 'http://www.domain.com/a/b/c');
  assert.same(String(new URL('b/c', new URL('http://www.domain.com/a/b'))), 'http://www.domain.com/a/b/c');
  assert.same(String(new URL({ toString: () => 'https://example.org/' })), 'https://example.org/');

  assert.same(String(new URL('nonspecial://example.com/')), 'nonspecial://example.com/');

  // SPECIAL_AUTHORITY_SLASHES state - special schemes without base
  assert.same(String(new URL('http://example.com/path')), 'http://example.com/path', 'special authority slashes with //');
  assert.same(String(new URL('http:/example.com/path')), 'http://example.com/path', 'special authority slashes with single /');
  assert.same(String(new URL('http:example.com/path')), 'http://example.com/path', 'special authority slashes without /');
  assert.same(String(new URL('https:////example.com/path')), 'https://example.com/path', 'special authority slashes with extra /');

  assert.same(String(new URL('https://測試')), 'https://xn--g6w251d/', 'unicode parsing');
  assert.same(String(new URL('https://xxпривет.тест')), 'https://xn--xx-flcmn5bht.xn--e1aybc/', 'unicode parsing');
  assert.same(String(new URL('https://xxПРИВЕТ.тест')), 'https://xn--xx-flcmn5bht.xn--e1aybc/', 'unicode parsing');
  assert.same(String(new URL('http://Example.com/', 'https://example.org/')), 'http://example.com/');
  assert.same(String(new URL('https://Example.com/', 'https://example.org/')), 'https://example.com/');
  assert.same(String(new URL('nonspecial://Example.com/', 'https://example.org/')), 'nonspecial://Example.com/');
  assert.same(String(new URL('http:Example.com/', 'https://example.org/')), 'http://example.com/');
  assert.same(String(new URL('https:Example.com/', 'https://example.org/')), 'https://example.org/Example.com/');
  assert.same(String(new URL('nonspecial:Example.com/', 'https://example.org/')), 'nonspecial:Example.com/');

  assert.same(String(new URL('http://0300.168.0xF0')), 'http://192.168.0.240/');
  assert.same(String(new URL('http://[20:0:0:1:0:0:0:ff]')), 'http://[20:0:0:1::ff]/');
  // assert.same(String(new URL('http://257.168.0xF0')), 'http://257.168.0xf0/', 'incorrect IPv4 parsed as host'); // TypeError in Chrome and Safari
  // assert.throws(() => new URL('http://257.168.0xF0'), 'invalid IPv4: octet > 255'); // accepted by native Firefox 57-118
  assert.same(String(new URL('http://0300.168.0xG0')), 'http://0300.168.0xg0/', 'incorrect IPv4 parsed as host');

  // Native Firefox 115-118 accepts these invalid numeric hosts.
  /*
  assert.throws(() => new URL('http://1.2.3.4.5/'), 'IPv4 with > 4 parts');
  assert.throws(() => new URL('http://a.b.c.d.5/'), 'host ending in number with non-numeric parts');
  assert.throws(() => new URL('http://foo.1/'), 'host ending in number with non-IPv4');
  */

  // https://url.spec.whatwg.org/#forbidden-domain-code-point
  assert.throws(() => new URL('http://a\u0001b.example.com/'), 'C0 control in a domain');
  assert.throws(() => new URL('https://a\u001Fb/'), 'C0 control in a domain');
  assert.throws(() => new URL('ws://a\u000Bb/'), 'C0 control in a domain');
  // assert.throws(() => new URL('file://a\u000Cb/c'), 'C0 control in a file: domain'); // 'ab' in Chromium and WebKit, '' in FF
  assert.throws(() => new URL('http://a\u007Fb.example.com/'), 'DELETE in a domain');
  assert.throws(() => new URL('http://a\u0085b.example.com/'), 'C1 control in a domain');
  assert.throws(() => new URL('http://a\u202Eb.example.com/'), 'right-to-left override in a domain');
  assert.throws(() => new URL('http://a\uFFFDb.example.com/'), 'replacement character in a domain');
  assert.throws(() => new URL('http://a\uFDD0b.example.com/'), 'noncharacter in a domain');
  assert.throws(() => new URL('http://a\uFFFFb.example.com/'), 'noncharacter in a domain');
  assert.throws(() => new URL('http://a\uE000b.example.com/'), 'private use character in a domain');
  assert.throws(() => new URL('http://a\uD800b.example.com/'), 'lone surrogate in a domain');
  // assert.throws(() => new URL('http://a\u00A0b.example.com/'), 'no-break space in a domain'); // 'a%20b.example.com' in Chromium
  // assert.throws(() => new URL('http://a\u3000b.example.com/'), 'ideographic space in a domain'); // 'a%20b.example.com' in Chromium
  // assert.throws(() => new URL('http://a\uFF03b.example.com/'), 'full-width form of a forbidden domain code point'); // accepted by native Chromium 118
  assert.throws(() => new URL('http://\u00AD/'), 'domain mapped to the empty string');

  // the forbidden host code point set is smaller - an opaque host keeps them percent-encoded
  // Native Chromium 118-129 and Firefox 115-132 return an empty hostname.
  // assert.same(new URL('nonspecial://a\u0001b/').hostname, 'a%01b', 'C0 control in an opaque host');
  // assert.same(new URL('nonspecial://a\u007Fb/').hostname, 'a%7Fb', 'DELETE in an opaque host');

  // https://www.unicode.org/reports/tr46/#IDNA_Mapping_Table
  assert.same(new URL('http://a\u00ADb.example.com/').hostname, 'ab.example.com', 'ignored code point in a domain');
  assert.same(new URL('http://a\u034Fb.example.com/').hostname, 'ab.example.com', 'ignored code point in a domain');
  assert.same(new URL('http://a\u180Bb.example.com/').hostname, 'ab.example.com', 'ignored code point in a domain');
  assert.same(new URL('http://a\u200Bb.example.com/').hostname, 'ab.example.com', 'ignored code point in a domain');
  assert.same(new URL('http://a\u2060b.example.com/').hostname, 'ab.example.com', 'ignored code point in a domain');
  assert.same(new URL('http://a\uFE00b.example.com/').hostname, 'ab.example.com', 'ignored code point in a domain');
  assert.same(new URL('http://a\uFEFFb.example.com/').hostname, 'ab.example.com', 'ignored code point in a domain');
  assert.same(new URL('http://a\uDB40\uDD00b.example.com/').hostname, 'ab.example.com', 'ignored code point in a domain');
  // an older UTS#46 table rejects the entries below instead of ignoring them - Node < 24 ships one
  if (URL.canParse('http://a\u180Eb.example.com/')) {
    assert.same(new URL('http://a\u115Fb.example.com/').hostname, 'ab.example.com', 'ignored code point in a domain');
    assert.same(new URL('http://a\u17B4b.example.com/').hostname, 'ab.example.com', 'ignored code point in a domain');
    assert.same(new URL('http://a\u180Eb.example.com/').hostname, 'ab.example.com', 'ignored code point in a domain');
    assert.same(new URL('http://a\u206Ab.example.com/').hostname, 'ab.example.com', 'ignored code point in a domain');
    assert.same(new URL('http://a\u3164b.example.com/').hostname, 'ab.example.com', 'ignored code point in a domain');
    assert.same(new URL('http://a\uFFA0b.example.com/').hostname, 'ab.example.com', 'ignored code point in a domain');
  }
  assert.same(new URL('http://\uFF27\uFF4F.com/').hostname, 'go.com', 'full-width form mapped to ASCII');
  assert.same(new URL('http://\uFF10\uFF38\uFF43\uFF10\uFF0E\uFF10\uFF12\uFF15\uFF10\uFF0E\uFF10\uFF11/').hostname, '192.168.0.1', 'full-width form mapped to an IPv4 address');

  // a domain is percent-decoded first, https://url.spec.whatwg.org/#concept-host-parser
  assert.same(new URL('http://%41.example.com/').hostname, 'a.example.com', 'percent-decoded domain');
  assert.same(new URL('http://%D0%B1.com/').hostname, 'xn--90a.com', 'percent-decoded non-ASCII domain');
  assert.throws(() => new URL('http://%01.example.com/'), 'percent-decoded forbidden domain code point');
  assert.throws(() => new URL('http://a%b'), 'invalid percent sequence in a domain');
  assert.same(new URL('http://%31%32%37.0.0.1/').hostname, '127.0.0.1', 'percent-decoded domain parsed as IPv4');
  assert.same(new URL('http://127.0.0.%31/').hostname, '127.0.0.1', 'percent-decoded IPv4 last part');
  assert.same(new URL('http://%30x7f.0.0.1/').hostname, '127.0.0.1', 'percent-decoded hexadecimal IPv4 part');
  assert.throws(() => new URL('http://a%D0/'), 'percent sequence truncated by the end of a domain');

  // a code point whose UTS#46 mapping holds a forbidden domain code point is rejected too
  assert.throws(() => new URL('http://a\uFE6Ab.example.com/'), 'small percent sign in a domain');
  // assert.throws(() => new URL('http://a\uFE5Fb.example.com/'), 'small number sign in a domain'); // accepted by native Chromium 118
  assert.throws(() => new URL('http://a\uFE68b.example.com/'), 'small reverse solidus in a domain');
  assert.throws(() => new URL('http://a\u2100b.example.com/'), 'account-of sign in a domain');
  assert.throws(() => new URL('http://a\u2A74b.example.com/'), 'double colon equal in a domain');
  // assert.throws(() => new URL('http://a\u00A8b.example.com/'), 'diaeresis in a domain'); // 'xn--a%20b-eec' in Chromium
  assert.same(new URL('http://a\u180Ab.example.com/').hostname, 'xn--ab-t0o.example.com', 'code point just outside the ignored range');

  // the mapping table holds no supplementary code point, and must not be probed with a truncated one
  assert.same(new URL('http://a\uD807\uDFC0b.example.com/').hostname, 'xn--ab-ed4p.example.com', 'supplementary code point sharing low units with the table');
  assert.same(new URL('http://a\uD808\uDD00b.example.com/').hostname, 'xn--ab-t44p.example.com', 'supplementary code point sharing low units with the table');

  // a lone surrogate is percent-encoded as U+FFFD, https://encoding.spec.whatwg.org/#utf-8-encoder
  assert.same(new URL('http://example.com/a\uD800b').pathname, '/a%EF%BF%BDb', 'lone surrogate in a path');
  assert.same(new URL('http://example.com/?a\uD800b').search, '?a%EF%BF%BDb', 'lone surrogate in a query');
  assert.same(new URL('http://example.com/#a\uD800b').hash, '#a%EF%BF%BDb', 'lone surrogate in a fragment');
  // Native Chromium 118-129 and Firefox 115-132 return an empty hostname.
  // assert.same(new URL('nonspecial://a\uD800b/').hostname, 'a%EF%BF%BDb', 'lone surrogate in an opaque host');
  assert.same(new URL('http://a\uD800b@example.com/').username, 'a%EF%BF%BDb', 'lone surrogate in a username');
  assert.same(new URL('http://example.com/\uDC00').pathname, '/%EF%BF%BD', 'trailing lone surrogate');
  assert.same(new URL('http://example.com/\uD83D\uDE00').pathname, '/%F0%9F%98%80', 'surrogate pair is kept');
  assert.same(String(new URL('file:///var/log/system.log')), 'file:///var/log/system.log', 'file scheme');

  // Chromium ~ 145 on Windows works differently
  // assert.same(String(new URL('file:foo')), 'file:///foo', 'file scheme without slashes');
  // assert.same(new URL('file:foo').host, '', 'file scheme without slashes: host');

  // assert.same(String(new URL('file://nnsc.nsf.net/bar/baz')), 'file://nnsc.nsf.net/bar/baz', 'file scheme'); // 'file:///bar/baz' in FF
  // assert.same(String(new URL('file://localhost/bar/baz')), 'file:///bar/baz', 'file scheme'); // 'file://localhost/bar/baz' in Chrome

  // FILE_SLASH state: host should be inherited from file: base
  // some browsers have a non-spec-compliant native URL implementation for this case
  if (new URL('file:/path', 'file://somehost/dir/file').host === 'somehost') {
    assert.same(new URL('file:/path', 'file://somehost/dir/file').href, 'file://somehost/path', 'file slash: href with inherited host');
  }

  assert.throws(() => new URL(), 'TypeError: Failed to construct URL: 1 argument required, but only 0 present.');
  assert.throws(() => new URL(''), 'TypeError: Failed to construct URL: Invalid URL');
  // Node 19.7
  // https://github.com/nodejs/node/issues/46755
  // assert.throws(() => new URL('', 'about:blank'), 'TypeError: Failed to construct URL: Invalid URL');
  assert.throws(() => new URL('abc'), 'TypeError: Failed to construct URL: Invalid URL');
  assert.throws(() => new URL('//abc'), 'TypeError: Failed to construct URL: Invalid URL');
  assert.throws(() => new URL('http:///www.domain.com/', 'abc'), 'TypeError: Failed to construct URL: Invalid base URL');
  assert.throws(() => new URL('http:///www.domain.com/', null), 'TypeError: Failed to construct URL: Invalid base URL');
  assert.throws(() => new URL('//abc', null), 'TypeError: Failed to construct URL: Invalid base URL');
  assert.throws(() => new URL('http://[20:0:0:1:0:0:0:ff'), 'incorrect IPv6');
  assert.throws(() => new URL('http://[20:0:0:1:0:0:0:fg]'), 'incorrect IPv6');
  // assert.throws(() => new URL('http://a%b'), 'forbidden host code point'); // no error in FF
  assert.throws(() => new URL('1http://zloirock.ru'), 'incorrect scheme');
  assert.throws(() => new URL('a,b://example.com'), 'comma in scheme');
  assert.same(String(new URL('a+b-c.d://example.com')), 'a+b-c.d://example.com', 'valid scheme with +, -, .');
  // assert.same(String(new URL('relative', 'foo://host')), 'foo://host/relative', 'relative URL with non-special base with empty path'); // throws in native Chromium 118-129
  assert.same(String(new URL('relative', 'https://example.com')), 'https://example.com/relative', 'relative URL with special base with empty path');
  assert.same(String(new URL('bar', 'foo://host/a/b')), 'foo://host/a/bar', 'relative URL with non-special base with path');

  for (const [input, base, expected] of [
    // ['file://h/C:/a/b', undefined, 'file://h/C:/a/b'], // fails in Chrome 95 (Windows), Firefox 157, Node 14.21.3, Deno 2.9.8
    // ['file://example.net/C:/', undefined, 'file://example.net/C:/'], // fails in Chrome 95 (Windows), Firefox 157, Node 14.21.3, Deno 2.9.8
    // ['file://0.0.0.0/C:/', undefined, 'file://0.0.0.0/C:/'], // fails in Chrome 95 (Windows), Firefox 157, Node 14.21.3, Deno 2.9.8
    // ['file://[::1]/C:/', undefined, 'file://[::1]/C:/'], // fails in Chrome 95 (Windows), Firefox 157, Node 14.21.3, Deno 2.9.8
    // ['/', 'file://h/C:/a/b', 'file://h/C:/'], // fails in Chrome 95 (Windows), Chrome 155 (macOS), Firefox 157, Node 14.21.3, Deno 2.9.8
    // ['C|', 'file://host/dir/file', 'file://host/C:'], // fails in Chrome 155, Firefox 157, Node 14.21.3, Deno 2.9.8
    // ['/c:/foo', 'file://host/path', 'file://host/c:/foo'], // fails in Chrome 155 (Windows), Firefox 157, Node 14.21.3, Deno 2.9.8
    // ['file://spider///', undefined, 'file://spider///'], // fails in Firefox 157, Node 14.21.3, Deno 2.9.8
    // ['file:////foo', undefined, 'file:////foo'], // fails in Chrome 155, Node 14.21.3, Deno 2.9.8
    // ['file:////foo?query#fragment', undefined, 'file:////foo?query#fragment'], // fails in Chrome 155, Node 14.21.3, Deno 2.9.8
    // ['file://localhost//a//../..//', undefined, 'file://///'], // fails in Chrome 155, Node 14.21.3, Deno 2.9.8
    // ['/////mouse', 'file:///elephant', 'file://///mouse'], // fails in Chrome 155, Node 14.21.3, Deno 2.9.8
    ['file:', undefined, 'file:///'],
    // ['file:foo', undefined, 'file:///foo'], // fails in Chrome 155 (Windows)
  ]) {
    const url = new URL(input, base);
    assert.same(url.href, expected, input);
    assert.same(new URL(url.href).href, expected, 'serialization round trip');
  }
});

QUnit.test('URL converts lone surrogates before removing tabs and newlines', assert => {
  for (const separator of ['\t', '\n', '\r', '\t\n\r']) {
    const input = `a\uD800${ separator }\uDC00b`;
    const expected = 'a%EF%BF%BD%EF%BF%BDb';
    const url = new URL(`http://${ input }:${ input }@example.com/${ input }?${ input }#${ input }`);
    assert.same(url.href, `http://${ expected }:${ expected }@example.com/${ expected }?${ expected }#${ expected }`, 'constructor');
    assert.same(new URL('b', `http://example.com/${ input }/`).pathname, `/${ expected }/b`, 'base');
    assert.same(new URL(`mailto:${ input }`).pathname, expected, 'opaque path');
    // Native Chromium 156 percent-encodes tabs and newlines in data: paths.
    // https://issues.chromium.org/issues/344343043
    // assert.same(new URL(`data:${ input }`).pathname, expected, 'data: path');
    assert.throws(() => new URL(`http://${ input }/`), TypeError, 'invalid domain');
    assert.throws(() => new URL('b', `http://${ input }/`), TypeError, 'invalid base domain');

    if (DESCRIPTORS) {
      for (const [property, value, result] of [
        ['href', `http://example.com/${ input }`, `http://example.com/${ expected }`],
        ['host', input, 'example.com'],
        ['hostname', input, 'example.com'],
        // Native Firefox 115-117 keeps tabs and newlines in pathname.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1818374
        // ['pathname', input, `/${ expected }`],
        ['search', input, `?${ expected }`],
        ['hash', input, `#${ expected }`],
      ]) {
        const target = new URL('http://example.com/');
        target[property] = value;
        assert.same(target[property], result, `${ property } setter`);
      }
    }
  }

  assert.same(new URL('http://example.com/a\uD800\uDC00b').pathname, '/a%F0%90%80%80b', 'surrogate pair is kept');
  assert.same(new URL('http://example.com/a\uD800b').pathname, '/a%EF%BF%BDb', 'lone surrogate without whitespace');
});

QUnit.test('URL#href', assert => {
  let url = new URL('http://zloirock.ru/');

  if (DESCRIPTORS) {
    assert.false(hasOwnProperty.call(url, 'href'));
    const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'href');
    assert.true(descriptor.enumerable);
    assert.true(descriptor.configurable);
    assert.same(typeof descriptor.get, 'function');
    assert.same(typeof descriptor.set, 'function');
  }

  assert.same(url.href, 'http://zloirock.ru/');

  if (DESCRIPTORS) {
    url.searchParams.append('foo', 'bar');
    assert.same(url.href, 'http://zloirock.ru/?foo=bar');

    url = new URL('http://zloirock.ru/foo');
    url.href = 'https://測試';
    assert.same(url.href, 'https://xn--g6w251d/', 'unicode parsing');
    assert.same(String(url), 'https://xn--g6w251d/', 'unicode parsing');

    url = new URL('http://zloirock.ru/foo');
    url.href = 'https://xxпривет.тест';
    assert.same(url.href, 'https://xn--xx-flcmn5bht.xn--e1aybc/', 'unicode parsing');
    assert.same(String(url), 'https://xn--xx-flcmn5bht.xn--e1aybc/', 'unicode parsing');

    url = new URL('http://zloirock.ru/foo');
    url.href = 'https://xxПРИВЕТ.тест';
    assert.same(url.href, 'https://xn--xx-flcmn5bht.xn--e1aybc/', 'unicode parsing');
    assert.same(String(url), 'https://xn--xx-flcmn5bht.xn--e1aybc/', 'unicode parsing');

    url = new URL('http://zloirock.ru/');
    url.href = 'http://0300.168.0xF0';
    assert.same(url.href, 'http://192.168.0.240/');
    assert.same(String(url), 'http://192.168.0.240/');

    url = new URL('http://zloirock.ru/');
    url.href = 'http://[20:0:0:1:0:0:0:ff]';
    assert.same(url.href, 'http://[20:0:0:1::ff]/');
    assert.same(String(url), 'http://[20:0:0:1::ff]/');

    // url = new URL('http://zloirock.ru/');
    // url.href = 'http://257.168.0xF0'; // TypeError and Safari
    // assert.same(url.href, 'http://257.168.0xf0/', 'incorrect IPv4 parsed as host'); // `F` instead of `f` in Chrome
    // assert.same(String(url), 'http://257.168.0xf0/', 'incorrect IPv4 parsed as host'); // `F` instead of `f` in Chrome

    url = new URL('http://zloirock.ru/');
    url.href = 'http://0300.168.0xG0';
    assert.same(url.href, 'http://0300.168.0xg0/', 'incorrect IPv4 parsed as host');
    assert.same(String(url), 'http://0300.168.0xg0/', 'incorrect IPv4 parsed as host');

    url = new URL('http://192.168.0.240/');
    url.href = 'file:///var/log/system.log';
    assert.same(url.href, 'file:///var/log/system.log', 'file -> ip');
    assert.same(String(url), 'file:///var/log/system.log', 'file -> ip');

    url = new URL('file:///var/log/system.log');
    url.href = 'http://0300.168.0xF0';
    // Node 19.7
    // https://github.com/nodejs/node/issues/46755
    // assert.same(url.href, 'http://192.168.0.240/', 'file -> http');
    // assert.same(String(url), 'http://192.168.0.240/', 'file -> http');

    // assert.throws(() => new URL('http://zloirock.ru/').href = undefined, 'incorrect URL'); // no error in Chrome
    // assert.throws(() => new URL('http://zloirock.ru/').href = '', 'incorrect URL'); // no error in Chrome
    // assert.throws(() => new URL('http://zloirock.ru/').href = 'abc', 'incorrect URL'); // no error in Chrome
    // assert.throws(() => new URL('http://zloirock.ru/').href = '//abc', 'incorrect URL'); // no error in Chrome
    // assert.throws(() => new URL('http://zloirock.ru/').href = 'http://[20:0:0:1:0:0:0:ff', 'incorrect IPv6'); // no error in Chrome
    // assert.throws(() => new URL('http://zloirock.ru/').href = 'http://[20:0:0:1:0:0:0:fg]', 'incorrect IPv6'); // no error in Chrome
    // assert.throws(() => new URL('http://zloirock.ru/').href = 'http://a%b', 'forbidden host code point'); // no error in Chrome and FF
    // assert.throws(() => new URL('http://zloirock.ru/').href = '1http://zloirock.ru', 'incorrect scheme'); // no error in Chrome

    const href = 'https://user:pass@example.com:8080/path?q=1#fragment';
    url = new URL(href);
    const params = url.searchParams;
    // fails in Chrome 92 (Windows), Firefox 57
    // for (const invalid of ['https://evil.com:abc', 'http:', 'relative/path', 'http://[::1', 'http://a%b']) {
    //   assert.throws(() => { url.href = invalid; }, TypeError, invalid);
    //   assert.same(url.href, href, 'all URL components are preserved');
    //   assert.same(url.origin, 'https://example.com:8080', 'origin is still readable');
    //   assert.same(url.search, '?q=1');
    //   assert.same(url.searchParams, params, 'searchParams identity is preserved');
    //   assert.same(String(params), 'q=1', 'searchParams contents are preserved');
    // }

    url.href = 'foo:/next?x=2';
    assert.same(url.href, 'foo:/next?x=2', 'successful assignment replaces the URL');
    assert.same(url.searchParams, params, 'successful assignment preserves searchParams identity');
    assert.same(String(params), 'x=2');
    params.set('x', '3');
    assert.same(url.href, 'foo:/next?x=3', 'searchParams remains bound to the URL');
    url.search = '?y=4';
    assert.same(String(params), 'y=4', 'URL still updates the same searchParams');

    // fails in Chrome 92 (Windows), Firefox 157, Deno 2.9.8
    // url = new URL('https://example.com/path');
    // assert.throws(() => { url.href = 'http:'; }, TypeError);
    // url.protocol = 'file:';
    // assert.same(url.href, 'file://example.com/path', 'failed assignment cannot create a file URL with a null host');

    // fails in Chrome 92 (Windows), Deno 1.10.3
    // url = new URL('https://example.com/path?q=1');
    // assert.throws(() => {
    //   url.href = {
    //     toString() {
    //       url.hash = 'changed';
    //       return 'https://evil.com:abc';
    //     },
    //   };
    // }, TypeError);
    // assert.same(url.href, 'https://example.com/path?q=1#changed');
    //
    // const error = new Error('conversion');
    // assert.throws(() => {
    //   url.href = { toString() { throw error; } };
    // }, error);
    // assert.same(url.href, 'https://example.com/path?q=1#changed');
  }

  // URL serializing step 3 - /. prefix for non-special URLs with null host and path starting with empty segment
  // Chromium ~ 145 on Windows works differently
  // assert.same(new URL('x:/a/..//b').href, 'x:/.//b', '/. prefix prevents ambiguous serialization');
  // assert.same(new URL('x:/a/..//b').pathname, '//b', 'pathname is not affected by /. prefix');
  // assert.same(new URL('x:/.//b').href, 'x:/.//b', '/. prefix is idempotent');
  // assert.same(new URL(new URL('x:/a/..//b').href).pathname, '//b', '/. prefix round-trips correctly');
});

QUnit.test('URL#origin', assert => {
  const url = new URL('http://es6.zloirock.ru/tests.html');

  if (DESCRIPTORS) {
    assert.false(hasOwnProperty.call(url, 'origin'));
    const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'origin');
    assert.true(descriptor.enumerable);
    assert.true(descriptor.configurable);
    assert.same(typeof descriptor.get, 'function');
  }

  assert.same(url.origin, 'http://es6.zloirock.ru');

  assert.same(new URL('https://測試/tests').origin, 'https://xn--g6w251d');

  // blob URL origin should resolve to the inner URL's origin
  assert.same(new URL('blob:https://example.com/some-uuid').origin, 'https://example.com');

  for (const [input, expected] of [
    // ['blob:ftp://host/path', 'null'], // fails in Chrome 155, Firefox 127, Safari 16, Node 20.0.0, Deno 2.9.8, Bun 1.4.4
    // ['blob:ws://example.org/', 'null'], // fails in Chrome 155, Firefox 127, Safari 16, Node 20.0.0, Deno 2.9.8, Bun 1.4.4
    // ['blob:wss://example.org/', 'null'], // fails in Chrome 155, Firefox 127, Safari 16, Node 20.0.0, Deno 2.9.8, Bun 1.4.4
    // ['blob:blob:https://example.org/', 'null'], // fails in Chrome 67 (Windows), Firefox 127, Safari 16, Node 17.0.1, Deno 2.9.8
    // ['blob://h/http:example.com', 'null'], // fails in Safari 15, Node 17.0.1
    // ['blob:/https://example.org/', 'null'], // fails in Safari 15
    // ['blob:', 'null'], // fails in Safari 15
    ['blob:null/uuid', 'null'],
    // ['blob:file:///x', new URL('file:///x').origin], // fails in Node 20.0.0, Bun 1.4.4
    ['blob:https://example.org/uuid', 'https://example.org'],
    ['blob:http://example.org:88/uuid', 'http://example.org:88'],
  ]) {
    assert.same(new URL(input).origin, expected, input);
  }
});

QUnit.test('URL#protocol', assert => {
  let url = new URL('http://zloirock.ru/');

  if (DESCRIPTORS) {
    assert.false(hasOwnProperty.call(url, 'protocol'));
    const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'protocol');
    assert.true(descriptor.enumerable);
    assert.true(descriptor.configurable);
    assert.same(typeof descriptor.get, 'function');
    assert.same(typeof descriptor.set, 'function');
  }

  assert.same(url.protocol, 'http:');

  if (DESCRIPTORS) {
    url = new URL('http://zloirock.ru/');
    url.protocol = 'https';
    assert.same(url.protocol, 'https:');
    assert.same(String(url), 'https://zloirock.ru/');

    // https://nodejs.org/api/url.html#url_special_schemes
    // url = new URL('http://zloirock.ru/');
    // url.protocol = 'fish';
    // assert.same(url.protocol, 'http:');
    // assert.same(url.href, 'http://zloirock.ru/');
    // assert.same(String(url), 'http://zloirock.ru/');

    url = new URL('http://zloirock.ru/');
    url.protocol = '1http';
    assert.same(url.protocol, 'http:');
    assert.same(url.href, 'http://zloirock.ru/', 'incorrect scheme');
    assert.same(String(url), 'http://zloirock.ru/', 'incorrect scheme');

    // Chromium ~ 145 on Windows works differently
    // url = new URL('file:foo');
    // url.protocol = 'http:';
    // assert.same(url.protocol, 'file:', 'file with empty host: protocol change blocked');
  }
});

QUnit.test('URL#username', assert => {
  let url = new URL('http://zloirock.ru/');

  if (DESCRIPTORS) {
    assert.false(hasOwnProperty.call(url, 'username'));
    const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'username');
    assert.true(descriptor.enumerable);
    assert.true(descriptor.configurable);
    assert.same(typeof descriptor.get, 'function');
    assert.same(typeof descriptor.set, 'function');
  }

  assert.same(url.username, '');

  url = new URL('http://username@zloirock.ru/');
  assert.same(url.username, 'username');

  if (DESCRIPTORS) {
    url = new URL('http://zloirock.ru/');
    url.username = 'username';
    assert.same(url.username, 'username');
    assert.same(String(url), 'http://username@zloirock.ru/');

    // IPv4 address 0.0.0.0 (stored as number 0) should allow username
    url = new URL('http://0.0.0.0/');
    url.username = 'user';
    assert.same(url.username, 'user', 'username settable on 0.0.0.0');
    assert.same(String(url), 'http://user@0.0.0.0/', 'href correct after setting username on 0.0.0.0');
  }
});

QUnit.test('URL#password', assert => {
  let url = new URL('http://zloirock.ru/');

  if (DESCRIPTORS) {
    assert.false(hasOwnProperty.call(url, 'password'));
    const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'password');
    assert.true(descriptor.enumerable);
    assert.true(descriptor.configurable);
    assert.same(typeof descriptor.get, 'function');
    assert.same(typeof descriptor.set, 'function');
  }

  assert.same(url.password, '');

  url = new URL('http://username:password@zloirock.ru/');
  assert.same(url.password, 'password');

  // url = new URL('http://:password@zloirock.ru/'); // TypeError in FF
  // assert.same(url.password, 'password');

  if (DESCRIPTORS) {
    url = new URL('http://zloirock.ru/');
    url.username = 'username';
    url.password = 'password';
    assert.same(url.password, 'password');
    assert.same(String(url), 'http://username:password@zloirock.ru/');

    // url = new URL('http://zloirock.ru/');
    // url.password = 'password';
    // assert.same(url.password, 'password'); // '' in FF
    // assert.same(String(url), 'http://:password@zloirock.ru/'); // 'http://zloirock.ru/' in FF
  }
});

QUnit.test('URL#host', assert => {
  let url = new URL('http://zloirock.ru:81/path');

  if (DESCRIPTORS) {
    assert.false(hasOwnProperty.call(url, 'host'));
    const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'host');
    assert.true(descriptor.enumerable);
    assert.true(descriptor.configurable);
    assert.same(typeof descriptor.get, 'function');
    assert.same(typeof descriptor.set, 'function');
  }

  assert.same(url.host, 'zloirock.ru:81');

  if (DESCRIPTORS) {
    url = new URL('http://zloirock.ru:81/path');
    url.host = 'example.com:82';
    assert.same(url.host, 'example.com:82');
    assert.same(String(url), 'http://example.com:82/path');

    // url = new URL('http://zloirock.ru:81/path');
    // url.host = 'other?domain.com';
    // assert.same(String(url), 'http://other:81/path'); // 'http://other/?domain.com/path' in Safari

    url = new URL('https://www.mydomain.com:8080/path/');
    url.host = 'www.otherdomain.com:80';
    assert.same(url.href, 'https://www.otherdomain.com:80/path/', 'set default port for another protocol');

    // url = new URL('https://www.mydomain.com:8080/path/');
    // url.host = 'www.otherdomain.com:443';
    // assert.same(url.href, 'https://www.otherdomain.com/path/', 'set default port');

    url = new URL('http://zloirock.ru/foo');
    url.host = '測試';
    assert.same(url.host, 'xn--g6w251d', 'unicode parsing');
    assert.same(String(url), 'http://xn--g6w251d/foo', 'unicode parsing');

    url = new URL('http://zloirock.ru/foo');
    url.host = 'xxпривет.тест';
    assert.same(url.host, 'xn--xx-flcmn5bht.xn--e1aybc', 'unicode parsing');
    assert.same(String(url), 'http://xn--xx-flcmn5bht.xn--e1aybc/foo', 'unicode parsing');

    url = new URL('http://zloirock.ru/foo');
    url.host = 'xxПРИВЕТ.тест';
    assert.same(url.host, 'xn--xx-flcmn5bht.xn--e1aybc', 'unicode parsing');
    assert.same(String(url), 'http://xn--xx-flcmn5bht.xn--e1aybc/foo', 'unicode parsing');

    url = new URL('http://zloirock.ru/foo');
    url.host = '0300.168.0xF0';
    assert.same(url.host, '192.168.0.240');
    assert.same(String(url), 'http://192.168.0.240/foo');

    // url = new URL('http://zloirock.ru/foo');
    // url.host = '[20:0:0:1:0:0:0:ff]';
    // assert.same(url.host, '[20:0:0:1::ff]'); // ':0' in Chrome, 'zloirock.ru' in Safari
    // assert.same(String(url), 'http://[20:0:0:1::ff]/foo'); // 'http://[20:0/foo' in Chrome, 'http://zloirock.ru/foo' in Safari

    // url = new URL('file:///var/log/system.log');
    // url.host = 'nnsc.nsf.net'; // does not work in FF
    // assert.same(url.hostname, 'nnsc.nsf.net', 'file');
    // assert.same(String(url), 'file://nnsc.nsf.net/var/log/system.log', 'file');

    // url = new URL('http://zloirock.ru/');
    // url.host = '[20:0:0:1:0:0:0:ff';
    // assert.same(url.host, 'zloirock.ru', 'incorrect IPv6'); // ':0' in Chrome
    // assert.same(String(url), 'http://zloirock.ru/', 'incorrect IPv6'); // 'http://[20:0/' in Chrome

    // url = new URL('http://zloirock.ru/');
    // url.host = '[20:0:0:1:0:0:0:fg]';
    // assert.same(url.host, 'zloirock.ru', 'incorrect IPv6'); // ':0' in Chrome
    // assert.same(String(url), 'http://zloirock.ru/', 'incorrect IPv6'); // 'http://[20:0/' in Chrome

    // url = new URL('http://zloirock.ru/');
    // url.host = 'a%b';
    // assert.same(url.host, 'zloirock.ru', 'forbidden host code point'); // '' in Chrome, 'a%b' in FF
    // assert.same(String(url), 'http://zloirock.ru/', 'forbidden host code point'); // 'http://a%25b/' in Chrome, 'http://a%b/' in FF
  }
});

QUnit.test('URL#hostname', assert => {
  // a value the domain parser rejects leaves the URL untouched
  const forbiddenMapped = new URL('http://example.com/p?q#h');
  forbiddenMapped.hostname = 'a\uFE6Ab.example.com';
  assert.same(forbiddenMapped.href, 'http://example.com/p?q#h', 'hostname setter is a no-op on a rejected domain');

  let url = new URL('http://zloirock.ru:81/');

  if (DESCRIPTORS) {
    assert.false(hasOwnProperty.call(url, 'hostname'));
    const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'hostname');
    assert.true(descriptor.enumerable);
    assert.true(descriptor.configurable);
    assert.same(typeof descriptor.get, 'function');
    assert.same(typeof descriptor.set, 'function');
  }

  assert.same(url.hostname, 'zloirock.ru');

  if (DESCRIPTORS) {
    url = new URL('http://zloirock.ru:81/');
    url.hostname = 'example.com';
    assert.same(url.hostname, 'example.com');
    assert.same(String(url), 'http://example.com:81/');

    // Native Deno 1.46.3-2.5.7 accept a port instead of ignoring the assignment.
    // url = new URL('http://zloirock.ru:81/');
    // url.hostname = 'example.com:82';
    // assert.same(url.hostname, 'zloirock.ru', 'hostname with port is rejected');
    // assert.same(String(url), 'http://zloirock.ru:81/', 'hostname with port is rejected');

    url = new URL('http://zloirock.ru/foo');
    url.hostname = '測試';
    assert.same(url.hostname, 'xn--g6w251d', 'unicode parsing');
    assert.same(String(url), 'http://xn--g6w251d/foo', 'unicode parsing');

    url = new URL('http://zloirock.ru/foo');
    url.hostname = 'xxпривет.тест';
    assert.same(url.hostname, 'xn--xx-flcmn5bht.xn--e1aybc', 'unicode parsing');
    assert.same(String(url), 'http://xn--xx-flcmn5bht.xn--e1aybc/foo', 'unicode parsing');

    url = new URL('http://zloirock.ru/foo');
    url.hostname = 'xxПРИВЕТ.тест';
    assert.same(url.hostname, 'xn--xx-flcmn5bht.xn--e1aybc', 'unicode parsing');
    assert.same(String(url), 'http://xn--xx-flcmn5bht.xn--e1aybc/foo', 'unicode parsing');

    url = new URL('http://zloirock.ru/foo');
    url.hostname = '0300.168.0xF0';
    assert.same(url.hostname, '192.168.0.240');
    assert.same(String(url), 'http://192.168.0.240/foo');

    // url = new URL('http://zloirock.ru/foo');
    // url.hostname = '[20:0:0:1:0:0:0:ff]';
    // assert.same(url.hostname, '[20:0:0:1::ff]'); // 'zloirock.ru' in Safari
    // assert.same(String(url), 'http://[20:0:0:1::ff]/foo'); // 'http://zloirock.ru/foo' in Safari

    // url = new URL('file:///var/log/system.log');
    // url.hostname = 'nnsc.nsf.net'; // does not work in FF
    // assert.same(url.hostname, 'nnsc.nsf.net', 'file');
    // assert.same(String(url), 'file://nnsc.nsf.net/var/log/system.log', 'file');

    // url = new URL('http://zloirock.ru/');
    // url.hostname = '[20:0:0:1:0:0:0:ff';
    // assert.same(url.hostname, 'zloirock.ru', 'incorrect IPv6'); // '' in Chrome
    // assert.same(String(url), 'http://zloirock.ru/', 'incorrect IPv6'); // 'http://[20:0:0:1:0:0:0:ff' in Chrome

    // url = new URL('http://zloirock.ru/');
    // url.hostname = '[20:0:0:1:0:0:0:fg]';
    // assert.same(url.hostname, 'zloirock.ru', 'incorrect IPv6'); // '' in Chrome
    // assert.same(String(url), 'http://zloirock.ru/', 'incorrect IPv6'); // 'http://[20:0:0:1:0:0:0:ff/' in Chrome

    // url = new URL('http://zloirock.ru/');
    // url.hostname = 'a%b';
    // assert.same(url.hostname, 'zloirock.ru', 'forbidden host code point'); // '' in Chrome, 'a%b' in FF
    // assert.same(String(url), 'http://zloirock.ru/', 'forbidden host code point'); // 'http://a%25b/' in Chrome, 'http://a%b/' in FF
  }
});

QUnit.test('URL#port', assert => {
  let url = new URL('http://zloirock.ru:1337/');

  if (DESCRIPTORS) {
    assert.false(hasOwnProperty.call(url, 'port'));
    const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'port');
    assert.true(descriptor.enumerable);
    assert.true(descriptor.configurable);
    assert.same(typeof descriptor.get, 'function');
    assert.same(typeof descriptor.set, 'function');
  }

  assert.same(url.port, '1337');

  if (DESCRIPTORS) {
    url = new URL('http://zloirock.ru/');
    url.port = 80;
    assert.same(url.port, '');
    assert.same(String(url), 'http://zloirock.ru/');
    url.port = 1337;
    assert.same(url.port, '1337');
    assert.same(String(url), 'http://zloirock.ru:1337/');
    // url.port = 'abcd';
    // assert.same(url.port, '1337'); // '0' in Chrome
    // assert.same(String(url), 'http://zloirock.ru:1337/'); // 'http://zloirock.ru:0/' in Chrome
    // url.port = '5678abcd';
    // assert.same(url.port, '5678'); // '1337' in FF
    // assert.same(String(url), 'http://zloirock.ru:5678/'); // 'http://zloirock.ru:1337/"' in FF
    url.port = 1234.5678;
    assert.same(url.port, '1234');
    assert.same(String(url), 'http://zloirock.ru:1234/');
    // url.port = 1e10;
    // assert.same(url.port, '1234'); // '0' in Chrome
    // assert.same(String(url), 'http://zloirock.ru:1234/'); // 'http://zloirock.ru:0/' in Chrome

    // IPv4 address 0.0.0.0 (stored as number 0) should allow port
    url = new URL('http://0.0.0.0/');
    url.port = '8080';
    assert.same(url.port, '8080', 'port settable on 0.0.0.0');
    assert.same(String(url), 'http://0.0.0.0:8080/', 'href correct after setting port on 0.0.0.0');
  }
});

QUnit.test('URL#pathname', assert => {
  let url = new URL('http://zloirock.ru/foo/bar');

  if (DESCRIPTORS) {
    assert.false(hasOwnProperty.call(url, 'pathname'));
    const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'pathname');
    assert.true(descriptor.enumerable);
    assert.true(descriptor.configurable);
    assert.same(typeof descriptor.get, 'function');
    assert.same(typeof descriptor.set, 'function');
  }

  assert.same(url.pathname, '/foo/bar');

  // fails in Node 23-
  // url = new URL('http://example.com/a^b');
  // assert.same(url.pathname, '/a%5Eb', 'caret in path is percent-encoded');

  if (DESCRIPTORS) {
    url = new URL('http://zloirock.ru/');
    url.pathname = 'bar/baz';
    assert.same(url.pathname, '/bar/baz');
    assert.same(String(url), 'http://zloirock.ru/bar/baz');

    /*
    for (const [href, pathname, expected] of [
      ['file://host/dir/file', 'C|', 'file://host/C:'], // fails in Chrome 95 (Windows), Chrome 155 (macOS), Firefox 157, Safari 27, Node 14.21.3, Deno 2.9.8, Bun 1.4.4
      ['file://host/dir/file', '/C:/path', 'file://host/C:/path'], // fails in Chrome 95 (Windows), Firefox 157, Node 14.21.3, Deno 2.9.8
      ['file://host/dir/file?x#y', '///path', 'file://host///path?x#y'], // fails in Firefox 157, Node 14.21.3, Deno 2.9.8
      ['file:///unicorn', '//\\/', 'file://////'], // fails in Chrome 155, Firefox 123, Node 14.21.3, Deno 2.9.8
      ['file:///unicorn', '//monkey/..//', 'file://///'], // fails in Chrome 155, Node 14.21.3, Deno 2.9.8
    ]) {
      url = new URL(href);
      url.pathname = pathname;
      assert.same(url.href, expected, pathname);
      url.href = expected;
      assert.same(url.href, expected, 'href setter');
    }
    */

    // fails in Chrome 129 (Windows), Firefox 132, Node 14.21.3
    // for (const pathname of ['', '\t\n\r']) {
    //   url = new URL('foo:/some/path?query#fragment');
    //   url.pathname = pathname;
    //   assert.same(url.href, 'foo:/?query#fragment');
    //   assert.same(url.pathname, '/');
    //   const parsed = new URL(url.href);
    //   parsed.pathname = 'next';
    //   assert.same(parsed.href, 'foo:/next?query#fragment', 'path remains hierarchical after parsing');
    //   assert.same(new URL('child', url).href, 'foo:/child', 'URL remains usable as a base');
    // }

    for (const [href, expected] of [
      ['file:///some/path', 'file:///'],
      // ['foo://somehost/some/path', 'foo://somehost'], // fails in Chrome 129 (Windows), Firefox 132, Safari 14, Deno 2.0.6
      // ['foo:///some/path', 'foo://'], // fails in Chrome 129 (Windows), Firefox 157, Safari 14, Deno 2.9.8
      ['foo:opaque', 'foo:opaque'],
    ]) {
      url = new URL(href);
      url.pathname = '';
      assert.same(url.href, expected, href);
    }
  }
});

QUnit.test('URL#search', assert => {
  let url = new URL('http://zloirock.ru/');

  if (DESCRIPTORS) {
    assert.false(hasOwnProperty.call(url, 'search'));
    const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'search');
    assert.true(descriptor.enumerable);
    assert.true(descriptor.configurable);
    assert.same(typeof descriptor.get, 'function');
    assert.same(typeof descriptor.set, 'function');
  }

  assert.same(url.search, '');

  url = new URL('http://zloirock.ru/?foo=bar');
  assert.same(url.search, '?foo=bar');

  // query percent-encode set
  assert.same(new URL('http://x/?a="<>').search, '?a=%22%3C%3E', 'query percent-encodes ", <, >');
  assert.same(new URL('http://x/?a=\'').search, '?a=%27', 'special query percent-encodes \'');
  // fails in modern Chrome (~145)
  // assert.same(new URL('foo://x/?a=\'').search, '?a=\'', 'non-special query does not percent-encode \'');

  // space in opaque paths should not be percent-encoded
  // eslint-disable-next-line no-script-url -- safe
  assert.same(new URL('javascript:void 0').href, 'javascript:void 0', 'space preserved in opaque path');
  // eslint-disable-next-line no-script-url -- safe
  assert.same(new URL('javascript:void 0').pathname, 'void 0', 'space preserved in opaque pathname');

  // space before query or fragment in opaque paths should be percent-encoded
  /*
  assert.same(new URL('x:path ?query').href, 'x:path%20?query', 'space before query in opaque path encoded as %20');
  assert.same(new URL('x:path ?query').search, '?query', 'query parsed after encoded space');
  assert.same(new URL('x:path #frag').href, 'x:path%20#frag', 'space before fragment in opaque path encoded as %20');
  assert.same(new URL('x:path #frag').hash, '#frag', 'fragment parsed after encoded space');
  assert.same(new URL('x:a b c ?d').pathname, 'a b c%20', 'only space before query encoded');
  assert.same(new URL('x:a b c #d').pathname, 'a b c%20', 'only space before fragment encoded');
  */

  if (DESCRIPTORS) {
    url = new URL('http://zloirock.ru/?');
    assert.same(url.search, '');
    assert.same(String(url), 'http://zloirock.ru/?');
    url.search = 'foo=bar';
    assert.same(url.search, '?foo=bar');
    assert.same(String(url), 'http://zloirock.ru/?foo=bar');
    url.search = '?bar=baz';
    assert.same(url.search, '?bar=baz');
    assert.same(String(url), 'http://zloirock.ru/?bar=baz');
    url.search = '';
    assert.same(url.search, '');
    assert.same(String(url), 'http://zloirock.ru/');
  }
});

QUnit.test('URL#searchParams', assert => {
  let url = new URL('http://zloirock.ru/?foo=bar&bar=baz');

  if (DESCRIPTORS) {
    assert.false(hasOwnProperty.call(url, 'searchParams'));
    const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'searchParams');
    assert.true(descriptor.enumerable);
    assert.true(descriptor.configurable);
    assert.same(typeof descriptor.get, 'function');
  }

  assert.true(url.searchParams instanceof URLSearchParams);
  assert.same(url.searchParams.get('foo'), 'bar');
  assert.same(url.searchParams.get('bar'), 'baz');

  if (DESCRIPTORS) {
    url = new URL('http://zloirock.ru/');
    url.searchParams.append('foo', 'bar');
    assert.same(String(url), 'http://zloirock.ru/?foo=bar');

    url = new URL('http://zloirock.ru/');
    url.search = 'foo=bar';
    assert.same(url.searchParams.get('foo'), 'bar');

    url = new URL('http://zloirock.ru/?foo=bar&bar=baz');
    url.search = '';
    assert.false(url.searchParams.has('foo'));
  }
});

QUnit.test('URL#hash', assert => {
  let url = new URL('http://zloirock.ru/');

  if (DESCRIPTORS) {
    assert.false(hasOwnProperty.call(url, 'hash'));
    const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'hash');
    assert.true(descriptor.enumerable);
    assert.true(descriptor.configurable);
    assert.same(typeof descriptor.get, 'function');
    assert.same(typeof descriptor.set, 'function');
  }

  assert.same(url.hash, '');

  url = new URL('http://zloirock.ru/#foo');
  assert.same(url.hash, '#foo');

  url = new URL('http://zloirock.ru/#');
  assert.same(url.hash, '');
  assert.same(String(url), 'http://zloirock.ru/#');

  if (DESCRIPTORS) {
    url = new URL('http://zloirock.ru/#');
    url.hash = 'foo';
    assert.same(url.hash, '#foo');
    assert.same(String(url), 'http://zloirock.ru/#foo');
    url.hash = '';
    assert.same(url.hash, '');
    assert.same(String(url), 'http://zloirock.ru/');
    // url.hash = '#';
    // assert.same(url.hash, '');
    // assert.same(String(url), 'http://zloirock.ru/'); // 'http://zloirock.ru/#' in FF
    url.hash = '#foo';
    assert.same(url.hash, '#foo');
    assert.same(String(url), 'http://zloirock.ru/#foo');
    url.hash = '#foo#bar';
    assert.same(url.hash, '#foo#bar');
    assert.same(String(url), 'http://zloirock.ru/#foo#bar');

    url = new URL('http://zloirock.ru/');
    url.hash = 'абa';
    assert.same(url.hash, '#%D0%B0%D0%B1a');

    // url = new URL('http://zloirock.ru/');
    // url.hash = '\udc01\ud802a';
    // assert.same(url.hash, '#%EF%BF%BD%EF%BF%BDa', 'unmatched surrogates');
  }
});

QUnit.test('URL#toJSON', assert => {
  const { toJSON } = URL.prototype;
  assert.isFunction(toJSON);
  assert.arity(toJSON, 0);
  assert.enumerable(URL.prototype, 'toJSON');

  const url = new URL('http://zloirock.ru/');
  assert.same(url.toJSON(), 'http://zloirock.ru/');

  if (DESCRIPTORS) {
    url.searchParams.append('foo', 'bar');
    assert.same(url.toJSON(), 'http://zloirock.ru/?foo=bar');
  }
});

QUnit.test('URL#toString', assert => {
  const { toString } = URL.prototype;
  assert.isFunction(toString);
  assert.arity(toString, 0);
  assert.enumerable(URL.prototype, 'toString');

  const url = new URL('http://zloirock.ru/');
  assert.same(url.toString(), 'http://zloirock.ru/');

  if (DESCRIPTORS) {
    url.searchParams.append('foo', 'bar');
    assert.same(url.toString(), 'http://zloirock.ru/?foo=bar');
  }
});

QUnit.test('URL.sham', assert => {
  assert.same(URL.sham, DESCRIPTORS ? undefined : true);
});

// `core-js` URL implementation pass all (exclude some encoding-related) tests
// from the next 3 test cases, but URLs from all of popular browsers fail a serious part of tests.
// Replacing all of them does not looks like a good idea, so next test cases disabled by default.

// see https://github.com/web-platform-tests/wpt/blob/master/url
QUnit.skip('WPT URL constructor tests', assert => {
  for (const expected of urlTestData) {
    if (typeof expected == 'string') continue;
    const name = `Parsing: <${ expected.input }> against <${ expected.base }>`;
    if (expected.failure) {
      assert.throws(() => new URL(expected.input, expected.base || 'about:blank'), name);
    } else {
      const url = new URL(expected.input, expected.base || 'about:blank');
      assert.same(url.href, expected.href, `${ name }: href`);
      assert.same(url.protocol, expected.protocol, `${ name }: protocol`);
      assert.same(url.username, expected.username, `${ name }: username`);
      assert.same(url.password, expected.password, `${ name }: password`);
      assert.same(url.host, expected.host, `${ name }: host`);
      assert.same(url.hostname, expected.hostname, `${ name }: hostname`);
      assert.same(url.port, expected.port, `${ name }: port`);
      assert.same(url.pathname, expected.pathname, `${ name }: pathname`);
      assert.same(url.search, expected.search, `${ name }: search`);
      if ('searchParams' in expected) {
        assert.same(url.searchParams.toString(), expected.searchParams, `${ name }: searchParams`);
      }
      assert.same(url.hash, expected.hash, `${ name }: hash`);
      if ('origin' in expected) {
        assert.same(url.origin, expected.origin, `${ name }: origin`);
      }
    }
  }
});

// see https://github.com/web-platform-tests/wpt/blob/master/url
if (DESCRIPTORS) QUnit.skip('WPT URL setters tests', assert => {
  for (const setter in settersTestData) {
    const testCases = settersTestData[setter];
    for (const { href, newValue, comment, expected } of testCases) {
      let name = `Setting <${ href }>.${ setter } = '${ newValue }'.`;
      if (comment) name += ` ${ comment }`;

      const url = new URL(href);
      url[setter] = newValue;
      for (const attribute in expected) {
        assert.same(url[attribute], expected[attribute], name);
      }
    }
  }
});

// see https://github.com/web-platform-tests/wpt/blob/master/url
QUnit.skip('WPT conversion to ASCII tests', assert => {
  for (const { comment, input, output } of toASCIITestData) {
    let name = `Parsing: <${ input }>`;
    if (comment) name += ` ${ comment }`;
    if (output === null) {
      assert.throws(() => new URL(`https://${ input }/x`), name);
    } else {
      const url = new URL(`https://${ input }/x`);
      assert.same(url.host, output, name);
      assert.same(url.hostname, output, name);
      assert.same(url.pathname, '/x', name);
      assert.same(url.href, `https://${ output }/x`, name);
    }
  }
});
