// Copyright © web-platform-tests contributors
// Originally from https://github.com/web-platform-tests/wpt
// Available under the 3-Clause BSD License https://github.com/web-platform-tests/wpt/blob/master/LICENSE.md
// Revision: 792c7512e35133a4481f267dbd6417fdedd0df2c
// Source: url/resources/urltestdata-javascript-only.json

export default [
  'See ../README.md for a description of the format.',
  {
    input: 'http://example.com/\uD800\uD801\uDFFE\uDFFF\uFDD0\uFDCF\uFDEF\uFDF0\uFFFE\uFFFF?\uD800\uD801\uDFFE\uDFFF\uFDD0\uFDCF\uFDEF\uFDF0\uFFFE\uFFFF',
    base: null,
    href: 'http://example.com/%EF%BF%BD%F0%90%9F%BE%EF%BF%BD%EF%B7%90%EF%B7%8F%EF%B7%AF%EF%B7%B0%EF%BF%BE%EF%BF%BF?%EF%BF%BD%F0%90%9F%BE%EF%BF%BD%EF%B7%90%EF%B7%8F%EF%B7%AF%EF%B7%B0%EF%BF%BE%EF%BF%BF',
    origin: 'http://example.com',
    protocol: 'http:',
    username: '',
    password: '',
    host: 'example.com',
    hostname: 'example.com',
    port: '',
    pathname: '/%EF%BF%BD%F0%90%9F%BE%EF%BF%BD%EF%B7%90%EF%B7%8F%EF%B7%AF%EF%B7%B0%EF%BF%BE%EF%BF%BF',
    search: '?%EF%BF%BD%F0%90%9F%BE%EF%BF%BD%EF%B7%90%EF%B7%8F%EF%B7%AF%EF%B7%B0%EF%BF%BE%EF%BF%BF',
    hash: '',
  },
];
