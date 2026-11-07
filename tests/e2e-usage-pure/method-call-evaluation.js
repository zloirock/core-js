/* global ExternalConstructorForTest -- installed by the foreign helper to keep the constructor opaque */
import { withTemporaryProperty } from '../helpers/restore-property.cjs';
import '@core-js/pure/actual/reflect/construct';
import reflectNamespace from '@core-js/pure/actual/reflect/namespace';

// Exported callers keep the dispatcher open to receivers supplied by another module.
export function invokeMethod(receiver, argument) {
  return receiver.at(argument());
}

export function invokeOptionalMethod(receiver, argument) {
  return receiver.at?.(argument());
}

export function invokeSealedMethod(receiver, argument) {
  // eslint-disable-next-line no-unsafe-optional-chaining -- the ordinary outer call must throw after its arguments
  return (receiver?.at)(argument());
}

export function invokeObjectArgument(receiver, argument) {
  return receiver.at({ value: argument() });
}

export function invokeSequenceArgument(receiver, argument) {
  return receiver.at((argument(), 0));
}

export function invokeTemplateArgument(receiver, argument) {
  return receiver.at(`value:${ argument }`);
}

export function invokeSelectedStatic(receiver, argument) {
  const Ctor = receiver || Array;
  return Ctor.from(argument());
}

export function invokeSelectedStaticFallback(receiver, argument) {
  const Ctor = receiver || Object;
  return Ctor.entries(argument());
}

// eslint-disable-next-line no-unsafe-optional-chaining, @stylistic/no-extra-parens -- retain the sealed call inside its default frame
export function invokeSealedSymbolDefault(get, key, argument, value = (get()?.[(key(), Symbol.iterator)])(argument())) {
  return value;
}

export function invokeSymbolContinuation(get, key, argument) {
  // eslint-disable-next-line no-sequences -- observe the computed key before the optional call
  return get()?.[key(), Symbol.iterator]?.(argument()).toString();
}

QUnit.test('symbol call: key effects do not seal the optional continuation', assert => {
  for (const outcome of ['callable', 'null receiver', 'null method']) {
    const events = [];
    const receiver = outcome === 'null receiver' ? null : { get [Symbol.iterator]() {
      events.push('lookup');
      return outcome === 'null method' ? null : function (value) {
        assert.same(this, receiver);
        return value;
      };
    } };
    const result = invokeSymbolContinuation(() => {
      events.push('receiver');
      return receiver;
    }, () => events.push('key'), () => {
      events.push('argument');
      return 42;
    });
    assert.same(result, outcome === 'callable' ? '42' : undefined);
    assert.deepEqual(events, outcome === 'callable' ? ['receiver', 'key', 'lookup', 'argument']
      : outcome === 'null receiver' ? ['receiver'] : ['receiver', 'key', 'lookup']);
  }
});

QUnit.test('symbol call: sealed key effects and arguments keep their frame during reentry', assert => {
  for (const present of [false, true]) {
    const events = [];
    const inner = { [Symbol.iterator](value) {
      assert.same(this, inner);
      events.push('inner body');
      return value;
    } };
    const receiver = present ? { get [Symbol.iterator]() {
      events.push('lookup');
      invokeSealedSymbolDefault(() => inner, () => 0, () => 0);
      return function (value) {
        assert.same(this, receiver);
        events.push('body');
        return value;
      };
    } } : null;
    function run() {
      return invokeSealedSymbolDefault(() => {
        events.push('receiver');
        return receiver;
      }, () => events.push('key'), () => {
        events.push('argument');
        return 42;
      });
    }
    if (present) assert.same(run(), 42);
    else assert.throws(run, TypeError);
    assert.deepEqual(events, present
      ? ['receiver', 'key', 'lookup', 'inner body', 'argument', 'body']
      : ['receiver', 'argument']);
  }
});

