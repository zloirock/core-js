import urlTestData from '../wpt-url-resources/urltestdata';
import settersTestData from '../wpt-url-resources/setters';
import toASCIITestData from '../wpt-url-resources/toascii';

const { hasOwnProperty } = Object.prototype;

QUnit.test('URL constructor', assert => {
  assert.isFunction(URL);
  assert.arity(URL, 1);
  assert.name(URL, 'URL');
  assert.looksNative(URL);

  assert.same(String(new URL('http://www.domain.com/a/b')), 'http://www.domain.com/a/b');
  assert.same(String(new URL('/c/d', 'http://www.domain.com/a/b')), 'http://www.domain.com/c/d');
  assert.same(String(new URL('b/c', 'http://www.domain.com/a/b')), 'http://www.domain.com/a/b/c');
  assert.same(String(new URL('b/c', new URL('http://www.domain.com/a/b'))), 'http://www.domain.com/a/b/c');
  assert.same(String(new URL({ toString: () => 'https://example.org/' })), 'https://example.org/');

  assert.same(String(new URL('nonspecial://example.com/')), 'nonspecial://example.com/');

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
  assert.same(String(new URL('http://0300.168.0xG0')), 'http://0300.168.0xg0/', 'incorrect IPv4 parsed as host');

  assert.same(String(new URL('file:///var/log/system.log')), 'file:///var/log/system.log', 'file scheme');
  // assert.same(String(new URL('file://nnsc.nsf.net/bar/baz')), 'file://nnsc.nsf.net/bar/baz', 'file scheme'); // 'file:///bar/baz' in FF
  // assert.same(String(new URL('file://localhost/bar/baz')), 'file:///bar/baz', 'file scheme'); // 'file://localhost/bar/baz' in Chrome

  assert.throws(() => new URL(), 'TypeError: Failed to construct \'URL\': 1 argument required, but only 0 present.');
  assert.throws(() => new URL(''), 'TypeError: Failed to construct \'URL\': Invalid URL');
  assert.throws(() => new URL('', 'about:blank'), 'TypeError: Failed to construct \'URL\': Invalid URL');
  assert.throws(() => new URL('abc'), 'TypeError: Failed to construct \'URL\': Invalid URL');
  assert.throws(() => new URL('//abc'), 'TypeError: Failed to construct \'URL\': Invalid URL');
  assert.throws(() => new URL('http:///www.domain.com/', 'abc'), 'TypeError: Failed to construct \'URL\': Invalid base URL');
  assert.throws(() => new URL('http:///www.domain.com/', null), 'TypeError: Failed to construct \'URL\': Invalid base URL');
  assert.throws(() => new URL('//abc', null), 'TypeError: Failed to construct \'URL\': Invalid base URL');
  assert.throws(() => new URL('http://[20:0:0:1:0:0:0:ff'), 'incorrect IPv6');
  assert.throws(() => new URL('http://[20:0:0:1:0:0:0:fg]'), 'incorrect IPv6');
  // assert.throws(() => new URL('http://a%b'), 'forbidden host code point'); // no error in FF
  assert.throws(() => new URL('1http://zloirock.ru'), 'incorrect scheme');
});

QUnit.test('URL#href', assert => {
  let url = new URL('http://zloirock.ru/');

  assert.ok(!hasOwnProperty.call(url, 'href'));
  const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'href');
  assert.same(descriptor.enumerable, true);
  assert.same(descriptor.configurable, true);
  assert.same(typeof descriptor.get, 'function');
  assert.same(typeof descriptor.set, 'function');

  assert.same(url.href, 'http://zloirock.ru/');

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
  assert.same(url.href, 'http://192.168.0.240/', 'file -> http');
  assert.same(String(url), 'http://192.168.0.240/', 'file -> http');

  // assert.throws(() => new URL('http://zloirock.ru/').href = undefined, 'incorrect URL'); // no error in Chrome
  // assert.throws(() => new URL('http://zloirock.ru/').href = '', 'incorrect URL'); // no error in Chrome
  // assert.throws(() => new URL('http://zloirock.ru/').href = 'abc', 'incorrect URL'); // no error in Chrome
  // assert.throws(() => new URL('http://zloirock.ru/').href = '//abc', 'incorrect URL'); // no error in Chrome
  // assert.throws(() => new URL('http://zloirock.ru/').href = 'http://[20:0:0:1:0:0:0:ff', 'incorrect IPv6'); // no error in Chrome
  // assert.throws(() => new URL('http://zloirock.ru/').href = 'http://[20:0:0:1:0:0:0:fg]', 'incorrect IPv6'); // no error in Chrome
  // assert.throws(() => new URL('http://zloirock.ru/').href = 'http://a%b', 'forbidden host code point'); // no error in Chrome and FF
  // assert.throws(() => new URL('http://zloirock.ru/').href = '1http://zloirock.ru', 'incorrect scheme'); // no error in Chrome
});

