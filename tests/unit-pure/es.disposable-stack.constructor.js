import { STRICT } from '../helpers/constants.js';

import Symbol from '@core-js/pure/es/symbol';
import DisposableStack from '@core-js/pure/es/disposable-stack';
import SuppressedError from '@core-js/pure/es/suppressed-error';

QUnit.test('DisposableStack constructor', assert => {
  assert.isFunction(DisposableStack);
  assert.arity(DisposableStack, 0);
  assert.name(DisposableStack, 'DisposableStack');

  assert.true(new DisposableStack() instanceof DisposableStack);

  assert.same(DisposableStack.prototype.constructor, DisposableStack);

  // eslint-disable-next-line sonarjs/inconsistent-function-call -- required for testing
  assert.throws(() => DisposableStack(), 'throws w/o `new`');
});

QUnit.test('DisposableStack#dispose', assert => {
  assert.isFunction(DisposableStack.prototype.dispose);
  assert.arity(DisposableStack.prototype.dispose, 0);
  assert.name(DisposableStack.prototype.dispose, 'dispose');
  assert.nonEnumerable(DisposableStack.prototype, 'dispose');
});

QUnit.test('DisposableStack#use', assert => {
  assert.isFunction(DisposableStack.prototype.use);
  assert.arity(DisposableStack.prototype.use, 1);
  assert.name(DisposableStack.prototype.use, 'use');
  assert.nonEnumerable(DisposableStack.prototype, 'use');

  let result = '';
  const stack = new DisposableStack();
  const resource = {
    [Symbol.dispose]() {
      result += '1';
      assert.same(this, resource);
      assert.same(arguments.length, 0);
    },
  };

  assert.same(stack.use(resource), resource);
  assert.same(stack.dispose(), undefined);
  assert.same(result, '1');
});

QUnit.test('DisposableStack#adopt', assert => {
  assert.isFunction(DisposableStack.prototype.adopt);
  assert.arity(DisposableStack.prototype.adopt, 2);
  assert.name(DisposableStack.prototype.adopt, 'adopt');
  assert.nonEnumerable(DisposableStack.prototype, 'adopt');

  let result = '';
  const stack = new DisposableStack();
  const resource = {};

  assert.same(stack.adopt(resource, function (arg) {
    result += '1';
    if (STRICT) assert.same(this, undefined);
    assert.same(arguments.length, 1);
    assert.same(arg, resource);
  }), resource);

  assert.same(stack.dispose(), undefined);
  assert.same(result, '1');
});

QUnit.test('DisposableStack#defer', assert => {
  assert.isFunction(DisposableStack.prototype.defer);
  assert.arity(DisposableStack.prototype.defer, 1);
  assert.name(DisposableStack.prototype.defer, 'defer');
  assert.nonEnumerable(DisposableStack.prototype, 'defer');

  let result = '';
  const stack = new DisposableStack();

  assert.same(stack.defer(function () {
    result += '1';
    if (STRICT) assert.same(this, undefined);
    assert.same(arguments.length, 0);
  }), undefined);

  assert.same(stack.dispose(), undefined);
  assert.same(result, '1');
});

QUnit.test('DisposableStack#move', assert => {
  assert.isFunction(DisposableStack.prototype.move);
  assert.arity(DisposableStack.prototype.move, 0);
  assert.name(DisposableStack.prototype.move, 'move');
  assert.nonEnumerable(DisposableStack.prototype, 'move');

  let result = '';
  const stack1 = new DisposableStack();

  stack1.defer(() => result += '2');
  stack1.defer(() => result += '1');

  const stack2 = stack1.move();

  assert.true(stack1.disposed);

  stack2.dispose();

  assert.same(result, '12');
});

QUnit.test('DisposableStack#@@dispose', assert => {
  assert.same(DisposableStack.prototype[Symbol.dispose], DisposableStack.prototype.dispose);
});

QUnit.test('DisposableStack#@@toStringTag', assert => {
  assert.same(DisposableStack.prototype[Symbol.toStringTag], 'DisposableStack', '@@toStringTag');
});

QUnit.test('DisposableStack', assert => {
  let result1 = '';
  const stack1 = new DisposableStack();

  stack1.use({ [Symbol.dispose]: () => result1 += '6' });
  stack1.adopt({}, () => result1 += '5');
  stack1.defer(() => result1 += '4');
  stack1.use({ [Symbol.dispose]: () => result1 += '3' });
  stack1.adopt({}, () => result1 += '2');
  stack1.defer(() => result1 += '1');

  assert.false(stack1.disposed);
  assert.same(stack1.dispose(), undefined);
  assert.same(result1, '123456');
  assert.true(stack1.disposed);
  assert.same(stack1.dispose(), undefined);

  let result2 = '';
  const stack2 = new DisposableStack();
  let error2;

  stack2.use({ [Symbol.dispose]: () => result2 += '6' });
  stack2.adopt({}, () => { throw new Error(5); });
  stack2.defer(() => result2 += '4');
  stack2.use({ [Symbol.dispose]: () => result2 += '3' });
  stack2.adopt({}, () => result2 += '2');
  stack2.defer(() => result2 += '1');

  try {
    stack2.dispose();
  } catch (error2$) {
    error2 = error2$;
  }

  assert.same(result2, '12346');
  assert.true(error2 instanceof Error);
  assert.same(error2.message, '5');

  let result3 = '';
  const stack3 = new DisposableStack();
  let error3;

  stack3.use({ [Symbol.dispose]: () => result3 += '6' });
  stack3.adopt({}, () => { throw new Error(5); });
  stack3.defer(() => result3 += '4');
  stack3.use({ [Symbol.dispose]: () => { throw new Error(3); } });
  stack3.adopt({}, () => result3 += '2');
  stack3.defer(() => result3 += '1');

  try {
    stack3.dispose();
  } catch (error3$) {
    error3 = error3$;
  }

  assert.same(result3, '1246');
  assert.true(error3 instanceof SuppressedError);
  assert.same(error3.error.message, '5');
  assert.same(error3.suppressed.message, '3');
});
