// Exercise the frame handoff and the formatter karma-qunit uses for failed assertions.
import { deepEqual, match, notStrictEqual, strictEqual } from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { dump } from 'qunit';

const harness = new URL('../e2e-libs/harness/', import.meta.url);
const source = (await Promise.all(['shared.js', 'frame.js'].map(file => readFile(new URL(file, harness), 'utf8')))).join('\n');
for (const legacy of [false, true]) {
  let reads = 0;
  function getter() {
    reads++;
    throw new Error('diagnostic accessor');
  }
  const data = { count: 1, length: 1, get item() { return getter(); } };
  const node = { get nodeType() { return getter(); } };
  const tag = { [Symbol.toStringTag]: 'Date', amount: 42 };
  const symbol = Symbol('slot');
  Object.defineProperty(data, symbol, { get: getter, enumerable: true });
  let enumerations = 0;
  const actual = legacy ? data : new Proxy(data, {
    ownKeys(target) {
      if (++enumerations > 1) throw new Error('repeated enumeration');
      return Reflect.ownKeys(target);
    },
  });
  const builtins = { date: new Date(0), pattern: /ab/gi, error: new Error('detail') };
  function first() { /* diagnostic operand */ }
  function second() { /* diagnostic operand */ }
  if (legacy) for (const fn of [first, second]) {
    delete fn.name;
    Object.defineProperty(fn, 'toString', { get: getter });
  }
  const hiddenName = Object.defineProperty(() => 1, 'name', { get: getter });
  Object.defineProperty(hiddenName, 'length', { get: getter });
  const unary = { convert(value) { return value; } };
  const binary = { convert(left, right) { return left + right; } };
  const checks = [
    { label: 'missing', pass: false, difference: { path: '[extra]', missing: 'expected', pair: [{ actual, node, tag }, undefined] } },
    { label: 'manual', pass: false, actual: node, expected: builtins },
    { label: 'array', pass: false, difference: { pair: [[1], { 0: 1, length: 1 }] } },
    { label: 'function', pass: false, difference: { pair: [first, second] } },
    { label: 'arity', pass: false, difference: { pair: [unary.convert, binary.convert] } },
    { label: 'function name accessor', pass: false, actual: hiddenName, expected: '' },
  ];
  if (!legacy) {
    const partial = new Proxy(binary.convert, {
      getOwnPropertyDescriptor(target, key) {
        if (key === 'length') throw new Error('unavailable length');
        return Reflect.getOwnPropertyDescriptor(target, key);
      },
    });
    checks.push({ label: 'partial function', pass: false, actual: partial, expected: null });
  }
  const { promise, resolve } = Promise.withResolvers();
  const window = {
    E2E_CELL: { expected: checks.map(check => check.label), label: 'cell', timeout: 1000 },
    parent: { e2eFrameDone: (...args) => resolve(args) },
    e2eAfterRejections: queueMicrotask,
  };
  const E2E = { run: () => ({ checks }) };
  const setup = legacy ? 'Reflect = Object.getOwnPropertySymbols = undefined;\n' : '';
  runInNewContext(setup + source, { E2E, window, setTimeout, clearTimeout });
  data.count = 2;
  const [label, expected, , rows, reason] = await promise;
  strictEqual(reason, null);
  strictEqual(label, 'cell');
  deepEqual(expected, checks.map(check => check.label));
  const result = window.e2eCheckResult(rows[0]);
  strictEqual(result.expected, '<missing>');
  match(result.message, /\[extra\]/u);
  const output = dump.parse(result.actual);
  for (const field of ['item', 'nodeType']) match(output, new RegExp(`${ field }": "<accessor>"`, 'u'));
  match(output, /count": 1/u);
  match(output, /amount": 42/u);
  if (!legacy) match(output, /\[Symbol\(slot\)\]": "<accessor>"/u);
  match(dump.parse(window.e2eCheckResult(rows[1]).actual), /nodeType": "<accessor>"/u);
  const nativeOutput = dump.parse(window.e2eCheckResult(rows[1]).expected);
  match(nativeOutput, /1969|1970/u);
  match(nativeOutput, /\/ab\/gi/u);
  match(nativeOutput, /detail/u);
  const array = window.e2eCheckResult(rows[2]);
  match(dump.parse(array.actual), /\[\[Array\]\]/u);
  notStrictEqual(dump.parse(array.actual), dump.parse(array.expected));
  const functions = window.e2eCheckResult(rows[3]);
  match(dump.parse(functions.actual), /first/u);
  match(dump.parse(functions.expected), /second/u);
  const arity = window.e2eCheckResult(rows[4]);
  match(dump.parse(arity.actual), /length": 1/u);
  match(dump.parse(arity.expected), /length": 2/u);
  match(dump.parse(window.e2eCheckResult(rows[5]).actual), /\[\[Function\]\]/u);
  if (!legacy) match(dump.parse(window.e2eCheckResult(rows[6]).actual), /convert/u);
  strictEqual(reads, 0);
  strictEqual(enumerations, legacy ? 0 : 1);
}
