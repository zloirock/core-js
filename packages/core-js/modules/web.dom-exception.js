'use strict';
var $ = require('../internals/export');
var global = require('../internals/global');
var path = require('../internals/path');
var fails = require('../internals/fails');
var create = require('../internals/object-create');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var defineProperty = require('../internals/object-define-property').f;
var defineProperties = require('../internals/object-define-properties');
var redefine = require('../internals/redefine');
var hasOwn = require('../internals/has-own-property');
var anInstance = require('../internals/an-instance');
var anObject = require('../internals/an-object');
var $toString = require('../internals/to-string');
var setToStringTag = require('../internals/set-to-string-tag');
var InternalStateModule = require('../internals/internal-state');
var DESCRIPTORS = require('../internals/descriptors');
var IS_PURE = require('../internals/is-pure');

var DATA_CLONE_ERR = 'DATA_CLONE_ERR';
var DOM_EXCEPTION = 'DOMException';
var HAS_STACK = 'stack' in Error(DOM_EXCEPTION);
var NativeDOMException = global[DOM_EXCEPTION];
var NativeDOMExceptionPrototype = NativeDOMException && NativeDOMException.prototype;
var ErrorPrototype = Error.prototype;
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(DOM_EXCEPTION);

var errors = {
  IndexSizeError: { s: 'INDEX_SIZE_ERR', c: 1, m: 1 },
  DOMStringSizeError: { s: 'DOMSTRING_SIZE_ERR', c: 2, m: 0 },
  HierarchyRequestError: { s: 'HIERARCHY_REQUEST_ERR', c: 3, m: 1 },
  WrongDocumentError: { s: 'WRONG_DOCUMENT_ERR', c: 4, m: 1 },
  InvalidCharacterError: { s: 'INVALID_CHARACTER_ERR', c: 5, m: 1 },
  NoDataAllowedError: { s: 'NO_DATA_ALLOWED_ERR', c: 6, m: 0 },
  NoModificationAllowedError: { s: 'NO_MODIFICATION_ALLOWED_ERR', c: 7, m: 1 },
  NotFoundError: { s: 'NOT_FOUND_ERR', c: 8, m: 1 },
  NotSupportedError: { s: 'NOT_SUPPORTED_ERR', c: 9, m: 1 },
  InUseAttributeError: { s: 'INUSE_ATTRIBUTE_ERR', c: 10, m: 1 },
  InvalidStateError: { s: 'INVALID_STATE_ERR', c: 11, m: 1 },
  SyntaxError: { s: 'SYNTAX_ERR', c: 12, m: 1 },
  InvalidModificationError: { s: 'INVALID_MODIFICATION_ERR', c: 13, m: 1 },
  NamespaceError: { s: 'NAMESPACE_ERR', c: 14, m: 1 },
  InvalidAccessError: { s: 'INVALID_ACCESS_ERR', c: 15, m: 1 },
  ValidationError: { s: 'VALIDATION_ERR', c: 16, m: 0 },
  TypeMismatchError: { s: 'TYPE_MISMATCH_ERR', c: 17, m: 1 },
  SecurityError: { s: 'SECURITY_ERR', c: 18, m: 1 },
  NetworkError: { s: 'NETWORK_ERR', c: 19, m: 1 },
  AbortError: { s: 'ABORT_ERR', c: 20, m: 1 },
  URLMismatchError: { s: 'URL_MISMATCH_ERR', c: 21, m: 1 },
  QuotaExceededError: { s: 'QUOTA_EXCEEDED_ERR', c: 22, m: 1 },
  TimeoutError: { s: 'TIMEOUT_ERR', c: 23, m: 1 },
  InvalidNodeTypeError: { s: 'INVALID_NODE_TYPE_ERR', c: 24, m: 1 },
  DataCloneError: { s: 'DATA_CLONE_ERR', c: 25, m: 1 }
};

var normalize = function (argument, $default) {
  return argument === undefined ? $default : $toString(argument);
};

