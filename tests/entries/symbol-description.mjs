// Isolated processes exercise missing and broken native accessors before any core-js import.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, sep } from 'node:path';
import { promisify } from 'node:util';
import { runInNewContext } from 'node:vm';
import { restoreProperty } from '../helpers/restore-property.cjs';

const require = createRequire(import.meta.url);
const modes = {
  missing: 'delete Symbol.prototype.description;',
  broken: 'Object.defineProperty(Symbol.prototype, "description", { configurable: true, get() { return String(this.valueOf()).slice(7, -1); } });',
  registry: 'delete Symbol.prototype.description; delete Symbol.for; delete Symbol.keyFor;',
  rejected: 'delete Symbol.prototype.description; Object.defineProperty(process.versions, "v8", { value: "3.30" });',
  absent: 'globalThis.Symbol = undefined;',
  shim: 'globalThis.Symbol = undefined; require("core-js/es/symbol");',
};

if (process.argv[2] !== '--symbol-realm') {
  for (const mode of Object.keys(modes)) for (const flavor of ['global', 'pure']) {
    await promisify(execFile)(process.execPath, [import.meta.filename, '--symbol-realm', mode, flavor]);
  }
} else {
  const [mode, flavor] = process.argv.slice(3);
  const NativeSymbol = globalThis.Symbol;
  // The native control makes deletion or a broken getter observable independently of the helper.
  assert.equal(NativeSymbol('control').description, 'control');
  Function('require', modes[mode])(require);
  const before = globalThis.Symbol;
  const registered = before && before.for && before.for('');
  const previous = before && Object.getOwnPropertyDescriptor(before.prototype, 'description');
  const get = flavor === 'pure' ? require('@core-js/pure/es/symbol/instance/description') : require('core-js/es/symbol/instance/description');
  const S = flavor === 'pure' ? require('@core-js/pure/es/symbol') : require('core-js/es/symbol');
  if (mode === 'rejected') assert.equal(typeof S('control'), 'object', 'rejected native constructor uses the full shim');
  for (const value of [undefined, '', 'foo', ')', '\n', '\r\n', '\uD800', null, 12]) {
    const symbol = S(value);
    const expected = value === undefined ? undefined : String(value);
    assert.equal(get(symbol), expected, `${ mode }/${ flavor }: primitive ${ String(value) }`);
    assert.equal(get(Object(symbol)), expected, `${ mode }/${ flavor }: boxed ${ String(value) }`);
  }
  assert.equal(get(S()), undefined);
  // Observe the old registry symbol before Symbol.for can register it with the wrapper.
  // A full global shim does not retrofit symbols from the rejected constructor.
  if (registered && (mode !== 'rejected' || flavor === 'pure')) {
    assert.equal(get(registered), '', 'a registry symbol created before the wrapper');
  }
  assert.equal(get(S.for('')), '');
  assert.equal(get(S.for('registry')), 'registry');
  assert.equal(S.for('registry'), S.for('registry'));
  // eslint-disable-next-line sonarjs/inconsistent-function-call -- Symbol must reject constructor calls
  assert.throws(() => new S('x'), TypeError);
  assert.throws(() => S(NativeSymbol()), TypeError);
  for (const value of [null, undefined]) assert.throws(() => get(value), TypeError);
  let conversions = 0;
  assert.equal(get(S({ toString() {
    conversions++;
    return '';
  } })), '');
  assert.equal(conversions, 1);
  if (flavor === 'pure') {
    assert.equal(globalThis.Symbol, before, 'pure retains the global constructor');
    if (before) assert.deepEqual(Object.getOwnPropertyDescriptor(before.prototype, 'description'), previous, 'pure retains the global getter');
    for (const value of [undefined, '', 'own']) {
      const symbol = S('original');
      const boxed = Object(symbol);
      const inherited = Object.create(S.prototype);
      Object.setPrototypeOf(boxed, inherited);
      for (const [receiver, holder] of [[boxed, boxed], [boxed, inherited], [symbol, S.prototype]]) {
        const descriptor = Object.getOwnPropertyDescriptor(holder, 'description');
        let reads = 0;
        try {
          Object.defineProperty(holder, 'description', { configurable: true, get() {
            if (++reads === 2) delete holder.description;
            return value;
          } });
          assert.equal(get(receiver), value, 'own, inherited or prototype getter');
          assert.equal(reads, 1, 'one property read');
          assert.equal(get(receiver), value, 'a getter can delete itself');
          assert.equal(reads, 2, 'one read of the getter that deletes itself');
        } finally {
          restoreProperty(holder, 'description', descriptor);
        }
      }
      Object.setPrototypeOf(boxed, { description: value });
      assert.equal(get(boxed), value, 'inherited data property without Symbol.prototype');
      let reads = 0;
      const proxy = new Proxy(Object(S('original')), {
        get(target, key) {
          assert.equal(key, 'description');
          reads++;
          return value;
        },
        getPrototypeOf() { assert.fail('unexpected proxy prototype lookup'); },
        getOwnPropertyDescriptor() { assert.fail('unexpected proxy descriptor lookup'); },
      });
      assert.equal(get(proxy), value);
      assert.equal(reads, 1);
    }
    assert.equal(get({ description: 42 }), 42);
    assert.equal(get({}), undefined);
    if (mode === 'missing' || mode === 'registry') {
      const foreign = runInNewContext('delete Symbol.prototype.description; Object(Symbol("foreign"))');
      assert.equal(get(foreign), 'foreign', 'foreign boxed native symbol without an accessor');
      const detached = Object(S('detached'));
      Object.setPrototypeOf(detached, null);
      assert.equal(get(detached), 'detached', 'symbol branding does not depend on its prototype');
    }
    if (mode === 'missing') {
      const pureRoot = dirname(require.resolve('@core-js/pure/package.json')) + sep;
      for (const filename of Object.keys(require.cache)) {
        if (filename.startsWith(pureRoot)) delete require.cache[filename];
      }
      const secondSymbol = require('@core-js/pure/es/symbol');
      const secondDescription = require('@core-js/pure/es/symbol/instance/description');
      assert.notEqual(secondDescription, get, 'a second module instance was loaded');
      assert.equal(secondDescription(S('')), '', 'shared store survives module reloading');
      assert.equal(get(secondSymbol('')), '', 'both module instances share empty descriptions');
    }
    // A global polyfill loaded later shares empty-description bookkeeping with the pure wrapper.
    const empty = S('');
    require('core-js/es/symbol');
    assert.equal(get(empty), '');
    assert.equal(get(globalThis.Symbol('')), '');
  }
}
