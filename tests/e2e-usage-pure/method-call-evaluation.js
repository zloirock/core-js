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
