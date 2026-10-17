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

