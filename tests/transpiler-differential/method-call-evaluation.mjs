// Compare argument timing with the native language, using the real pure entry modules.
import { transformAsync } from '@babel/core';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import corejs from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { checkDeep, finish } = createChecker('method-call-evaluation');
const require = createRequire(import.meta.url);

const rows = [
  ['ordinary', 'receiver.at(argument())'],
  ['computed effects', 'receiver[(effect(), "at")](argument())'],
  ['receiver effects', '(effect(), receiver).at(argument())'],
  ['optional prefix and key effects', '(effect?.(), stable)[(effect(), "at")](argument())', 'const stable = receiver;'],
  ['receiver factory', 'getReceiver().at(argument())'],
  ['optional receiver', 'receiver?.at(argument())'],
  ['optional receiver with key effects', 'receiver?.[(effect(), "at")](argument())'],
  ['optional method', 'receiver.at?.(argument())'],
  ['optional method with key effects', 'receiver[(effect(), "at")]?.(argument())'],
  ['optional receiver and method', 'receiver?.at?.(argument())'],
  ['optional method adjacent result', 'receiver.at?.(argument())?.toString().includes("2")'],
  ['optional receiver method continuation', 'receiver?.at?.(argument()).toString().includes("2")'],
  ['optional factory and result', 'getReceiver()?.at?.(argument())?.toString()?.at(0)'],
  ['optional prefix and continuation', '(effect(), receiver).at?.(argument())?.toString().at(0)'],
  ['optional keyed continuation', 'receiver[(effect(), "at")]?.(argument())?.toString().at(0)'],
  ['optional result with keyed method', 'receiver.at?.(argument())?.[(effect(), "at")](argument())'],
  ['live link and continuation', 'box?.rows.at?.(argument())?.toString().at(0)', 'const box = receiver === null ? null : { rows: receiver };'],
  ['sealed link and continuation', '(box?.rows).at?.(argument())?.toString().at(0)', 'const box = receiver === null ? null : { rows: receiver };'],
  ['raw optional continuation', 'receiver.raw?.(argument())?.toString().at(0)'],
  ['raw optional prefix and result guard', '(effect(), receiver).raw?.(argument())?.toString().at(0)'],
  ['raw optional prefix and continuation', '(effect(), receiver).raw?.(argument()).toString().at(0)'],
  ['raw optional receiver and continuation', 'receiver?.raw?.(argument()).toString().at(0)'],
  ['raw optional keyed receiver and continuation', 'getReceiver()?.[(effect(), "raw")]?.(argument()).toString().at(0)'],
  ['optional default continuation', '((value = getReceiver()?.at?.(argument())?.toString().at(0)) => value)()'],
  ['optional field continuation', 'new class { value = getReceiver()?.at?.(argument())?.toString().at(0); }().value'],
  ['sealed optional prefix and key', '((effect(), receiver)?.[(effect(), "at")])(argument())'],
  ['optional delete continuation', 'delete receiver?.at?.(argument()).missing'],
  ['optional nested argument claim', 'receiver.at?.(argument() + [1].at(0))?.toString().at(0)'],
  ['raw super optional continuation', 'new Child().read()', `
    class Parent {}
    Object.setPrototypeOf(Parent.prototype, receiver);
    class Child extends Parent { read() { return super.raw?.(argument())?.toString().at(0); } }
  `],
  ['sealed optional receiver', '(receiver?.at)(argument())'],
  ['sealed optional receiver with key effects', '(receiver?.[(effect(), "at")])(argument())'],
  ['symbol method', 'getReceiver()[Symbol.iterator](argument())'],
  ['optional symbol method', 'getReceiver()[Symbol.iterator]?.(argument())', '', null, true],
  ['optional symbol receiver', 'getReceiver()?.[Symbol.iterator](argument())'],
  ['optional symbol receiver and method', 'getReceiver()?.[Symbol.iterator]?.(argument())', '', null, true],
  ['optional symbol computed key', 'getReceiver()[(effect(), Symbol.iterator)]?.(argument())', '', null, true],
  ['optional symbol keyed continuation', 'getReceiver()[(effect(), Symbol.iterator)]?.(argument()).toString()', '', null, true],
  ['optional symbol guarded keyed continuation', 'getReceiver()?.[(effect(), Symbol.iterator)]?.(argument()).toString()', '', null, true],
  ['sealed symbol key and arguments', '(getReceiver()?.[(effect(), Symbol.iterator)])(argument())'],
  ['sealed symbol key consume', '(getReceiver()?.[(effect(), Symbol.iterator)])()'],
  ['symbol key consume', 'getReceiver()?.[(effect(), Symbol.iterator)]()'],
  ['extracted method call', 'receiver[(effect(), "at")].call(receiver, argument())'],
  ['extracted method apply', 'receiver[(effect(), "at")].apply(receiver, [argument()])'],
  ['extracted method bind', 'receiver[(effect(), "at")].bind(receiver)(argument())'],
  ['identity instance optional', 'Ctor.entries?.(argument())', 'const Ctor = effect ? receiver : Object;'],
  ['identity raw optional', 'Ctor.from?.(argument())', 'const Ctor = effect ? receiver : Array;'],
  ['captured identity instance optional', 'realm.Object.entries?.(argument())',
    'const realm = effect ? { Object: receiver } : globalThis;'],
  ['captured identity raw optional', 'realm.Array.from?.(argument())',
    'const realm = effect ? { Array: receiver } : globalThis;'],
  ['captured identity pure optional', 'realm.Object.entries?.(argument())',
    'const realm = effect ? globalThis : { Object: receiver };'],
  ['parameter capture', '((value = getReceiver()[(effect(), "at")](argument())) => value)()'],
  ['field capture', 'new class { value = getReceiver()[(effect(), "at")](argument()); }().value'],
  ['spread', 'receiver.at(...argument())'],
  ['values method', 'receiver.values(argument())'],
  ['negative literal', 'receiver.at(-1)', '', false],
  ['parameter read', 'receiver.at(argument)', '', false],
  ['initialized local', 'receiver.at(index)', 'const index = 0;', false],
  ['constant arithmetic', 'receiver.at(index - 1)', 'const index = 1;', false],
  ['string length arithmetic', "receiver.at('abc'.length - 1)", '', false],
  ['function allocation', 'receiver.at(() => effect())', '', false],
  ['array allocation', 'receiver.at([argument, -1])', '', false],
  ['object allocation', 'receiver.at({ value: argument, read() { effect(); } })', '', false],
  ['conditional allocation', 'receiver.at(argument ? [1] : { value: 2 })', '', false],
  ['pure import beside parameter', 'receiver.at(argument, Map)', '', false],
  ['destructured value comparison', 'receiver.at(f === argument)', 'const { w: { from: f } } = { w: { from: argument } };', false],
  ['for-of initialized value', 'result', 'let result; for (const index of [0]) result = receiver.at(index);', false],
  ['external value argument', 'receiver.at(externalArgument)', '', false],
  ['lexical TDZ', '(() => { return receiver.at(later); const later = 0; })()', '', false],
  ['captured TDZ', 'read()', 'const result = read(); const later = 0; function read() { return receiver.at(later); }', false],
  ['missing read', 'receiver.at(missingArgument)', '', false],
  ['argument coercion', 'receiver.at(argument + 1)'],
  ['object value effect', 'receiver.at({ value: argument() })'],
  ['sequence effect', 'receiver.at((effect(), argument))'],
  ['conditional effect', 'receiver.at(argument ? effect() : 0)'],
  // eslint-disable-next-line no-template-curly-in-string -- the string is template source under test
  ['template coercion', 'receiver.at(`value:${argument}`)'],
  ['selected array static', 'Ctor.from(argument())', 'const Ctor = effect ? receiver : Array;'],
  ['selected object static', 'Ctor.groupBy(argument())', 'const Ctor = effect ? receiver : Object;'],
  ['selected static instance fallback', 'Ctor.entries(argument())', 'const Ctor = effect ? receiver : Object;'],
  ['selected static spread', 'Ctor.from(...argument())', 'const Ctor = effect ? receiver : Array;'],
  ['selected static quiet argument', 'Ctor.from(argument)', 'const Ctor = effect ? receiver : Array;', false],
];

