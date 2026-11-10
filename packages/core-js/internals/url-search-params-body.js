'use strict';
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var call = require('../internals/function-call');
var apply = require('../internals/function-apply');
var uncurryThis = require('../internals/function-uncurry-this');
var InternalStateModule = require('../internals/internal-state');
var anInstance = require('../internals/an-instance');
var inheritIfRequired = require('../internals/inherit-if-required');
var copyConstructorProperties = require('../internals/copy-constructor-properties');
var isCallable = require('../internals/is-callable');
var classof = require('../internals/classof');
var isObject = require('../internals/is-object');
var $toString = require('../internals/to-string');
var toUSVString = require('../internals/to-usv-string');
var create = require('../internals/object-create');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var uncurryThisAccessor = require('../internals/function-uncurry-this-accessor');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var bind = require('../internals/function-bind-context');
var isArray = require('../internals/is-array');
var toPrimitive = require('../internals/to-primitive');
var wellKnownSymbol = require('../internals/well-known-symbol');
var hasOwn = require('../internals/has-own-property');
var ownKeys = require('../internals/own-keys');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var validateArgumentsLength = require('../internals/validate-arguments-length');

var NativeURLSearchParams = getBuiltIn('URLSearchParams');
var nativeParamsToString = isCallable(NativeURLSearchParams) && uncurryThis(NativeURLSearchParams.prototype.toString);

var URL_SEARCH_PARAMS = 'URLSearchParams';
var push = uncurryThis([].push);
var split = uncurryThis(''.split);
var min = Math.min;
var getState = InternalStateModule.get;

var serializeBody = function (body) {
  var state = getState(body);
  if (state.type === URL_SEARCH_PARAMS) return state.serialize();
  if (nativeParamsToString) {
    try { return nativeParamsToString(body); } catch (error) { /* empty */ }
  }
  return $toString(body);
};

var FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded;charset=UTF-8';

