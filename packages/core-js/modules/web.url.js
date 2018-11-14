'use strict';
/* eslint-disable no-labels */
var DESCRIPTORS = require('../internals/descriptors');
var USE_NATIVE_URL = require('../internals/native-url');
var NativeURL = require('../internals/global').URL;
var defineProperties = require('../internals/object-define-properties');
var redefine = require('../internals/redefine');
var anInstance = require('../internals/an-instance');
var create = require('../internals/object-create');
var has = require('../internals/has');
var URLSearchParamsModule = require('../modules/web.url-search-params');
var URLSearchParams = URLSearchParamsModule.URLSearchParams;
var getInternalSearchParamsState = URLSearchParamsModule.getState;
var InternalStateModule = require('../internals/internal-state');
var setInternalState = InternalStateModule.set;
var getInternalURLState = InternalStateModule.getterFor('URL');

var relative = create(null);
relative.ftp = 21;
relative.file = 0;
relative.gopher = 70;
relative.http = 80;
relative.https = 443;
relative.ws = 80;
relative.wss = 443;

var relativePathDotMapping = create(null);
relativePathDotMapping['%2e'] = '.';
relativePathDotMapping['.%2e'] = '..';
relativePathDotMapping['%2e.'] = '..';
relativePathDotMapping['%2e%2e'] = '..';

var isRelativeScheme = function (scheme) {
  return has(relative, scheme);
};

var invalid = function (state) {
  clear(state);
  state.isInvalid = true;
};

var IDNAToASCII = function (state, h) {
  if ('' == h) invalid(state);
  return h.toLowerCase();
};

var percentEscape = function (char) {
  var code = char.charCodeAt(0);
  return code > 0x20 && code < 0x7F &&
    // " # < > ? `
    0x22 != code && 0x23 != code && 0x3C != code && 0x3E != code && 0x3F != code && 0x60 != code
      ? char : encodeURIComponent(char);
};

var percentEscapeQuery = function (char) {
  var code = char.charCodeAt(0);
  return code > 0x20 && code < 0x7F &&
    // " # < > ` (do not escape '?')
    0x22 != code && 0x23 != code && 0x3C != code && 0x3E != code && 0x60 != code
      ? char : encodeURIComponent(char);
};

var ALPHA = /[a-zA-Z]/;
var ALPHANUMERIC = /[a-zA-Z0-9+\-.]/;
var DIGIT = /[0-9]/;
var TRIM = /^[ \t\r\n\f]+|[ \t\r\n\f]+$/g;
var EOF = '';

// States:
var SCHEME_START = {};
var SCHEME = {};
var SCHEME_DATA = {};
var NO_SCHEME = {};
var RELATIVE_OR_AUTHORITY = {};
var RELATIVE = {};
var RELATIVE_SLASH = {};
var AUTHORITY_FIRST_SLASH = {};
var AUTHORITY_SECOND_SLASH = {};
var AUTHORITY_IGNORE_SLASHES = {};
var AUTHORITY = {};
var FILE_HOST = {};
var HOST = {};
var HOSTNAME = {};
var PORT = {};
var RELATIVE_PATH_START = {};
var RELATIVE_PATH = {};
var QUERY = {};
var FRAGMENT = {};