// A raw optional lookup can re-read a stable receiver, but still owes its sequence prefix.
export function invokeRawOptionalChain(receiver, prefix, argument) {
  return (prefix(), receiver).read?.(argument()).includes(2);
}

QUnit.test('optional method: raw stable receiver retains its prefix before lookup', assert => {
  for (const present of [false, true]) {
    const events = [];
    const receiver = { get read() {
      events.push('lookup');
      return present ? function (value) {
        assert.same(this, receiver);
        events.push('body');
        return [value];
      } : undefined;
    } };
    const result = invokeRawOptionalChain(receiver, () => events.push('prefix'), () => {
      events.push('argument');
      return 2;
    });
    assert.same(result, present ? true : undefined);
    assert.deepEqual(events, present ? ['prefix', 'lookup', 'argument', 'body'] : ['prefix', 'lookup']);
  }
});

QUnit.test('method call: selected statics evaluate arguments before rejecting the raw method', assert => {
  for (const [invoke, key] of [[invokeSelectedStatic, 'from'], [invokeSelectedStaticFallback, 'entries']]) {
    for (const method of [undefined, null]) {
      const events = [];
      const receiver = {};
      Object.defineProperty(receiver, key, { get() {
        events.push('lookup');
        return method;
      } });
      assert.throws(() => invoke(receiver, () => events.push('argument')), TypeError);
      assert.deepEqual(events, ['lookup', 'argument']);
    }
    const receiver = {};
    receiver[key] = function (argument) {
      assert.same(this, receiver);
      return argument;
    };
    assert.same(invoke(receiver, () => 42), 42);
  }
  assert.deepEqual(invokeSelectedStatic(null, () => [1]), [1]);
});

QUnit.test('method call: effects inside argument values precede rejection', assert => {
  for (const invoke of [invokeObjectArgument, invokeSequenceArgument, invokeTemplateArgument]) {
    for (const method of [undefined, null]) {
      const events = [];
      const receiver = { get at() {
        events.push('lookup');
        return method;
      } };
      function argument() {
        events.push('argument'); return 7;
      }
      argument.toString = () => {
        events.push('argument'); return '7';
      };
      assert.throws(() => invoke(receiver, argument), TypeError);
      assert.deepEqual(events, ['lookup', 'argument']);
    }
  }
});

QUnit.test('method call: arguments precede a non-callable method error', assert => {
  for (const method of [undefined, null, 0, false, '', 17]) {
    const events = [];
    const receiver = { get at() {
      events.push('lookup');
      return method;
    } };
    assert.throws(() => invokeMethod(receiver, () => events.push('argument')), TypeError);
    assert.deepEqual(events, ['lookup', 'argument']);
    const failure = {};
    assert.throws(() => invokeMethod(receiver, () => { throw failure; }), error => error === failure);
  }
});

QUnit.test('method call: successful dispatch retains the receiver and evaluates once', assert => {
  const events = [];
  const receiver = { get at() {
    events.push('lookup');
    return function (value) {
      events.push('body');
      assert.same(this, receiver);
      return value;
    };
  } };
  assert.same(invokeMethod(receiver, () => {
    events.push('argument');
    return 42;
  }), 42);
  assert.deepEqual(events, ['lookup', 'argument', 'body']);
});

QUnit.test('method call: optional calls skip arguments and sealed calls evaluate them', assert => {
  for (const method of [undefined, null]) {
    let argumentsRun = 0;
    assert.same(invokeOptionalMethod({ at: method }, () => argumentsRun++), undefined);
    assert.same(argumentsRun, 0);
  }
  let argumentsRun = 0;
  assert.throws(() => invokeSealedMethod(null, () => argumentsRun++), TypeError);
  assert.same(argumentsRun, 1);
  assert.throws(() => invokeMethod(null, () => argumentsRun++), TypeError);
  assert.same(argumentsRun, 1, 'a null receiver still throws during property lookup');
});