var patchFetch = function () {
  var Headers = getBuiltIn('Headers');
  if (isCallable(Headers)) {
    var nativeFetch = getBuiltIn('fetch');
    var NativeRequest = getBuiltIn('Request');
    var RequestPrototype = NativeRequest && NativeRequest.prototype;
    var HeadersPrototype = Headers.prototype;
    var headersHas = uncurryThis(HeadersPrototype.has);
    var headersSet = uncurryThis(HeadersPrototype.set);
    var NativeResponse = getBuiltIn('Response');
    var ResponsePrototype = NativeResponse && NativeResponse.prototype;

    var wrapHeaders = function (init) {
      var headers = new Headers(init);
      if (!headersHas(headers, 'content-type')) headersSet(headers, 'content-type', FORM_CONTENT_TYPE);
      return headers;
    };

    var Proxy = getBuiltIn('Proxy');
    var EMPTY_BODY;
    var REQUEST_CLONE_BUG = false;
    if (isCallable(NativeRequest)) {
      EMPTY_BODY = new (getBuiltIn('Uint8Array'))(0);
      try {
        var probe = new NativeRequest('http://a', { method: 'POST', body: EMPTY_BODY });
        REQUEST_CLONE_BUG = new NativeRequest(probe, { method: 'POST', body: EMPTY_BODY }).url !== probe.url;
        // Old Firefox inserts an empty type for buffers; native parameters keep the form type.
        if (nativeParamsToString && headersHas(probe.headers, 'content-type')) EMPTY_BODY = new NativeURLSearchParams();
      } catch (error) { /* empty */ }
    }
    var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
    // These dictionary members cover engines predating Proxy; modern engines report their own reads.
    var requestKeys = split('body cache client credentials dispatcher duplex headers integrity keepalive method mode priority redirect'
      + ' referrer referrerPolicy signal window', ' ');
    var stringRequestKeys = split('cache credentials duplex integrity method mode priority redirect referrer referrerPolicy', ' ');
    var requestHeaders = uncurryThisAccessor(RequestPrototype, 'headers', 'get');
    var requestSignal = uncurryThisAccessor(RequestPrototype, 'signal', 'get');
    var requestURL = uncurryThisAccessor(RequestPrototype, 'url', 'get');

    var cloneRequest = function (request, options) {
      // Old Bun stringifies a Request input when an init dictionary is supplied.
      return new NativeRequest(REQUEST_CLONE_BUG ? requestURL ? requestURL(request) : request.url : request, options);
    };

    // Native Request performs dictionary conversions. Replay only their results when replacing
    // the placeholder body without repeating author getters, iterators or coercions.
    var snapshotRequestOptions = function (init) {
      var replay = false;
      var overrides = create(null);
      var reads = create(null);
      var membership = create(null);
      var state = {};

      var remember = function (records, key, operation) {
        var record = records[key];
        if (replay && record) return record.values[min(record.index++, record.values.length - 1)];
        var value = operation();
        if (!record) records[key] = record = { values: [], index: 0 };
        push(record.values, value);
        return value;
      };

      // Proxy records nested dictionaries and sequences used by browser-specific RequestInit members.
      var capture = function (value, receiver) {
        if (!isObject(value)) return value;
        var gets = create(null);
        var descriptors = create(null);
        var calls = create(null);
        var keys = create(null);
        var properties = create(null);
        var callable = isCallable(value);
        var array = isArray(value);
        var target = callable ? bind($toString, null) : array ? [] : {};
        return new Proxy(target, {
          get: function (_, key) {
            if (key === TO_PRIMITIVE) return function (hint) {
              return remember(calls, 'primitive', function () { return toPrimitive(value, hint === 'default' ? undefined : hint); });
            };
            return remember(gets, key, function () { return capture(value[key], value); });
          },
          has: function (_, key) {
            return remember(properties, key, function () { return key in value; });
          },
          ownKeys: function () {
            return remember(keys, 'keys', function () { return ownKeys(value); });
          },
          getOwnPropertyDescriptor: function (_, key) {
            return remember(descriptors, key, function () {
              var descriptor = getOwnPropertyDescriptor(value, key);
              if (descriptor) {
                descriptor.configurable = !(array && key === 'length');
                if (array && key === 'length') descriptor.writable = true;
              }
              return descriptor;
            });
          },
          apply: function (_, that, args) {
            return remember(calls, 'call', function () { return capture(apply(value, receiver, args)); });
          }
        });
      };

      var read = function (key) {
        if (hasOwn(overrides, key)) return overrides[key];
        // fetch-specific members absent from RequestInit must still be read by native fetch itself.
        if (replay && !hasOwn(reads, key)) return init[key];
        return remember(reads, key, function () {
          var value = init[key];
          if (key === 'body') {
            if (classof(value) === URL_SEARCH_PARAMS) {
              state.body = value;
              return EMPTY_BODY;
            }
            state.body = undefined;
            return value;
          }
          if (key === 'headers') {
            state.headers = value !== undefined;
            return value;
          }
          if (key === 'signal') state.signal = value !== undefined;
          // Interface objects and runtime-specific transports must retain their identity.
          if (key === 'signal' || key === 'window' || key === 'dispatcher' || key === 'client') return value;
          if (Proxy) return capture(value);
          // Older engines only need scalar dictionary conversions; native code still validates them.
          for (var i = 0; i < stringRequestKeys.length; i++) {
            if (key === stringRequestKeys[i] && value !== undefined) return $toString(value);
          }
          return value;
        });
      };

      var options;
      if (Proxy) options = new Proxy({}, {
        get: function (_, key) { return read(key); },
        // Older native implementations check membership before reading dictionary members.
        has: function (_, key) {
          if (hasOwn(overrides, key)) return overrides[key] !== undefined;
          return remember(membership, key, function () { return key in init; });
        }
      });
      else {
        options = create(init);
        for (var i = 0; i < requestKeys.length; i++) (function (key) {
          defineBuiltInAccessor(options, key, { get: function () { return read(key); } });
        })(requestKeys[i]);
      }
      state.options = options;
      state.replay = function (request) {
        overrides.body = state.body ? serializeBody(state.body) : undefined;
        var headers = requestHeaders ? requestHeaders(request) : request.headers;
        // This private Request also supplies headers to old native constructors that ignore them in init.
        if (state.body && !headersHas(headers, 'content-type')) headersSet(headers, 'content-type', FORM_CONTENT_TYPE);
        overrides.headers = state.body || state.headers ? headers : undefined;
        // Reuse the private signal without repeating subscription hooks on the author's signal.
        if (state.signal && requestSignal) overrides.signal = requestSignal(request);
        replay = true;
      };
      return state;
    };

    var prepareRequest = function (input, init) {
      var state = isObject(init) ? snapshotRequestOptions(init) : {};
      state.request = init === undefined ? new NativeRequest(input) : new NativeRequest(input, state.options || init);
      return state;
    };

    if (isCallable(nativeFetch)) {
      var Promise = getBuiltIn('Promise');
      var promiseReject = Promise.reject;
      $({ global: true, enumerable: true, dontCallGetSet: true, forced: true }, {
        fetch: function fetch(input /* , init */) {
          try {
            validateArgumentsLength(arguments.length, 1);
            var init = arguments[1];
            if (!isObject(init)) return apply(nativeFetch, undefined, arguments);
            // Independently installed fetch implementations need not expose a Request constructor.
            if (!isCallable(NativeRequest)) {
              var body = init.body;
              if (classof(body) === URL_SEARCH_PARAMS) {
                var headers = wrapHeaders(init.headers);
                init = create(init, {
                  body: createPropertyDescriptor(0, serializeBody(body)),
                  headers: createPropertyDescriptor(0, headers)
                });
              }
              return nativeFetch(input, init);
            }
            var state = prepareRequest(input, init);
            state.replay(state.request);
            var request = state.body ? cloneRequest(state.request, state.options) : state.request;
            return nativeFetch(request, state.options);
          } catch (error) {
            return call(promiseReject, Promise, error);
          }
        }
      });
    }

    if (isCallable(NativeRequest)) {
      var RequestConstructor = function Request(input /* , init */) {
        anInstance(this, RequestPrototype);
        validateArgumentsLength(arguments.length, 1);
        var state = prepareRequest(input, arguments[1]);
        var request = state.request;
        if (state.body) {
          state.replay(request);
          request = cloneRequest(request, state.options);
        }
        return inheritIfRequired(request, this, RequestConstructor);
      };

      RequestPrototype.constructor = RequestConstructor;
      RequestConstructor.prototype = RequestPrototype;
      copyConstructorProperties(RequestConstructor, NativeRequest);

      $({ global: true, constructor: true, dontCallGetSet: true, forced: true }, {
        Request: RequestConstructor
      });
    }

    if (isCallable(NativeResponse)) {
      var responseHeaders = uncurryThisAccessor(ResponsePrototype, 'headers', 'get');
      var responseStatus = uncurryThisAccessor(ResponsePrototype, 'status', 'get');
      var responseStatusText = uncurryThisAccessor(ResponsePrototype, 'statusText', 'get');
      var ResponseConstructor = function Response(/* body, init */) {
        anInstance(this, ResponsePrototype);
        var body = arguments[0];
        var init = arguments[1];
        // Let the native constructor reject invalid dictionaries.
        if (classof(body) === URL_SEARCH_PARAMS && (init === undefined || init === null || isObject(init))) {
          // Let the native constructor convert and validate the dictionary before extracting the body.
          var response = new NativeResponse(undefined, init);
          init = {
            headers: wrapHeaders(responseHeaders ? responseHeaders(response) : response.headers),
            status: responseStatus ? responseStatus(response) : response.status,
            statusText: responseStatusText ? responseStatusText(response) : response.statusText
          };
          body = serializeBody(body);
        }
        return inheritIfRequired(new NativeResponse(body, init), this, ResponseConstructor);
      };

      ResponsePrototype.constructor = ResponseConstructor;
      ResponseConstructor.prototype = ResponsePrototype;
      copyConstructorProperties(ResponseConstructor, NativeResponse);

      $({ global: true, constructor: true, dontCallGetSet: true, forced: true }, {
        Response: ResponseConstructor
      });
    }
  }
};

