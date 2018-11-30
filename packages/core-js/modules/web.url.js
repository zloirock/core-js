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
var toASCII = require('../internals/punycode-to-ascii');
var URLSearchParamsModule = require('../modules/web.url-search-params');
var URLSearchParams = URLSearchParamsModule.URLSearchParams;
var getInternalSearchParamsState = URLSearchParamsModule.getState;
var InternalStateModule = require('../internals/internal-state');
var setInternalState = InternalStateModule.set;
var getInternalURLState = InternalStateModule.getterFor('URL');
var pow = Math.pow;

var INVALID_SCHEME = 'Invalid scheme';
var INVALID_HOST = 'Invalid host';
var INVALID_PORT = 'Invalid port';

var ALPHA = /[a-zA-Z]/;
var ALPHANUMERIC = /[a-zA-Z0-9+\-.]/;
var DIGIT = /[0-9]/;
var HEX_START = /^(0x|0X)/;
var OCT = /^[0-7]+$/;
var DEC = /^[0-9]+$/;
var HEX = /^[0-9A-Fa-f]+$/;
// eslint-disable-next-line no-control-regex
var FORBIDDEN_HOST_CODE_POINT = /\u0000|\u0009|\u000A|\u000D|\u0020|#|%|\/|:|\?|@|\[|\\|\]/;
// eslint-disable-next-line no-control-regex
var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u001F\u0020]+|[\u0000-\u001F\u0020]+$/g;
// eslint-disable-next-line no-control-regex
var TAB_AND_NEW_LINE = /\u0009|\u000A|\u000D/g;
var EOF = '';

var parseHost = function (state, buffer) {
  var result, j;
  if (buffer.charAt(0) == '[') {
    if (buffer.charAt(buffer.length - 1) != ']') return INVALID_HOST;
    result = parseIPv6(buffer.slice(1, -1));
    if (!result) return INVALID_HOST;
    state.host = result;
  // opaque host
  } else if (!state.isRelative) {
    if (~buffer.indexOf('%')) return INVALID_HOST;
    result = '';
    for (j = 0; j < buffer.length; j++) result += percentEncode(buffer.charAt(j), {});
    return result;
  } else {
    buffer = toASCII(buffer);
    if (FORBIDDEN_HOST_CODE_POINT.test(buffer)) return INVALID_HOST;
    state.host = parseIPv4(buffer);
  }
};

var parseIPv4 = function (buffer) {
  var parts = buffer.split('.');
  var partsLength, numbers, i, part, R, n, ipv4;
  if (parts[parts.length - 1] == '') {
    if (parts.length) parts.pop();
  }
  partsLength = parts.length;
  if (partsLength > 4) return buffer;
  numbers = [];
  for (i = 0; i < partsLength; i++) {
    part = parts[i];
    if (part == '') return buffer;
    R = 10;
    if (part.length > 1 && part.charAt(0) == '0') {
      R = HEX_START.test(part) ? 16 : 8;
      part = part.slice(R == 8 ? 1 : 2);
    }
    if (!(R == 10 ? DEC : R == 8 ? OCT : HEX).test(part)) return buffer;
    n = parseInt(part, R);
    // eslint-disable-next-line no-self-compare
    if (n != n) return buffer;
    if (i == partsLength - 1) {
      if (n >= pow(256, 5 - partsLength)) return buffer;
    } else if (n > 255) return buffer;
    numbers.push(n);
  }
  ipv4 = numbers.pop();
  for (i = 0; i < numbers.length; i++) {
    ipv4 += numbers[i] * pow(256, 3 - i);
  }
  return ipv4;
};

