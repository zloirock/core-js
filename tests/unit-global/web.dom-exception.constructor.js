import { DESCRIPTORS, NODE } from '../helpers/constants.js';

const errors = {
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
  // https://github.com/whatwg/webidl/pull/1465
  // QuotaExceededError: { s: 'QUOTA_EXCEEDED_ERR', c: 22, m: 1 },
  TimeoutError: { s: 'TIMEOUT_ERR', c: 23, m: 1 },
  InvalidNodeTypeError: { s: 'INVALID_NODE_TYPE_ERR', c: 24, m: 1 },
  DataCloneError: { s: 'DATA_CLONE_ERR', c: 25, m: 1 },
};

const HAS_STACK = 'stack' in new Error('1');

QUnit.test('DOMException', assert => {
  assert.isFunction(DOMException);
  assert.arity(DOMException, 0);
  assert.name(DOMException, 'DOMException');
  // assert.looksNative(DOMException); // FF43- bug

  let error = new DOMException({}, 'Foo');
  assert.true(error instanceof DOMException, 'new DOMException({}, "Foo") instanceof DOMException');
  assert.same(error.message, '[object Object]', 'new DOMException({}, "Foo").message');
  assert.same(error.name, 'Foo', 'new DOMException({}, "Foo").name');
  assert.same(error.code, 0, 'new DOMException({}, "Foo").code');
  assert.same(String(error), 'Foo: [object Object]', 'String(new DOMException({}, "Foo"))'); // Safari 10.1 bug
  assert.same(error.constructor, DOMException, 'new DOMException({}, "Foo").constructor');
  assert.same(error[Symbol.toStringTag], 'DOMException', 'DOMException.prototype[Symbol.toStringTag]');
  if (HAS_STACK) assert.true('stack' in error, "'stack' in new DOMException()");

  assert.same(new DOMException().message, '', 'new DOMException().message');
  assert.same(new DOMException(undefined).message, '', 'new DOMException(undefined).message');
  assert.same(new DOMException(42).name, 'Error', 'new DOMException(42).name');
  assert.same(new DOMException(42, undefined).name, 'Error', 'new DOMException(42, undefined).name');

  for (const name in errors) {
    error = new DOMException(42, name);
    assert.true(error instanceof DOMException, `new DOMException(42, "${ name }") instanceof DOMException`);
    assert.same(error.message, '42', `new DOMException(42, "${ name }").message`);
    assert.same(error.name, name, `new DOMException(42, "${ name }").name`);
    if (errors[name].m) assert.same(error.code, errors[name].c, `new DOMException(42, "${ name }").code`);
    // NodeJS and Deno set codes to deprecated errors
    else if (!NODE) assert.same(error.code, 0, `new DOMException(42, "${ name }").code`);
    assert.same(String(error), `${ name }: 42`, `String(new DOMException(42, "${ name }"))`); // Safari 10.1 bug
    if (HAS_STACK) assert.true('stack' in error, `'stack' in new DOMException(42, "${ name }")`);

    assert.same(DOMException[errors[name].s], errors[name].c, `DOMException.${ errors[name].s }`);
    assert.same(DOMException.prototype[errors[name].s], errors[name].c, `DOMException.prototype.${ errors[name].s }`);
  }

  assert.throws(() => DOMException(42, 'DataCloneError'), "DOMException(42, 'DataCloneError')");
  const symbol = Symbol('DOMException constructor test');
  assert.throws(() => new DOMException(symbol, 'DataCloneError'), "new DOMException(Symbol(), 'DataCloneError')");
  assert.throws(() => new DOMException(42, symbol), 'new DOMException(42, Symbol())');
  if (DESCRIPTORS) {
    // assert.throws(() => DOMException.prototype.message, 'DOMException.prototype.message'); // FF55- , Safari 10.1 bug
    // assert.throws(() => DOMException.prototype.name, 'DOMException.prototype.name'); // FF55-, Safari 10.1 bug bug
    // assert.throws(() => DOMException.prototype.code, 'DOMException.prototype.code'); // Safari 10.1 bug
    // assert.throws(() => DOMException.prototype.toString(), 'DOMException.prototype.toString()'); // FF55- bug
  }
});