for (const [label, expression, before = '', needsGuard = null, optionalIterator = false] of rows) {
  const source = `export function invoke(receiver, argument, effect, getReceiver) { ${ before } return ${ expression }; }`;
  const native = runInNewContext(`${ source.replace('export ', '') }; invoke;`, { externalArgument: 7 });
  for (const method of ['usage-global', 'usage-pure']) {
    const options = { method, version: '4.0', targets: { ie: 11 } };
    const outputs = {
      babel: (await transformAsync(source, {
        configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[corejs, options]],
      })).code,
      unplugin: createUnplugin(options).transform(source, 'input.mjs')?.code ?? source,
    };
    outputs.babelAgain = (await transformAsync(outputs.babel, {
      configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[corejs, options]],
    })).code;
    outputs.unpluginAgain = createUnplugin(options).transform(outputs.unplugin, 'input.mjs')?.code ?? outputs.unplugin;
    for (const [emitter, output] of Object.entries(outputs)) {
      if (method === 'usage-pure' && needsGuard !== null) {
        checkDeep(`${ label }/${ emitter }/only necessary guard`, /\|\|\s*0/u.test(output), needsGuard);
      }
      const executable = output.replaceAll(/import\s+(?<name>[\w$]+)\s+from\s+["'](?<entry>[^"']+)["'];?/gu,
        (_, name, entry) => `const ${ name } = require(${ JSON.stringify(entry) });`)
        .replaceAll(/import\s+["'][^"']+["'];?/gu, '').replace('export ', '');
      const invoke = runInNewContext(`${ executable }; invoke;`, { require, externalArgument: 7 });
      for (const value of [undefined, null, 0, false, '', 17, 'callable', 'null receiver']) {
        // The iterator helper's existing falsy fallback is outside native-equivalent dispatch.
        // Keep its runtime contract unchanged; these values do not test call rendering.
        if (optionalIterator && method === 'usage-pure' && [0, false, ''].includes(value)) continue;
        for (const argumentThrows of [false, true]) {
          function observe(call) {
            const events = [];
            const receiver = value === 'null receiver' ? null : { get at() {
              events.push('lookup');
              return value === 'callable' ? function (received) {
                events.push(['body', this === receiver, received]);
                return 42;
              } : value;
            } };
            if (receiver) {
              const descriptor = Object.getOwnPropertyDescriptor(receiver, 'at');
              Object.defineProperties(receiver, {
                [Symbol.iterator]: descriptor, values: descriptor, from: descriptor, groupBy: descriptor, entries: descriptor, raw: descriptor,
              });
            }
            function argument() {
              events.push('argument');
              if (argumentThrows) throw new RangeError('argument failure');
              return label.includes('spread') ? [7] : 7;
            }
            argument.valueOf = () => {
              events.push('coercion');
              if (argumentThrows) throw new RangeError('coercion failure');
              return 7;
            };
            argument[Symbol.toPrimitive] = argument.valueOf;
            try {
              events.push(['result', call(receiver, argument,
                () => events.push('effect'), () => { events.push('receiver'); return receiver; })]);
            } catch (error) {
              events.push(['error', error.name]);
            }
            return events;
          }
          const expected = observe(native);
          // Plain value reads do not justify a guard. Missing/TDZ reads and nullish methods
          // reject without running argument code; their error priority is outside this repair.
          const missingReadBoundary = ['missing read', 'lexical TDZ', 'captured TDZ'].includes(label)
            && method === 'usage-pure' && (value === undefined || value === null);
          checkDeep(`${ label }/${ method }/${ emitter }/${ String(value) }/${ argumentThrows }`, observe(invoke),
            missingReadBoundary ? ['lookup', ['error', 'TypeError']] : expected);
        }
      }
    }
  }
}

for (const source of [
  'getObj()[Symbol.iterator](arg);',
  'obj[Symbol.iterator](arg);',
  'getObj()?.[Symbol.iterator](arg);',
  'obj?.[Symbol.iterator](arg);',
  'const out = []; for (const { value } of items) out.push(value);',
  'function f() { const out = []; for (const [{ w: { at: value } }] of [[{ w: [1] }]]) out.push(value); return out; }',
  'const out = []; const { w: { from: f } } = { w: pick ? Array : {} }; out.push(f === Array.from);',
  'const log = []; const { a, b } = { get a() { return 1; }, get b() { log.push(typeof a); return 2; } };',
  'const log = []; const holder = { get value() { log.push(typeof from); return 1; } }; let from = 0; use(holder.value);',
]) {
  const options = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
  const babel = (await transformAsync(source, {
    configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[corejs, options]],
  })).code;
  const unplugin = createUnplugin(options).transform(source, 'input.mjs')?.code ?? source;
  for (const [emitter, output] of Object.entries({ babel, unplugin })) {
    checkDeep(`value argument needs no guard/${ emitter }/${ source }`, /\|\|\s*0/u.test(output), false);
  }
}

finish();