var patchXMLHttpRequest = function () {
  var XMLHttpRequest = getBuiltIn('XMLHttpRequest');
  var XHRPrototype = XMLHttpRequest && XMLHttpRequest.prototype;
  var toLowerCase = uncurryThis(''.toLowerCase);

  if (XHRPrototype && isCallable(XHRPrototype.send)) {
    var nativeOpen = XHRPrototype.open;
    var nativeSetRequestHeader = XHRPrototype.setRequestHeader;
    var nativeSend = XHRPrototype.send;
    var slice = uncurryThis([].slice);
    var enforceState = InternalStateModule.enforce;

    $({ target: 'XMLHttpRequest', proto: true, enumerable: true, forced: true }, {
      open: function open(method, url) {
        var state = enforceState(this);
        var previous;
        var xhr = {};
        var args = arguments.length > 1 ? [method, url] : slice(arguments);
        for (var i = 2; i < arguments.length; i++) push(args, arguments[i]);
        if (args.length) args[0] = {
          toString: function () {
            var string = $toString(method);
            xhr.method = toLowerCase(string);
            return string;
          }
        };
        if (args.length > 1) {
          var index = args.length > 4 && args[4] !== undefined && args[4] !== null ? 4
            : args.length > 3 && args[3] !== undefined && args[3] !== null ? 3 : 1;
          var value = args[index];
          args[index] = {
            toString: function () {
              var string = toUSVString(value);
              // Argument conversions can still access the previous request.
              previous = state.xhr;
              state.xhr = xhr;
              return string;
            }
          };
        }
        // `open` can synchronously dispatch readystatechange, including author header changes.
        try {
          return apply(nativeOpen, this, args);
        } catch (error) {
          if (state.xhr === xhr) state.xhr = previous;
          throw error;
        }
      },
      setRequestHeader: function setRequestHeader(name, value) {
        if (arguments.length < 2) return apply(nativeSetRequestHeader, this, arguments);
        var header;
        // Convert the name once, at the native method's normal Web IDL conversion step.
        var result = call(nativeSetRequestHeader, this, {
          toString: function () { return header = $toString(name); }
        }, value);
        if (toLowerCase(header) === 'content-type') {
          var state = enforceState(this);
          (state.xhr || (state.xhr = {})).contentType = true;
        }
        return result;
      },
      send: function send(/* body */) {
        var body = arguments[0];
        if (classof(body) === URL_SEARCH_PARAMS) {
          body = serializeBody(body);
          var xhr = enforceState(this).xhr || {};
          if (!xhr.contentType && xhr.method !== 'get' && xhr.method !== 'head') {
            call(nativeSetRequestHeader, this, 'Content-Type', FORM_CONTENT_TYPE);
            xhr.contentType = true;
          }
        }
        return call(nativeSend, this, body);
      }
    });
  }
};