QUnit.test('URL#origin', assert => {
  const url = new URL('http://es6.zloirock.ru/tests.html');

  assert.ok(!hasOwnProperty.call(url, 'origin'));
  const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'origin');
  assert.same(descriptor.enumerable, true);
  assert.same(descriptor.configurable, true);
  assert.same(typeof descriptor.get, 'function');

  assert.same(url.origin, 'http://es6.zloirock.ru');

  assert.same(new URL('https://測試/tests').origin, 'https://xn--g6w251d');
});

QUnit.test('URL#protocol', assert => {
  let url = new URL('http://zloirock.ru/');

  assert.ok(!hasOwnProperty.call(url, 'protocol'));
  const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'protocol');
  assert.same(descriptor.enumerable, true);
  assert.same(descriptor.configurable, true);
  assert.same(typeof descriptor.get, 'function');
  assert.same(typeof descriptor.set, 'function');

  assert.same(url.protocol, 'http:');

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
});

QUnit.test('URL#username', assert => {
  let url = new URL('http://zloirock.ru/');

  assert.ok(!hasOwnProperty.call(url, 'username'));
  const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'username');
  assert.same(descriptor.enumerable, true);
  assert.same(descriptor.configurable, true);
  assert.same(typeof descriptor.get, 'function');
  assert.same(typeof descriptor.set, 'function');

  assert.same(url.username, '');

  url = new URL('http://username@zloirock.ru/');
  assert.same(url.username, 'username');

  url = new URL('http://zloirock.ru/');
  url.username = 'username';
  assert.same(url.username, 'username');
  assert.same(String(url), 'http://username@zloirock.ru/');
});

QUnit.test('URL#password', assert => {
  let url = new URL('http://zloirock.ru/');

  assert.ok(!hasOwnProperty.call(url, 'password'));
  const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'password');
  assert.same(descriptor.enumerable, true);
  assert.same(descriptor.configurable, true);
  assert.same(typeof descriptor.get, 'function');
  assert.same(typeof descriptor.set, 'function');

  assert.same(url.password, '');

  url = new URL('http://username:password@zloirock.ru/');
  assert.same(url.password, 'password');

  // url = new URL('http://:password@zloirock.ru/'); // TypeError in FF
  // assert.same(url.password, 'password');

  url = new URL('http://zloirock.ru/');
  url.username = 'username';
  url.password = 'password';
  assert.same(url.password, 'password');
  assert.same(String(url), 'http://username:password@zloirock.ru/');

  // url = new URL('http://zloirock.ru/');
  // url.password = 'password';
  // assert.same(url.password, 'password'); // '' in FF
  // assert.same(String(url), 'http://:password@zloirock.ru/'); // 'http://zloirock.ru/' in FF
});

QUnit.test('URL#host', assert => {
  let url = new URL('http://zloirock.ru:81/path');

  assert.ok(!hasOwnProperty.call(url, 'host'));
  const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'host');
  assert.same(descriptor.enumerable, true);
  assert.same(descriptor.configurable, true);
  assert.same(typeof descriptor.get, 'function');
  assert.same(typeof descriptor.set, 'function');

  assert.same(url.host, 'zloirock.ru:81');

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
});

QUnit.test('URL#hostname', assert => {
  let url = new URL('http://zloirock.ru:81/');

  assert.ok(!hasOwnProperty.call(url, 'hostname'));
  const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'hostname');
  assert.same(descriptor.enumerable, true);
  assert.same(descriptor.configurable, true);
  assert.same(typeof descriptor.get, 'function');
  assert.same(typeof descriptor.set, 'function');

  assert.same(url.hostname, 'zloirock.ru');

  url = new URL('http://zloirock.ru:81/');
  url.hostname = 'example.com';
  assert.same(url.hostname, 'example.com');
  assert.same(String(url), 'http://example.com:81/');

  // url = new URL('http://zloirock.ru:81/');
  // url.hostname = 'example.com:82';
  // assert.same(url.hostname, 'example.com'); // '' in Chrome
  // assert.same(String(url), 'http://example.com:81/'); // 'ttp://example.com:82:81/' in Chrome

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
});

QUnit.test('URL#port', assert => {
  let url = new URL('http://zloirock.ru:1337/');

  assert.ok(!hasOwnProperty.call(url, 'port'));
  const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'port');
  assert.same(descriptor.enumerable, true);
  assert.same(descriptor.configurable, true);
  assert.same(typeof descriptor.get, 'function');
  assert.same(typeof descriptor.set, 'function');

  assert.same(url.port, '1337');

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
});