// URL parser based on https://github.com/webcomponents/URL
// eslint-disable-next-line max-statements
var parse = function (urlState, input, stateOverride, baseState) {
  var err = function (message) {
    errors.push(message);
  };

  var state = stateOverride || SCHEME_START;
  var cursor = 0;
  var buffer = '';
  var seenAt = false;
  var seenBracket = false;
  var errors = [];

  loop: while ((input.charAt(cursor - 1) != EOF || cursor == 0) && !urlState.isInvalid) {
    var char = input.charAt(cursor);
    switch (state) {
      case SCHEME_START:
        if (char && ALPHA.test(char)) {
          buffer += char.toLowerCase(); // ASCII-safe
          state = SCHEME;
        } else if (!stateOverride) {
          buffer = '';
          state = NO_SCHEME;
          continue;
        } else {
          err('Invalid scheme.');
          break loop;
        } break;

      case SCHEME:
        if (char && ALPHANUMERIC.test(char)) {
          buffer += char.toLowerCase(); // ASCII-safe
        } else if (':' == char) {
          urlState.scheme = buffer;
          buffer = '';
          if (stateOverride) break loop;
          if (isRelativeScheme(urlState.scheme)) urlState.isRelative = true;
          if ('file' == urlState.scheme) {
            state = RELATIVE;
          } else if (urlState.isRelative && baseState && baseState.scheme == urlState.scheme) {
            state = RELATIVE_OR_AUTHORITY;
          } else if (urlState.isRelative) {
            state = AUTHORITY_FIRST_SLASH;
          } else state = SCHEME_DATA;
        } else if (!stateOverride) {
          buffer = '';
          cursor = 0;
          state = NO_SCHEME;
          continue;
        } else if (EOF == char) {
          break loop;
        } else {
          err('Code point not allowed in scheme: ' + char);
          break loop;
        } break;

      case SCHEME_DATA:
        if ('?' == char) {
          urlState.query = '?';
          state = QUERY;
        } else if ('#' == char) {
          urlState.fragment = '#';
          state = FRAGMENT;
        // XXX error handling
        } else if (EOF != char && '\t' != char && '\n' != char && '\r' != char) {
          urlState.schemeData += percentEscape(char);
        } break;

      case NO_SCHEME:
        if (!baseState || !(isRelativeScheme(baseState.scheme))) {
          err('Missing scheme.');
          invalid(urlState);
        } else {
          state = RELATIVE;
          continue;
        } break;

      case RELATIVE_OR_AUTHORITY:
        if ('/' == char && '/' == input.charAt(cursor + 1)) {
          state = AUTHORITY_IGNORE_SLASHES;
        } else {
          err('Expected /, got: ' + char);
          state = RELATIVE;
          continue;
        } break;

      case RELATIVE:
        urlState.isRelative = true;
        if (!baseState) baseState = getInternalURLState(new URLConstructor());
        if ('file' != urlState.scheme) urlState.scheme = baseState.scheme;
        if (EOF == char) {
          urlState.host = baseState.host;
          urlState.port = baseState.port;
          urlState.path = baseState.path.slice();
          urlState.query = baseState.query;
          urlState.username = baseState.username;
          urlState.password = baseState.password;
          break loop;
        } else if ('/' == char || '\\' == char) {
          if ('\\' == char) err('\\ is an invalid code point.');
          state = RELATIVE_SLASH;
        } else if ('?' == char) {
          urlState.host = baseState.host;
          urlState.port = baseState.port;
          urlState.path = baseState.path.slice();
          urlState.query = '?';
          urlState.username = baseState.username;
          urlState.password = baseState.password;
          state = QUERY;
        } else if ('#' == char) {
          urlState.host = baseState.host;
          urlState.port = baseState.port;
          urlState.path = baseState.path.slice();
          urlState.query = baseState.query;
          urlState.fragment = '#';
          urlState.username = baseState.username;
          urlState.password = baseState.password;
          state = FRAGMENT;
        } else {
          var nextC = input.charAt(cursor + 1);
          var nextNextC = input.charAt(cursor + 2);
          if (
            'file' != urlState.scheme || !ALPHA.test(char) ||
            (nextC != ':' && nextC != '|') ||
            (EOF != nextNextC && '/' != nextNextC && '\\' != nextNextC && '?' != nextNextC && '#' != nextNextC)
          ) {
            urlState.host = baseState.host;
            urlState.port = baseState.port;
            urlState.username = baseState.username;
            urlState.password = baseState.password;
            urlState.path = baseState.path.slice();
            urlState.path.pop();
          }
          state = RELATIVE_PATH;
          continue;
        } break;

      case RELATIVE_SLASH:
        if ('/' == char || '\\' == char) {
          if ('\\' == char) err('\\ is an invalid code point.');
          if ('file' == urlState.scheme) state = FILE_HOST;
          else state = AUTHORITY_IGNORE_SLASHES;
        } else {
          if ('file' != urlState.scheme) {
            urlState.host = baseState.host;
            urlState.port = baseState.port;
            urlState.username = baseState.username;
            urlState.password = baseState.password;
          }
          state = RELATIVE_PATH;
          continue;
        } break;

      case AUTHORITY_FIRST_SLASH:
        if ('/' == char) {
          state = AUTHORITY_SECOND_SLASH;
        } else {
          err("Expected '/', got: " + char);
          state = AUTHORITY_IGNORE_SLASHES;
          continue;
        } break;

      case AUTHORITY_SECOND_SLASH:
        state = AUTHORITY_IGNORE_SLASHES;
        if ('/' != char) {
          err("Expected '/', got: " + char);
          continue;
        } break;

      case AUTHORITY_IGNORE_SLASHES:
        if ('/' != char && '\\' != char) {
          state = AUTHORITY;
          continue;
        } else err('Expected authority, got: ' + char);
        break;

      case AUTHORITY:
        if ('@' == char) {
          if (seenAt) {
            err('@ already seen.');
            buffer += '%40';
          }
          seenAt = true;
          for (var i = 0; i < buffer.length; i++) {
            var cp = buffer.charAt(i);
            if ('\t' == cp || '\n' == cp || '\r' == cp) {
              err('Invalid whitespace in authority.');
              continue;
            }
            // XXX check URL code points
            if (':' == cp && null === urlState.password) {
              urlState.password = '';
              continue;
            }
            var tempC = percentEscape(cp);
            if (null !== urlState.password) urlState.password += tempC;
            else urlState.username += tempC;
          }
          buffer = '';
        } else if (EOF == char || '/' == char || '\\' == char || '?' == char || '#' == char) {
          cursor -= buffer.length;
          buffer = '';
          state = HOST;
          continue;
        } else buffer += char;
        break;

      case FILE_HOST:
        if (EOF == char || '/' == char || '\\' == char || '?' == char || '#' == char) {
          if (
            buffer.length == 2 && ALPHA.test(buffer.charAt(0)) &&
            (buffer.charAt(1) == ':' || buffer.charAt(1) == '|')
          ) {
            state = RELATIVE_PATH;
          } else if (buffer.length == 0) {
            state = RELATIVE_PATH_START;
          } else {
            urlState.host = IDNAToASCII(urlState, buffer);
            buffer = '';
            state = RELATIVE_PATH_START;
          }
          continue;
        } else if ('\t' == char || '\n' == char || '\r' == char) {
          err('Invalid whitespace in file host.');
        } else {
          buffer += char;
        } break;

      case HOST:
      case HOSTNAME:
        if (':' == char && !seenBracket) {
          // XXX host parsing
          urlState.host = IDNAToASCII(urlState, buffer);
          buffer = '';
          state = PORT;
          if (HOSTNAME == stateOverride) break loop;
        } else if (EOF == char || '/' == char || '\\' == char || '?' == char || '#' == char) {
          urlState.host = IDNAToASCII(urlState, buffer);
          buffer = '';
          state = RELATIVE_PATH_START;
          if (stateOverride) break loop;
          continue;
        } else if ('\t' != char && '\n' != char && '\r' != char) {
          if ('[' == char) seenBracket = true;
          else if (']' == char) seenBracket = false;
          buffer += char;
        } else err('Invalid code point in host/hostname: ' + char);
        break;

      case PORT:
        if (DIGIT.test(char)) {
          buffer += char;
        } else if (EOF == char || '/' == char || '\\' == char || '?' == char || '#' == char || stateOverride) {
          if ('' != buffer) {
            var temp = parseInt(buffer, 10);
            if (temp > 65535) {
              err('Invalid port: ' + temp);
            } else if (temp != relative[urlState.scheme]) {
              urlState.port = temp + '';
            }
            buffer = '';
          }
          if (stateOverride) break loop;
          state = RELATIVE_PATH_START;
          continue;
        } else if ('\t' == char || '\n' == char || '\r' == char) {
          err('Invalid code point in port: ' + char);
        } else {
          invalid(urlState);
        } break;

      case RELATIVE_PATH_START:
        if ('\\' == char) err("'\\' not allowed in path.");
        state = RELATIVE_PATH;
        if ('/' != char && '\\' != char) continue;
        break;

      case RELATIVE_PATH:
        if (EOF == char || '/' == char || '\\' == char || (!stateOverride && ('?' == char || '#' == char))) {
          if ('\\' == char) err('\\ not allowed in relative path.');
          var tmp = relativePathDotMapping[buffer.toLowerCase()];
          if (tmp) buffer = tmp;
          if ('..' == buffer) {
            urlState.path.pop();
            if ('/' != char && '\\' != char) {
              urlState.path.push('');
            }
          } else if ('.' == buffer && '/' != char && '\\' != char) {
            urlState.path.push('');
          } else if ('.' != buffer) {
            if (
              'file' == urlState.scheme && urlState.path.length == 0 &&
              buffer.length == 2 && ALPHA.test(buffer.charAt(0)) && buffer.charAt(1) == '|'
            ) buffer = buffer[0] + ':';
            urlState.path.push(buffer);
          }
          buffer = '';
          if ('?' == char) {
            urlState.query = '?';
            state = QUERY;
          } else if ('#' == char) {
            urlState.fragment = '#';
            state = FRAGMENT;
          }
        } else if ('\t' != char && '\n' != char && '\r' != char) {
          buffer += percentEscape(char);
        } break;

      case QUERY:
        if (!stateOverride && '#' == char) {
          urlState.fragment = '#';
          state = FRAGMENT;
        } else if (EOF != char && '\t' != char && '\n' != char && '\r' != char) {
          urlState.query += percentEscapeQuery(char);
        } break;

      case FRAGMENT:
        if (EOF != char && '\t' != char && '\n' != char && '\r' != char) urlState.fragment += char;
        break;
    }

    cursor++;
  }
};