var patchSendBeacon = function () {
  var Navigator = getBuiltIn('Navigator');
  var NavigatorPrototype = Navigator && Navigator.prototype;
  var Blob = getBuiltIn('Blob');
  if (NavigatorPrototype && isCallable(NavigatorPrototype.sendBeacon) && isCallable(Blob)) {
    var nativeSendBeacon = NavigatorPrototype.sendBeacon;
    var getUserAgent = uncurryThisAccessor(NavigatorPrototype, 'userAgent', 'get');
    $({ target: 'Navigator', proto: true, enumerable: true, forced: true }, {
      sendBeacon: function sendBeacon(url /* , data */) {
        // Validate the native receiver before observable argument conversions.
        if (getUserAgent) getUserAgent(this);
        validateArgumentsLength(arguments.length, 1);
        url = toUSVString(url);
        var data = arguments.length > 1 ? arguments[1] : null;
        if (classof(data) === URL_SEARCH_PARAMS) data = new Blob([serializeBody(data)], { type: FORM_CONTENT_TYPE });
        return call(nativeSendBeacon, this, url, data);
      }
    });
  }
};

// Adapt native BodyInit consumers to polyfilled URLSearchParams. The pure build uses an empty override.
module.exports = function () {
  patchFetch();
  patchXMLHttpRequest();
  patchSendBeacon();
};