// Key effects must not move before a receiver capture, including during getter re-entry.
export function invokeKeyedMethod(getReceiver, key, argument) {
  // eslint-disable-next-line no-sequences -- computed key effects follow the receiver evaluation
  return getReceiver()[key(), 'at'](argument());
}

export function invokeMutableKeyedMethod(receiver, replacement, argument) {
  // eslint-disable-next-line no-useless-assignment, no-sequences -- the key overwrites a value already captured by the member evaluation
  return receiver[receiver = replacement, 'at'](argument());
}

export function invokeNestedKeyedMethod(receiver, events) {
  // eslint-disable-next-line no-sequences -- nested claims in a consumed key must remain live
  return receiver[events.push('key'), ['x'].includes('x'), 'at']([4].at(0));
}

QUnit.test('method call: receiver, key, lookup and argument retain their order', assert => {
  const events = [];
  const receiver = { get at() {
    events.push('lookup');
    return function (value) {
      events.push('body');
      assert.same(this, receiver);
      return value;
    };
  } };
  assert.same(invokeKeyedMethod(() => {
    events.push('receiver'); return receiver;
  }, () => events.push('key'), () => {
    events.push('argument'); return 42;
  }), 42);
  assert.deepEqual(events, ['receiver', 'key', 'lookup', 'argument', 'body']);
  events.length = 0;
  const failure = {};
  assert.throws(() => invokeKeyedMethod(() => { throw failure; }, () => events.push('key'), () => events.push('argument')),
    error => error === failure);
  assert.deepEqual(events, [], 'a receiver failure precedes key and argument effects');
  assert.same(invokeMutableKeyedMethod(receiver, { at: null }, () => 7), 7, 'the key cannot replace the captured this value');
  events.length = 0;
  assert.same(invokeNestedKeyedMethod(receiver, events), 4);
  assert.deepEqual(events, ['key', 'lookup', 'body'], 'nested key and argument claims remain live');
});

QUnit.test('method call: a re-entering getter cannot replace the outer receiver capture', assert => {
  const events = [];
  const nested = { at(value) {
    events.push('inner body');
    assert.same(this, nested);
    return value;
  } };
  const outer = { get at() {
    events.push('outer lookup');
    assert.same(invokeKeyedMethod(() => nested, () => events.push('inner key'), () => 3), 3);
    return function (value) {
      events.push('outer body');
      assert.same(this, outer);
      return value;
    };
  } };
  assert.same(invokeKeyedMethod(() => outer, () => events.push('outer key'), () => {
    events.push('outer argument'); return 7;
  }), 7);
  assert.deepEqual(events, ['outer key', 'outer lookup', 'inner key', 'inner body', 'outer argument', 'outer body']);
});

// Default expressions and field initializers need a capture local to each evaluation.
// eslint-disable-next-line no-sequences -- the key runs after capturing the receiver
export function invokeDefaultKeyedMethod(get, key, argument, value = get()[key(), 'at'](argument())) {
  return value;
}

export function invokeFieldKeyedMethod(get, key, argument) {
  return new class {
    // eslint-disable-next-line no-sequences -- the field owns its own receiver capture
    value = get()[key(), 'at'](argument());
  }().value;
}

QUnit.test('method call: re-entry keeps parameter and field captures in their own activation', assert => {
  for (const invoke of [invokeDefaultKeyedMethod, invokeFieldKeyedMethod]) {
    const events = [];
    const inner = { at(value) {
      assert.same(this, inner);
      events.push('inner body');
      return value;
    } };
    const outer = { get at() {
      events.push('outer lookup');
      assert.same(invoke(() => inner, () => events.push('inner key'), () => 3), 3);
      return function (value) {
        assert.same(this, outer);
        events.push('outer body');
        return value;
      };
    } };
    assert.same(invoke(() => {
      events.push('outer receiver'); return outer;
    }, () => events.push('outer key'), () => {
      events.push('outer argument'); return [7].at(0);
    }), 7);
    assert.deepEqual(events, [
      'outer receiver', 'outer key', 'outer lookup', 'inner key', 'inner body', 'outer argument', 'outer body',
    ]);
  }
});