// eslint-disable-next-line max-statements
var parseIPv6 = function (buffer) {
  var address = [0, 0, 0, 0, 0, 0, 0, 0];
  var pieceIndex = 0;
  var compress = null;
  var pointer = 0;
  var char, value, length, numbersSeen, ipv4Piece, number, swaps, swap;
  if (buffer.charAt(0) == ':') {
    if (buffer.charAt(1) != ':') return;
    pointer += 2;
    pieceIndex++;
  }
  while ((char = buffer.charAt(pointer)) != EOF) {
    if (pieceIndex == 8) return;
    if (char == ':') {
      if (compress !== null) return;
      pointer++;
      pieceIndex++;
      compress = pieceIndex;
      continue;
    }
    value = length = 0;
    while (HEX.test(char = buffer.charAt(pointer)) && length < 4) {
      value = value * 16 + parseInt(char, 16);
      pointer++;
      length++;
    }
    if (char == '.') {
      if (length == 0) return;
      pointer -= length;
      if (pieceIndex > 6) return;
      numbersSeen = 0;
      while ((char = buffer.charAt(pointer)) != EOF) {
        ipv4Piece = null;
        if (numbersSeen > 0) {
          if (char == '.' && numbersSeen < 4) pointer++;
          else return;
        }
        if (!DIGIT.test(char)) return;
        do {
          number = parseInt(char, 10);
          if (ipv4Piece === null) ipv4Piece = number;
          else if (ipv4Piece == 0) return;
          ipv4Piece = ipv4Piece * 10 + number;
        } while (DIGIT.test(char = buffer.charAt(pointer)));
        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
        numbersSeen++;
        if (numbersSeen == 2 || numbersSeen == 4) pieceIndex++;
      }
      if (numbersSeen != 4) return;
      break;
    } else if (char == ':') {
      pointer++;
      if (buffer.charAt(pointer) == EOF) return;
    } else if (char != EOF) return;
    address[pieceIndex++] = value;
  }
  if (compress !== null) {
    swaps = pieceIndex - compress;
    pieceIndex = 7;
    while (pieceIndex != 0 && swaps > 0) {
      swap = address[pieceIndex];
      address[pieceIndex--] = address[compress + swaps - 1];
      address[compress + --swaps] = swap;
    }
  } else if (pieceIndex != 8) return;
  return address;
};

var findLongestZeroSequence = function (ipv6) {
  var maxIndex = null;
  var maxLength = 1;
  var currStart = null;
  var currLength = 0;
  var i = 0;
  for (; i < 8; i++) {
    if (ipv6[i] !== 0) {
      if (currLength > maxLength) {
        maxIndex = currStart;
        maxLength = currLength;
      }
      currStart = null;
      currLength = 0;
    } else {
      if (currStart === null) currStart = i;
      ++currLength;
    }
  }
  if (currLength > maxLength) {
    maxIndex = currStart;
    maxLength = currLength;
  }
  return maxIndex;
};

var serializeHost = function (host) {
  var result, i, compress, ignore0;
  // ipv4
  if (typeof host == 'number') {
    result = [];
    for (i = 0; i < 4; i++) {
      result.unshift(host % 256);
      host = Math.floor(host / 256);
    } return result.join('.');
  // ipv6
  } else if (typeof host == 'object') {
    result = [];
    compress = findLongestZeroSequence(host);
    for (i = 0; i < 8; i++) {
      if (ignore0 && host[i] === 0) continue;
      if (ignore0) ignore0 = false;
      if (compress === i) {
        result.push(i ? '' : ':');
        ignore0 = true;
      } else result.push(host[i].toString(16));
    }
    return '[' + result.join(':') + ']';
  } return host;
};

var relative = create(null);
relative.ftp = 21;
relative.file = 0;
relative.gopher = 70;
relative.http = 80;
relative.https = 443;
relative.ws = 80;
relative.wss = 443;

var isRelativeScheme = function (scheme) {
  return has(relative, scheme);
};

var relativePathDotMapping = create(null);
relativePathDotMapping['%2e'] = '.';
relativePathDotMapping['.%2e'] = '..';
relativePathDotMapping['%2e.'] = '..';
relativePathDotMapping['%2e%2e'] = '..';