var clear = function (state) {
  state.scheme = '';
  state.schemeData = '';
  state.username = '';
  state.password = null;
  state.host = '';
  state.port = '';
  state.path = [];
  state.query = '';
  state.fragment = '';
  state.isInvalid = false;
  state.isRelative = false;
};

// `URL` constructor
// https://url.spec.whatwg.org/#url-class
// Does not process domain names or IP addresses.
// Does not handle encoding for the query parameter.
var URLConstructor = function URL(url /* , base */) {
  var that = anInstance(this, URLConstructor, 'URL');
  var base = arguments.length > 1 ? arguments[1] : undefined;
  var urlString = String(url);
  var state = setInternalState(that, { type: 'URL' });
  if (base !== undefined && !(base instanceof URLConstructor)) base = new URLConstructor(String(base));
  state.url = urlString;
  clear(state);
  parse(state, urlString.replace(TRIM, ''), null, base && getInternalURLState(base));
  var searchParams = state.searchParams = new URLSearchParams(state.query);
  getInternalSearchParamsState(searchParams).updateURL = function () {
    var query = String(searchParams);
    state.query = query === '' ? '' : '?' + query;
  };
  if (!DESCRIPTORS) {
    that.href = getHref.call(that);
    that.origin = getOrigin.call(that);
    that.protocol = getProtocol.call(that);
    that.username = getUsername.call(that);
    that.password = getPassword.call(that);
    that.host = getHost.call(that);
    that.hostname = getHostname.call(that);
    that.port = getPort.call(that);
    that.pathname = getPathname.call(that);
    that.search = getSearch.call(that);
    that.searchParams = getSearchParams.call(that);
    that.hash = getHash.call(that);
  }
};