var $DOMException = function DOMException() {
  anInstance(this, $DOMException, DOM_EXCEPTION);
  var argumentsLength = arguments.length;
  var message = normalize(argumentsLength < 1 ? undefined : arguments[0], '');
  var name = normalize(argumentsLength < 2 ? undefined : arguments[1], 'Error');
  var code = hasOwn(errors, name) && errors[name].m ? errors[name].c : 0;
  setInternalState(this, {
    type: DOM_EXCEPTION,
    name: name,
    message: message,
    code: code
  });
  if (!DESCRIPTORS) {
    this.name = name;
    this.message = message;
    this.code = code;
  }
  if (HAS_STACK) {
    var error = Error(message);
    error.name = DOM_EXCEPTION;
    defineProperty(this, 'stack', createPropertyDescriptor(1, error.stack));
  }
};

var $DOMExceptionPrototype = $DOMException.prototype = create(ErrorPrototype);

var getter = function (key) {
  return { enumerable: true, configurable: true, get: function () { return getInternalState(this)[key]; } };
};

if (DESCRIPTORS) defineProperties($DOMExceptionPrototype, {
  name: getter('name'),
  message: getter('message'),
  code: getter('code')
});

defineProperty($DOMExceptionPrototype, 'constructor', createPropertyDescriptor(1, $DOMException));

// FF36- DOMException is a function, but can't be constructed
var INCORRECT_CONSTRUCTOR = fails(function () {
  return !new NativeDOMException();
});

// Safari 10.1 / Deno 1.6.3- DOMException.prototype.toString bug
var INCORRECT_TO_STRING = INCORRECT_CONSTRUCTOR || fails(function () {
  return String(new DOMException(1, 2)) !== '2: 1';
});

var INCORRECT_ERROR_TO_STRING = INCORRECT_CONSTRUCTOR || fails(function () {
  return String(ErrorPrototype.toString.call({ message: 1, name: 2 })) !== '2: 1';
});

// Deno 1.6.3- DOMException.prototype.code just missed
var INCORRECT_CODE = INCORRECT_CONSTRUCTOR || fails(function () {
  return new NativeDOMException(1, 'DataCloneError').code !== 25;
});

// Deno 1.6.3- DOMException constants just missed
var MISSED_CONSTANTS = INCORRECT_CONSTRUCTOR
  || !NativeDOMException[DATA_CLONE_ERR]
  || !NativeDOMExceptionPrototype[DATA_CLONE_ERR];

var FORCED_CONSTRUCTOR = IS_PURE ? INCORRECT_TO_STRING || INCORRECT_CODE || MISSED_CONSTANTS : INCORRECT_CONSTRUCTOR;

// `DOMException` constructor
// https://heycam.github.io/webidl/#idl-DOMException
$({ global: true, forced: FORCED_CONSTRUCTOR }, {
  DOMException: $DOMException
});

var PolyfilledDOMException = path[DOM_EXCEPTION];
var PolyfilledDOMExceptionPrototype = PolyfilledDOMException.prototype;

if (PolyfilledDOMException !== $DOMException ? INCORRECT_TO_STRING : INCORRECT_ERROR_TO_STRING) {
  redefine(PolyfilledDOMExceptionPrototype, 'toString', function toString() {
    var O = anObject(this);
    var name = normalize(O.name, 'Error');
    var message = normalize(O.message, '');
    return !name ? message : !message ? name : name + ': ' + message;
  });
}

if (PolyfilledDOMException !== $DOMException && INCORRECT_CODE && DESCRIPTORS) {
  defineProperty(PolyfilledDOMExceptionPrototype, 'code', {
    enumerable: true,
    configurable: true,
    get: function () {
      var name = anObject(this).name;
      return hasOwn(errors, name) && errors[name].m ? errors[name].c : 0;
    }
  });
}

for (var key in errors) if (hasOwn(errors, key)) {
  var constant = errors[key];
  var constantName = constant.s;
  var descriptor = createPropertyDescriptor(6, constant.c);
  if (!hasOwn(PolyfilledDOMException, constantName)) {
    defineProperty(PolyfilledDOMException, constantName, descriptor);
  }
  if (!hasOwn(PolyfilledDOMExceptionPrototype, constantName)) {
    defineProperty(PolyfilledDOMExceptionPrototype, constantName, descriptor);
  }
}

setToStringTag(PolyfilledDOMException, DOM_EXCEPTION);