var escapeSet = { '"': 1, '#': 1, '<': 1, '>': 1, '?': 1, '`': 1 };

var fragmentSet = { '"': 1, '<': 1, '>': 1, '`': 1 };

var querySet = { '"': 1, '#': 1, '<': 1, '>': 1, '`': 1 };

var percentEncode = function (char, set) {
  var code = char.charCodeAt(0);
  return code > 0x20 && code < 0x7F && !has(set, char) ? char : encodeURIComponent(char);
};

var includesCredentials = function (state) {
  return state.username != '' || state.password != '';
};

// States:
var SCHEME_START = {};
var SCHEME = {};
var SCHEME_DATA = {};
var NO_SCHEME = {};
var RELATIVE_OR_AUTHORITY = {};
var RELATIVE = {};
var RELATIVE_SLASH = {};
var AUTHORITY_SLASHES = {};
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
  var state = stateOverride || SCHEME_START;
  var pointer = 0;
  var buffer = '';
  var seenAt = false;
  var seenBracket = false;
  var seenPasswordToken = false;
  var result;

  input = input.replace(TAB_AND_NEW_LINE, '');

  loop: while ((input.charAt(pointer - 1) != EOF || pointer == 0)) {
    var char = input.charAt(pointer);
    switch (state) {
      case SCHEME_START:
        if (char && ALPHA.test(char)) {
          buffer += char.toLowerCase(); // ASCII-safe
          state = SCHEME;
        } else if (!stateOverride) {
          state = NO_SCHEME;
          continue;
        } else return INVALID_SCHEME;
        break;

      case SCHEME:
        if (char && ALPHANUMERIC.test(char)) {
          buffer += char.toLowerCase(); // ASCII-safe
        } else if (char == ':') {
          urlState.scheme = buffer;
          buffer = '';
          if (stateOverride) break loop;
          if (isRelativeScheme(urlState.scheme)) urlState.isRelative = true;
          if ('file' == urlState.scheme) {
            state = RELATIVE;
          } else if (urlState.isRelative && baseState && baseState.scheme == urlState.scheme) {
            state = RELATIVE_OR_AUTHORITY;
          } else if (urlState.isRelative) {
            state = AUTHORITY_SLASHES;
          } else state = SCHEME_DATA;
        } else if (!stateOverride) {
          buffer = '';
          pointer = 0;
          state = NO_SCHEME;
          continue;
        } else if (char == EOF) {
          break loop;
        } else return INVALID_SCHEME;
        break;

      case SCHEME_DATA:
        if (char == '?') {
          urlState.query = '?';
          state = QUERY;
        } else if (char == '#') {
          urlState.fragment = '#';
          state = FRAGMENT;
        // XXX error handling
        } else if (char != EOF && char != '\t' && char != '\n' && char != '\r') {
          urlState.schemeData += percentEncode(char, escapeSet);
        } break;

      case NO_SCHEME:
        if (!baseState || !(isRelativeScheme(baseState.scheme))) {
          return 'Missing scheme';
        }
        state = RELATIVE;
        continue;

      case RELATIVE_OR_AUTHORITY:
        if (char == '/' && input.charAt(pointer + 1) == '/') {
          state = AUTHORITY_IGNORE_SLASHES;
        } else {
          state = RELATIVE;
          continue;
        } break;

      case RELATIVE:
        urlState.isRelative = true;
        if (!baseState) baseState = initializeState({});
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
          var nextC = input.charAt(pointer + 1);
          var nextNextC = input.charAt(pointer + 2);
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
        if (char == '/' || char == '\\') {
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

      case AUTHORITY_SLASHES:
        state = AUTHORITY_IGNORE_SLASHES;
        if (char != '/' || buffer.charAt(pointer + 1) != '/') continue;
        pointer++;
        break;

      case AUTHORITY_IGNORE_SLASHES:
        if ('/' != char && '\\' != char) {
          state = AUTHORITY;
          continue;
        } break;

      case AUTHORITY:
        if ('@' == char) {
          if (seenAt) buffer += '%40';
          seenAt = true;
          for (var i = 0; i < buffer.length; i++) {
            var codePoint = buffer.charAt(i);
            if (codePoint == ':') {
              seenPasswordToken = true;
              continue;
            }
            var encodedCodePoints = percentEncode(codePoint, escapeSet);
            if (seenPasswordToken) urlState.password += encodedCodePoints;
            else urlState.username += encodedCodePoints;
          }
          buffer = '';
        } else if (EOF == char || '/' == char || '\\' == char || '?' == char || '#' == char) {
          pointer -= buffer.length;
          buffer = '';
          state = HOST;
          continue;
        } else buffer += char;
        break;

      case FILE_HOST:
        if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#') {
          if (
            !stateOverride &&
            buffer.length == 2 && ALPHA.test(buffer.charAt(0)) &&
            (buffer.charAt(1) == ':' || buffer.charAt(1) == '|')
          ) {
            state = RELATIVE_PATH;
          } else if (buffer == '') {
            urlState.host = '';
            if (stateOverride) break loop;
            state = RELATIVE_PATH_START;
          } else {
            result = parseHost(urlState, buffer);
            if (result) return result;
            if (urlState.host == 'localhost') urlState.host = '';
            if (stateOverride) break loop;
            buffer = '';
            state = RELATIVE_PATH_START;
          }
          continue;
        } else buffer += char;
        break;

      case HOST:
      case HOSTNAME:
        if (stateOverride && urlState.scheme == 'file') {
          state = FILE_HOST;
          continue;
        } else if (char == ':' && !seenBracket) {
          if (buffer == '') return INVALID_HOST;
          result = parseHost(urlState, buffer);
          if (result) return result;
          buffer = '';
          state = PORT;
          if (stateOverride == HOSTNAME) break loop;
        } else if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#') {
          if (buffer == '') return INVALID_HOST;
          result = parseHost(urlState, buffer);
          if (result) return result;
          buffer = '';
          state = RELATIVE_PATH_START;
          if (stateOverride) break loop;
          continue;
        } else {
          if (char == '[') seenBracket = true;
          else if (char == ']') seenBracket = false;
          buffer += char;
        } break;

      case PORT:
        if (DIGIT.test(char)) {
          buffer += char;
        } else if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#' || stateOverride) {
          if ('' != buffer) {
            var temp = parseInt(buffer, 10);
            if (temp > 65535) return INVALID_PORT;
            if (temp != relative[urlState.scheme]) urlState.port = String(temp);
            buffer = '';
          }
          if (stateOverride) break loop;
          state = RELATIVE_PATH_START;
          continue;
        } else return INVALID_PORT;
        break;

      case RELATIVE_PATH_START:
        state = RELATIVE_PATH;
        if ('/' != char && '\\' != char) continue;
        break;

      case RELATIVE_PATH:
        if (EOF == char || '/' == char || '\\' == char || (!stateOverride && ('?' == char || '#' == char))) {
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
          buffer += percentEncode(char, escapeSet);
        } break;

      case QUERY:
        if (!stateOverride && '#' == char) {
          urlState.fragment = '#';
          state = FRAGMENT;
        } else if (EOF != char && '\t' != char && '\n' != char && '\r' != char) {
          urlState.query += percentEncode(char, querySet);
        } break;

      case FRAGMENT:
        if (EOF != char && '\t' != char && '\n' != char && '\r' != char) {
          urlState.fragment += percentEncode(char, fragmentSet);
        } break;
    }

    pointer++;
  }
};

