import { DESCRIPTORS } from '../helpers/constants';
import DOMException from 'core-js-pure/stable/dom-exception';
import Symbol from 'core-js-pure/es/symbol';

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
  QuotaExceededError: { s: 'QUOTA_EXCEEDED_ERR', c: 22, m: 1 },
  TimeoutError: { s: 'TIMEOUT_ERR', c: 23, m: 1 },
  InvalidNodeTypeError: { s: 'INVALID_NODE_TYPE_ERR', c: 24, m: 1 },
  DataCloneError: { s: 'DATA_CLONE_ERR', c: 25, m: 1 },
};

QUnit.test('DOMException', assert => {
  assert.isFunction(DOMException);
  assert.arity(DOMException, 0);
  assert.name(DOMException, 'DOMException');

  let error = new DOMException({}, 'Foo');
  assert.ok(error instanceof DOMException, 'new DOMException({}, "Foo") instanceof DOMException');
  assert.same(error.message, '[object Object]', 'new DOMException({}, "Foo").message');
  assert.same(error.name, 'Foo', 'new DOMException({}, "Foo").name');
  assert.same(error.code, 0, 'new DOMException({}, "Foo").code');
  assert.same(String(error), 'Foo: [object Object]', 'String(new DOMException({}, "Foo"))');
  assert.same(error.constructor, DOMException, 'new DOMException({}, "Foo").constructor');
  assert.same(error[Symbol.toStringTag], 'DOMException', 'DOMException.prototype[Symbol.toStringTag]');

  assert.same(new DOMException().message, '', 'new DOMException().message');
  assert.same(new DOMException(undefined).message, '', 'new DOMException(undefined).message');
  assert.same(new DOMException(42).name, 'Error', 'new DOMException(42).name');
  assert.same(new DOMException(42, undefined).name, 'Error', 'new DOMException(42, undefined).name');

  for (const name in errors) {
    error = new DOMException(42, name);
    assert.ok(error instanceof DOMException, `new DOMException({}, "${ name }") instanceof DOMException`);
    assert.same(error.message, '42', `new DOMException({}, "${ name }").message`);
    assert.same(error.name, name, `new DOMException({}, "${ name }").name`);
    if (errors[name].m) assert.same(error.code, errors[name].c, `new DOMException({}, "${ name }").code`);
    else assert.same(error.code, 0, `new DOMException({}, "${ name }").code`);
    assert.same(String(error), `${ name }: 42`, `String(new DOMException({}, "${ name }"))`);

    assert.same(DOMException[errors[name].s], errors[name].c, `DOMException.${ errors[name].s }`);
    assert.same(DOMException.prototype[errors[name].s], errors[name].c, `DOMException.prototype.${ errors[name].s }`);
  }

  assert.throws(() => DOMException(42, 'DataCloneError'), "DOMException(42, 'DataCloneError')");
  assert.throws(() => new DOMException(Symbol(), 'DataCloneError'), "new DOMException(Symbol(), 'DataCloneError')");
  assert.throws(() => new DOMException(42, Symbol()), 'new DOMException(42, Symbol())');
  if (DESCRIPTORS) {
    assert.throws(() => DOMException.prototype.message, 'DOMException.prototype.message');
    assert.throws(() => DOMException.prototype.name, 'DOMException.prototype.name');
    assert.throws(() => DOMException.prototype.code, 'DOMException.prototype.code');
    assert.throws(() => DOMException.prototype.toString(), 'DOMException.prototype.toString()');
  }
});