QUnit.test('URL#pathname', assert => {
  let url = new URL('http://zloirock.ru/foo/bar');

  assert.ok(!hasOwnProperty.call(url, 'pathname'));
  const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'pathname');
  assert.same(descriptor.enumerable, true);
  assert.same(descriptor.configurable, true);
  assert.same(typeof descriptor.get, 'function');
  assert.same(typeof descriptor.set, 'function');

  assert.same(url.pathname, '/foo/bar');

  url = new URL('http://zloirock.ru/');
  url.pathname = 'bar/baz';
  assert.same(url.pathname, '/bar/baz');
  assert.same(String(url), 'http://zloirock.ru/bar/baz');
});

QUnit.test('URL#search', assert => {
  let url = new URL('http://zloirock.ru/');

  assert.ok(!hasOwnProperty.call(url, 'search'));
  const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'search');
  assert.same(descriptor.enumerable, true);
  assert.same(descriptor.configurable, true);
  assert.same(typeof descriptor.get, 'function');
  assert.same(typeof descriptor.set, 'function');

  assert.same(url.search, '');

  url = new URL('http://zloirock.ru/?foo=bar');
  assert.same(url.search, '?foo=bar');

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
});

QUnit.test('URL#searchParams', assert => {
  let url = new URL('http://zloirock.ru/?foo=bar&bar=baz');

  assert.ok(!hasOwnProperty.call(url, 'searchParams'));
  const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'searchParams');
  assert.same(descriptor.enumerable, true);
  assert.same(descriptor.configurable, true);
  assert.same(typeof descriptor.get, 'function');

  assert.ok(url.searchParams instanceof URLSearchParams);
  assert.same(url.searchParams.get('foo'), 'bar');
  assert.same(url.searchParams.get('bar'), 'baz');

  url = new URL('http://zloirock.ru/');
  url.searchParams.append('foo', 'bar');
  assert.same(String(url), 'http://zloirock.ru/?foo=bar');

  url = new URL('http://zloirock.ru/');
  url.search = 'foo=bar';
  assert.same(url.searchParams.get('foo'), 'bar');

  url = new URL('http://zloirock.ru/?foo=bar&bar=baz');
  url.search = '';
  assert.same(url.searchParams.has('foo'), false);
});

QUnit.test('URL#hash', assert => {
  let url = new URL('http://zloirock.ru/');

  assert.ok(!hasOwnProperty.call(url, 'hash'));
  const descriptor = Object.getOwnPropertyDescriptor(URL.prototype, 'hash');
  assert.same(descriptor.enumerable, true);
  assert.same(descriptor.configurable, true);
  assert.same(typeof descriptor.get, 'function');
  assert.same(typeof descriptor.set, 'function');

  assert.same(url.hash, '');

  url = new URL('http://zloirock.ru/#foo');
  assert.same(url.hash, '#foo');

  url = new URL('http://zloirock.ru/#');
  assert.same(url.hash, '');
  assert.same(String(url), 'http://zloirock.ru/#');

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
});

QUnit.test('URL#toJSON', assert => {
  const { toJSON } = URL.prototype;
  assert.isFunction(toJSON);
  assert.arity(toJSON, 0);
  assert.name(toJSON, 'toJSON');
  assert.enumerable(URL.prototype, 'toJSON');
  assert.looksNative(toJSON);

  const url = new URL('http://zloirock.ru/');
  assert.same(url.toJSON(), 'http://zloirock.ru/');

  url.searchParams.append('foo', 'bar');
  assert.same(url.toJSON(), 'http://zloirock.ru/?foo=bar');
});

QUnit.test('URL#toString', assert => {
  const { toString } = URL.prototype;
  assert.isFunction(toString);
  assert.arity(toString, 0);
  assert.name(toString, 'toString');
  assert.enumerable(URL.prototype, 'toString');
  assert.looksNative(toString);

  const url = new URL('http://zloirock.ru/');
  assert.same(url.toString(), 'http://zloirock.ru/');

  url.searchParams.append('foo', 'bar');
  assert.same(url.toString(), 'http://zloirock.ru/?foo=bar');
});

QUnit.test('URL#@@toStringTag', assert => {
  const url = new URL('http://zloirock.ru/');
  assert.same(({}).toString.call(url), '[object URL]');
});

// `core-js` URL implementation pass all (exclude some encoding-ralated) tests
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
QUnit.skip('WPT URL setters tests', assert => {
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