var URLPrototype = URLConstructor.prototype;

var getHref = function () {
  var that = this;
  var state = getInternalURLState(that);
  var authority = '';
  if (state.isInvalid) return state.url;
  if ('' !== state.username || null !== state.password) {
    authority = state.username + (null !== state.password ? ':' + state.password : '') + '@';
  }
  return state.scheme + ':' + (state.isRelative ? '//' + authority + getHost.call(that) : '') +
    getPathname.call(that) + state.query + state.fragment;
};

var getOrigin = function () {
  var state = getInternalURLState(this);
  if (state.isInvalid || !state.scheme) return '';
  switch (state.scheme) {
    case 'data':
    case 'file':
    case 'javascript':
    case 'mailto':
      return 'null';
  }
  var host = getHost.call(this);
  if (!host) return '';
  return state.scheme + '://' + host;
};

var getProtocol = function () {
  return getInternalURLState(this).scheme + ':';
};

var getUsername = function () {
  return getInternalURLState(this).username;
};

var getPassword = function () {
  return getInternalURLState(this).password || '';
};

var getHost = function () {
  var state = getInternalURLState(this);
  return state.isInvalid ? '' : state.port ? state.host + ':' + state.port : state.host;
};

var getHostname = function () {
  return getInternalURLState(this).host;
};

var getPort = function () {
  return getInternalURLState(this).port;
};

var getPathname = function () {
  var state = getInternalURLState(this);
  return state.isInvalid ? '' : state.isRelative ? '/' + state.path.join('/') : state.schemeData;
};

var getSearch = function () {
  var state = getInternalURLState(this);
  return state.isInvalid || state.query === '?' ? '' : state.query;
};

var getSearchParams = function () {
  return getInternalURLState(this).searchParams;
};

var getHash = function () {
  var state = getInternalURLState(this);
  return state.isInvalid || !state.fragment || '#' == state.fragment ? '' : state.fragment;
};

var cannotHaveUsernamePasswordPort = function (state) {
  return state.isInvalid || !state.isRelative;
};

var accessorDescriptor = function (getter, setter) {
  return { get: getter, set: setter, configurable: true, enumerable: true };
};

