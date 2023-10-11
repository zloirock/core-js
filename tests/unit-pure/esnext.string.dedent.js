import Symbol from '@core-js/pure/es/symbol';
import cooked from '@core-js/pure/full/string/cooked';
import dedent from '@core-js/pure/full/string/dedent';
import freeze from '@core-js/pure/es/object/freeze';

QUnit.test('String.dedent', assert => {
  assert.isFunction(dedent);
  assert.arity(dedent, 1);
  assert.name(dedent, 'dedent');

  assert.same(dedent`
    qwe
    asd
    zxc
  `, 'qwe\nasd\nzxc', '#1');

  assert.same(dedent`
     qwe
    asd
     zxc
  `, ' qwe\nasd\n zxc', '#2');

  assert.same(dedent`
    qwe
    asd
   ${ ' zxc' }
  `, ' qwe\n asd\n zxc', '#3');

  assert.same(dedent({ raw: freeze(['\n  qwe\n  ']) }), 'qwe', '#4');
  assert.same(dedent({ raw: freeze(['\n  qwe', '\n   ']) }, 1), 'qwe1', '#5');

  assert.same(dedent(cooked)`
     qwe
    asd
     zxc
  `, ' qwe\nasd\n zxc', '#6');

  const tag = (it => it)`
    abc
  `;

  assert.same(dedent(tag), dedent(tag), '#7');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => dedent({ raw: freeze(['\n', Symbol('dedent test'), '\n']) }), TypeError, 'throws on symbol');
  }

  assert.throws(() => dedent([]), TypeError, '[]');
  assert.throws(() => dedent(['qwe']), TypeError, '[qwe]');
  assert.throws(() => dedent({ raw: freeze([]) }), TypeError, 'empty tpl');
  assert.throws(() => dedent({ raw: freeze(['qwe']) }), TypeError, 'wrong start');
  assert.throws(() => dedent({ raw: freeze(['\n', 'qwe']) }), TypeError, 'wrong start');
  assert.throws(() => dedent({ raw: freeze(['\n  qwe', 5, '\n   ']) }, 1, 2), TypeError, 'wrong part');
  assert.throws(() => dedent([undefined]), TypeError);
  assert.throws(() => dedent(null), TypeError);
});