var initializeState = function (state) {
  state.scheme = '';
  state.schemeData = '';
  state.username = '';
  state.password = '';
  state.host = '';
  state.port = '';
  state.path = [];
  state.query = '';
  state.fragment = '';
  state.isRelative = false;
  return state;
};

// `URL` constructor
// https://url.spec.whatwg.org/#url-class
var URLConstructor = function URL(url /* , base */) {
  var that = anInstance(this, URLConstructor, 'URL');
  var base = arguments.length > 1 ? arguments[1] : undefined;
  var urlString = String(url);
  var state = setInternalState(that, { type: 'URL' });
  var baseState, result;
  if (base !== undefined) {
    if (base instanceof URLConstructor) baseState = getInternalURLState(base);
    else {
      baseState = initializeState({});
      result = parse(baseState, String(base));
      if (result) throw new TypeError(result);
    }
  }
  initializeState(state);
  state.url = urlString;
  result = parse(state, urlString.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, ''), null, baseState);
  if (result) throw new TypeError(result);
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
  var username = state.username;
  var password = state.password;
  var authority = '';
  if (includesCredentials(state)) {
    authority = username + (password ? ':' + password : '') + '@';
  }
  return state.scheme + ':' + (state.isRelative ? '//' + authority + getHost.call(that) : '') +
    getPathname.call(that) + state.query + state.fragment;
};