if (DESCRIPTORS) {
  defineProperties(URLPrototype, {
    // `URL.prototype.href` accessors pair
    // https://url.spec.whatwg.org/#dom-url-href
    href: accessorDescriptor(getHref, function (href) {
      var state = getInternalURLState(this);
      clear(state);
      parse(state, href + '');
      getInternalSearchParamsState(state.searchParams).updateSearchParams(state.query);
    }),
    // `URL.prototype.origin` getter
    // https://url.spec.whatwg.org/#dom-url-origin
    origin: accessorDescriptor(getOrigin),
    // `URL.prototype.protocol` accessors pair
    // https://url.spec.whatwg.org/#dom-url-protocol
    protocol: accessorDescriptor(getProtocol, function (protocol) {
      var state = getInternalURLState(this);
      if (state.isInvalid) return;
      parse(state, protocol + ':', SCHEME_START);
    }),
    // `URL.prototype.username` accessors pair
    // https://url.spec.whatwg.org/#dom-url-username
    username: accessorDescriptor(getUsername, function (username) {
      var state = getInternalURLState(this);
      if (cannotHaveUsernamePasswordPort(state)) return;
      var chars = String(username).split('');
      state.username = '';
      for (var i = 0; i < chars.length; i++) {
        state.username += percentEscape(chars[i]);
      }
    }),
    // `URL.prototype.password` accessors pair
    // https://url.spec.whatwg.org/#dom-url-password
    password: accessorDescriptor(getPassword, function (password) {
      var state = getInternalURLState(this);
      if (cannotHaveUsernamePasswordPort(state)) return;
      var chars = String(password).split('');
      state.password = '';
      for (var i = 0; i < chars.length; i++) {
        state.password += percentEscape(chars[i]);
      }
    }),
    // `URL.prototype.host` accessors pair
    // https://url.spec.whatwg.org/#dom-url-host
    host: accessorDescriptor(getHost, function (host) {
      var state = getInternalURLState(this);
      host += '';
      if (state.isInvalid || !state.isRelative) return;
      parse(state, host, HOST);
    }),
    // `URL.prototype.hostname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hostname
    hostname: accessorDescriptor(getHostname, function (hostname) {
      var state = getInternalURLState(this);
      if (state.isInvalid || !state.isRelative) return;
      parse(state, hostname + '', HOSTNAME);
    }),
    // `URL.prototype.port` accessors pair
    // https://url.spec.whatwg.org/#dom-url-port
    port: accessorDescriptor(getPort, function (port) {
      var state = getInternalURLState(this);
      if (cannotHaveUsernamePasswordPort(state)) return;
      parse(state, port + '', PORT);
    }),
    // `URL.prototype.pathname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-pathname
    pathname: accessorDescriptor(getPathname, function (pathname) {
      var state = getInternalURLState(this);
      if (state.isInvalid || !state.isRelative) return;
      state.path = [];
      parse(state, pathname + '', RELATIVE_PATH_START);
    }),
    // `URL.prototype.search` accessors pair
    // https://url.spec.whatwg.org/#dom-url-search
    search: accessorDescriptor(getSearch, function (search) {
      var state = getInternalURLState(this);
      search += '';
      if (state.isInvalid || !state.isRelative) return;
      if ('?' == search.charAt(0)) search = search.slice(1);
      if (search === '') {
        state.query = '';
      } else {
        state.query = '?';
        parse(state, search, QUERY);
      }
      getInternalSearchParamsState(state.searchParams).updateSearchParams(state.query);
    }),
    // `URL.prototype.searchParams` getter
    // https://url.spec.whatwg.org/#dom-url-searchparams
    searchParams: accessorDescriptor(getSearchParams),
    // `URL.prototype.hash` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hash
    hash: accessorDescriptor(getHash, function (hash) {
      var state = getInternalURLState(this);
      hash += '';
      if (state.isInvalid) return;
      if ('#' == hash.charAt(0)) hash = hash.slice(1);
      if (hash === '') {
        state.fragment = '';
        return;
      }
      state.fragment = '#';
      parse(state, hash, FRAGMENT);
    })
  });
}

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
redefine(URLPrototype, 'toJSON', function toJSON() {
  return getHref.call(this);
}, { enumerable: true });

// `URL.prototype.toString` method
// https://url.spec.whatwg.org/#URL-stringification-behavior
redefine(URLPrototype, 'toString', function toString() {
  return getHref.call(this);
}, { enumerable: true });

if (NativeURL) {
  var nativeCreateObjectURL = NativeURL.createObjectURL;
  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
  // `URL.createObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
  // eslint-disable-next-line no-unused-vars
  if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
    return nativeCreateObjectURL.apply(NativeURL, arguments);
  });
  // `URL.revokeObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
  // eslint-disable-next-line no-unused-vars
  if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
    return nativeRevokeObjectURL.apply(NativeURL, arguments);
  });
}

require('../internals/set-to-string-tag')(URLConstructor, 'URL');

require('../internals/export')({ global: true, forced: !USE_NATIVE_URL }, {
  URL: URLConstructor
});
