'use strict';
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var fails = require('../internals/fails');
var call = require('../internals/function-call');
var apply = require('../internals/function-apply');
var uncurryThis = require('../internals/function-uncurry-this');
var InternalStateModule = require('../internals/internal-state');
var anInstance = require('../internals/an-instance');
var inheritIfRequired = require('../internals/inherit-if-required');
var copyConstructorProperties = require('../internals/copy-constructor-properties');
var isCallable = require('../internals/is-callable');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var classof = require('../internals/classof');
var isObject = require('../internals/is-object');
var $toString = require('../internals/to-string');
var toUSVString = require('../internals/to-usv-string');
var create = require('../internals/object-create');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var uncurryThisAccessor = require('../internals/function-uncurry-this-accessor');
var validateArgumentsLength = require('../internals/validate-arguments-length');

var NativeURLSearchParams = getBuiltIn('URLSearchParams');
var nativeParamsToString = isCallable(NativeURLSearchParams) && uncurryThis(NativeURLSearchParams.prototype.toString);

var URL_SEARCH_PARAMS = 'URLSearchParams';
var push = uncurryThis([].push);
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

var hasFormType = function (body) {
  return body.headers.get('content-type') === FORM_CONTENT_TYPE;
};

var patchFetch = function (NATIVE_INSTANCES) {
  var Headers = getBuiltIn('Headers');
  var NativeRequest = getBuiltIn('Request');
  var NativeResponse = getBuiltIn('Response');
  // native instances need no wrappers where the fetch API takes a native `URLSearchParams`
  if (NATIVE_INSTANCES && !fails(function () {
    var params = new NativeURLSearchParams('a=1');
    return !hasFormType(new NativeRequest('http://a', { method: 'POST', body: params })) || !hasFormType(new NativeResponse(params));
  })) return;
  if (isCallable(Headers)) {
    var nativeFetch = getBuiltIn('fetch');
    var RequestPrototype = NativeRequest && NativeRequest.prototype;
    var HeadersPrototype = Headers.prototype;
    var headersHas = uncurryThis(HeadersPrototype.has);
    var headersSet = uncurryThis(HeadersPrototype.set);
    var ResponsePrototype = NativeResponse && NativeResponse.prototype;

    var wrapHeaders = function (init) {
      var headers = new Headers(init);
      if (!headersHas(headers, 'content-type')) headersSet(headers, 'content-type', FORM_CONTENT_TYPE);
      return headers;
    };

    var requestHeaders = uncurryThisAccessor(RequestPrototype, 'headers', 'get');

    var isRequest = function (it) {
      return !!RequestPrototype && isPrototypeOf(RequestPrototype, it);
    };

    // the options with a polyfilled `URLSearchParams` body replaced by its serialization and the form type
    var wrapRequestOptions = function (input, init) {
      if (isObject(init)) {
        var body = init.body;
        if (classof(body) === URL_SEARCH_PARAMS) {
          var headers = init.headers;
          // options without headers keep the headers of the input `Request`
          if (headers === undefined && isRequest(input)) headers = requestHeaders ? requestHeaders(input) : input.headers;
          return create(init, {
            body: createPropertyDescriptor(0, serializeBody(body)),
            headers: createPropertyDescriptor(0, wrapHeaders(headers))
          });
        }
      }
      return init;
    };

    // a request from the options that `wrapRequestOptions` replaced: for a `Request` input,
    // Deno 1.0-1.1 ignores the headers of the options, and its `fetch` ignores all of them
    var createRequest = function (input, options) {
      var request = new NativeRequest(input, options);
      var headers = requestHeaders ? requestHeaders(request) : request.headers;
      if (!headersHas(headers, 'content-type')) headersSet(headers, 'content-type', FORM_CONTENT_TYPE);
      return request;
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
            var options = wrapRequestOptions(input, init);
            return nativeFetch(options !== init && isRequest(input) ? createRequest(input, options) : input, options);
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
        var init = arguments[1];
        var options = wrapRequestOptions(input, init);
        var request = options !== init ? createRequest(input, options)
          : init === undefined ? new NativeRequest(input) : new NativeRequest(input, init);
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
// `NATIVE_INSTANCES` - every instance of the polyfill is a native object.
module.exports = function (NATIVE_INSTANCES) {
  patchFetch(NATIVE_INSTANCES);
  patchXMLHttpRequest();
  patchSendBeacon();
};