export function invokeSymbolMethod(get, argument) {
  return get()[Symbol.iterator](argument());
}

QUnit.test('method call: symbol lookup keeps its receiver through re-entry and argument effects', assert => {
  const events = [];
  const inner = { [Symbol.iterator](value) {
    assert.same(this, inner);
    events.push('inner body');
    return value;
  } };
  const outer = { get [Symbol.iterator]() {
    events.push('outer lookup');
    assert.same(invokeSymbolMethod(() => inner, () => 3), 3);
    return function (value) {
      assert.same(this, outer);
      events.push('outer body');
      return value;
    };
  } };
  assert.same(invokeSymbolMethod(() => {
    events.push('receiver'); return outer;
  }, () => {
    events.push('argument'); return 7;
  }), 7);
  assert.deepEqual(events, ['receiver', 'outer lookup', 'inner body', 'argument', 'outer body']);
  for (const method of [undefined, null]) {
    events.length = 0;
    const receiver = { get [Symbol.iterator]() {
      events.push('lookup'); return method;
    } };
    assert.throws(() => invokeSymbolMethod(() => receiver, () => events.push('argument')), TypeError);
    assert.deepEqual(events, ['lookup', 'argument']);
  }
});

export function invokeDefaultOptionalChain(get, argument, value = get()?.at?.(argument())?.includes('2')) {
  return value;
}

export function invokeFieldOptionalChain(get, argument) {
  return new class {
    value = get()?.at?.(argument())?.includes('2');
  }().value;
}

QUnit.test('optional method continuation: captures survive re-entry in defaults and fields', assert => {
  for (const invoke of [invokeDefaultOptionalChain, invokeFieldOptionalChain]) {
    const events = [];
    const inner = { at(value) {
      assert.same(this, inner);
      events.push('inner body');
      return value;
    } };
    const outer = { get at() {
      events.push('lookup');
      assert.same(invoke(() => inner, () => '2'), true);
      return function (value) {
        assert.same(this, outer);
        events.push('outer body');
        return value;
      };
    } };
    assert.same(invoke(() => {
      events.push('receiver'); return outer;
    }, () => {
      events.push('argument'); return ['42'].at(0);
    }), true);
    assert.deepEqual(events, ['receiver', 'lookup', 'inner body', 'argument', 'outer body']);
    for (const receiver of [null, {}, { at: null }]) {
      assert.same(invoke(() => receiver, () => assert.unreachable()), undefined);
    }
    assert.same(invoke(() => ({ at() { return undefined; } }), () => 0), undefined);
  }
});

QUnit.test('constructed receiver: an external constructor can return different instance families', assert => {
  const own = { at(index) {
    assert.same(this, own);
    return index + 10;
  } };
  for (const [value, expected] of [[[1, 2, 3], 3], [Object('abc'), 'c'], [own, 9]]) {
    let calls = 0;
    function External() {
      calls++;
      return value;
    }
    // The foreign helper installs the name without revealing its constructor body to this module.
    withTemporaryProperty(Function('return this')(), 'ExternalConstructorForTest', External, () => {
      assert.same(new ExternalConstructorForTest().at(-1), expected);
      const held = new ExternalConstructorForTest();
      assert.same(held.at(-1), expected);
      const Alias = ExternalConstructorForTest;
      assert.same(new Alias().at(-1), expected);
      assert.same(new globalThis.ExternalConstructorForTest().at(-1), expected);
      assert.same(calls, 4);
    });
  }
});