var getOrigin = function () {
  var state = getInternalURLState(this);
  var scheme = state.scheme;
  if (!scheme) return '';
  switch (scheme) {
    case 'data':
    case 'file':
    case 'javascript':
    case 'mailto':
      return 'null';
  }
  var host = getHost.call(this);
  if (!host) return '';
  return scheme + '://' + host;
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
  return state.port ? serializeHost(state.host) + ':' + state.port : serializeHost(state.host);
};

var getHostname = function () {
  return serializeHost(getInternalURLState(this).host);
};

var getPort = function () {
  return getInternalURLState(this).port;
};

var getPathname = function () {
  var state = getInternalURLState(this);
  return state.isRelative ? '/' + state.path.join('/') : state.schemeData;
};

var getSearch = function () {
  var state = getInternalURLState(this);
  return state.query === '?' ? '' : state.query;
};

var getSearchParams = function () {
  return getInternalURLState(this).searchParams;
};

var getHash = function () {
  var state = getInternalURLState(this);
  var fragment = state.fragment;
  return !fragment || '#' == fragment ? '' : fragment;
};

var cannotHaveUsernamePasswordPort = function (state) {
  return !state.isRelative;
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
      var urlString = String(href);
      initializeState(state);
      state.url = urlString;
      var result = parse(state, urlString.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, ''));
      if (result) throw new TypeError(result);
      getInternalSearchParamsState(state.searchParams).updateSearchParams(state.query);
    }),
    // `URL.prototype.origin` getter
    // https://url.spec.whatwg.org/#dom-url-origin
    origin: accessorDescriptor(getOrigin),
    // `URL.prototype.protocol` accessors pair
    // https://url.spec.whatwg.org/#dom-url-protocol
    protocol: accessorDescriptor(getProtocol, function (protocol) {
      var state = getInternalURLState(this);
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
        state.username += percentEncode(chars[i], escapeSet);
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
        state.password += percentEncode(chars[i], escapeSet);
      }
    }),
    // `URL.prototype.host` accessors pair
    // https://url.spec.whatwg.org/#dom-url-host
    host: accessorDescriptor(getHost, function (host) {
      var state = getInternalURLState(this);
      host += '';
      if (!state.isRelative) return;
      parse(state, host, HOST);
    }),
    // `URL.prototype.hostname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hostname
    hostname: accessorDescriptor(getHostname, function (hostname) {
      var state = getInternalURLState(this);
      if (!state.isRelative) return;
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
      if (!state.isRelative) return;
      state.path = [];
      parse(state, pathname + '', RELATIVE_PATH_START);
    }),
    // `URL.prototype.search` accessors pair
    // https://url.spec.whatwg.org/#dom-url-search
    search: accessorDescriptor(getSearch, function (search) {
      var state = getInternalURLState(this);
      search += '';
      if (!state.isRelative) return;
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
