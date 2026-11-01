/* eslint-disable no-restricted-globals, unicorn/prefer-global-this -- safe */
import { GLOBAL } from '../helpers/constants.js';

QUnit.test('self', assert => {
  assert.same(self, Object(self), 'is object');
  assert.same(self.Math, Math, 'contains globals');
  const descriptor = Object.getOwnPropertyDescriptor(self, 'self');
  // can't be properly defined (non-configurable) in some engines like Deno 1.11-
  // assert.isFunction(descriptor.get, 'a getter');
  // assert.true(descriptor.configurable, 'configurable');
  assert.true(descriptor.enumerable, 'enumerable');
  const receivers = [GLOBAL, undefined, null];
  const invalidReceivers = [{}, false, 0, ''];
  if (descriptor.get) {
    for (const receiver of receivers) {
      assert.same(descriptor.get.call(receiver), GLOBAL, 'getter accepts the global object and nullish receivers');
    }
    for (const receiver of invalidReceivers) {
      assert.throws(() => descriptor.get.call(receiver), TypeError, 'getter rejects an invalid receiver');
    }
  }
  if (descriptor.set && descriptor.configurable) {
    let assigned;
    try {
      GLOBAL.self = 42;
      assigned = GLOBAL.self;
    } finally {
      Object.defineProperty(GLOBAL, 'self', descriptor);
    }
    assert.same(assigned, 42, 'ordinary assignment replaces self');
    for (const receiver of invalidReceivers) {
      assert.throws(() => {
        try {
          descriptor.set.call(receiver, 42);
        } finally {
          Object.defineProperty(GLOBAL, 'self', descriptor);
        }
      }, TypeError, 'setter rejects an invalid receiver');
    }
    for (const receiver of receivers) {
      let result;
      let replacement;
      try {
        result = descriptor.set.call(receiver, 42);
        replacement = Object.getOwnPropertyDescriptor(GLOBAL, 'self');
      } finally {
        Object.defineProperty(GLOBAL, 'self', descriptor);
      }
      assert.same(result, undefined, 'setter returns undefined');
      assert.deepEqual(replacement, {
        value: 42,
        writable: true,
        configurable: true,
        enumerable: true,
      }, 'setter replaces self on the global object');
    }
  }
  if (descriptor.get && GLOBAL.document) {
    const iframe = GLOBAL.document.createElement('iframe');
    GLOBAL.document.documentElement.appendChild(iframe);
    try {
      const otherGlobal = iframe.contentWindow;
      assert.same(descriptor.get.call(otherGlobal), otherGlobal, 'getter accepts another global');
      if (descriptor.set && descriptor.configurable) {
        descriptor.set.call(otherGlobal, 42);
        assert.same(otherGlobal.self, 42, 'setter replaces self on another global');
        assert.same(GLOBAL.self, GLOBAL, 'setter preserves this global');
      }
    } finally {
      if (descriptor.configurable) Object.defineProperty(GLOBAL, 'self', descriptor);
      GLOBAL.document.documentElement.removeChild(iframe);
    }
  }
});