QUnit.test('constructed receiver: an external array result retains findLast', assert => {
  function External() { return [1, 2, 3]; }
  withTemporaryProperty(Function('return this')(), 'ExternalConstructorForTest', External, () => {
    const held = new ExternalConstructorForTest();
    assert.same(held.findLast(value => value < 3), 2);
  });
});

// eslint-disable-next-line es/no-proxy -- Proxy is an optional host capability, absent on IE11
if (typeof Proxy === 'function') QUnit.test('constructed receiver: proxy methods retain polyfills and user overrides', assert => {
  /* eslint-disable es/no-proxy -- the test is gated on host support */
  assert.same(new Proxy([1, 2, 3], {}).findLast(value => value < 3), 2);
  const held = new Proxy([1, 2, 3], {});
  assert.same(held.at(-1), 3);
  const Alias = Proxy;
  assert.same(new Alias([4, 5], {}).at(-1), 5);
  let reads = 0;
  const own = new Proxy([], { get(target, key) {
    if (key !== 'at') return target[key];
    reads++;
    return function (index) {
      assert.same(this, own);
      return index + 10;
    };
  } });
  assert.same(own.at(-1), 9);
  assert.same(reads, 1);
  /* eslint-enable es/no-proxy -- end of host-dependent constructor checks */
});

QUnit.test('constructed receiver: Object preserves the wrapped value family', assert => {
  assert.same(new Object([1, 2, 3]).findLast(value => value < 3), 2);
  assert.same(new Object('abc').at(-1), 'c');
});

/* eslint-disable no-constructor-return -- replacing the instance is the behavior under test */
QUnit.test('constructed receiver: a class can replace its instance', assert => {
  const events = [];
  class C {
    constructor() {
      events.push('construct');
      return [1, 2, 3];
    }
  }
  assert.same(new C().at((events.push('argument'), -1)), 3);
  assert.deepEqual(events, ['construct', 'argument']);
});

QUnit.test('constructed receiver: inherited and derived constructors can replace their instances', assert => {
  class Base { constructor() { return [1, 2, 3]; } }
  class Derived extends Base { /* empty */ }
  assert.same(new Derived().findLast(value => value < 3), 2);
  class Foreign extends Array { constructor() { return Object('abc'); } }
  assert.same(new Foreign().at(-1), 'c');
});

QUnit.test('constructed receiver: a replacement has its own fields and methods', assert => {
  class Fields {
    value = 'abc';
    constructor() { return { value: [1, 2, 3] }; }
  }
  assert.same(new Fields().value.at(-1), 3);
  class Methods {
    value() { return 'abc'; }
    constructor() { return { value() { return [1, 2, 3]; } }; }
  }
  assert.same(new Methods().value().at(-1), 3);
  function External() {
    return { value() { return [1, 2, 3]; } };
  }
  withTemporaryProperty(Function('return this')(), 'ExternalConstructorForTest', External, () => {
    class Derived extends ExternalConstructorForTest {
      value() { return 'abc'; }
    }
    assert.same(new Derived().value().at(-1), 3);
  });
});

QUnit.test('constructed receiver: Reflect.construct keeps the target replacement', assert => {
  class Target {
    value = 'abc';
    constructor() { return { value: [1, 2, 3] }; }
  }
  class NewTarget { value = 'abc'; }
  assert.same(Reflect.construct(Target, []).value.at(-1), 3);
  assert.same(Reflect.construct(Target, [], NewTarget).value.at(-1), 3);
  // Exercise an existing namespace as well as the global spelling.
  class MethodTarget {
    value() { return 'abc'; }
    constructor() { return { value() { return [1, 2, 3]; } }; }
  }
  class MethodNewTarget {
    value() { return 'abc'; }
  }
  assert.same(reflectNamespace.construct(MethodTarget, []).value().at(-1), 3);
  assert.same(reflectNamespace.construct(MethodTarget, [], MethodNewTarget).value().at(-1), 3);
});
/* eslint-enable no-constructor-return -- end of replacement-constructor cases */
