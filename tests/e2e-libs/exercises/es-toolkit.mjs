// es-toolkit, the modern replacement for lodash - a flat library of small functions, each written
// against the built-ins of the language as it is now rather than against a floor, and so a library
// that reaches for polyfills from its own frames at nearly every turn. Every expected value below is
// DEFINED by the input, not observed from a run.
//
// Its reason is the SURFACE axis. Measured on the babel-plugin cells against the union of the seven
// reference baselines before it, `usage-global` adds eleven entries and `usage-pure` thirteen. The
// checks assert ten of the pure ones, and each is driven by the one function that makes its call:
// `pad` pads with `padStart` and then `padEnd`, `trimStart` and `trimEnd` without a character set are
// the built-ins themselves, `isLength` is `Number.isSafeInteger`, `isWeakSet` an `instanceof
// WeakSet`, `deepFreeze` freezes with `Object.freeze` and skips with `Object.isFrozen`, `clone` asks
// every error whether it is an `AggregateError`, and `cloneDeep` hands an error to `structuredClone`.
// A `Map`'s `entries` is driven but not asserted - `isEqual` reaches it only after reading the tag,
// which a pure `Map` does not carry on the floor. The last two, `Promise.race` and
// `Symbol.toStringTag`, are injected from `withTimeout` and the compat `isPlainObject`, which the
// main entry brings into the graph and nothing here calls.
//
// Nothing here may import `withTimeout`, `timeout`, `delay` or anything else that pulls in the
// library's `TimeoutError` or `AbortError`. Both extend `DOMException` while their module bodies run,
// and the library reads it through `globalThis_`, a global alias imported from another module - which
// neither provider sees, since each analyses one module at a time. IE11's `DOMException` is no
// constructor, so neither class can be built there; the polyfill that would replace it reaches
// `usage-global` only as a dependency of `structuredClone`, later in the bundle, and `usage-pure` not
// at all. No local tier answers that read the way IE11 does - node hands out a constructible
// `DOMException` and the vm realms have none, so the library extends the one or falls back to `Error`.
import {
  clone, cloneDeep, deepFreeze, isEqual, isLength, isWeakSet, pad, trimEnd, trimStart,
} from 'es-toolkit';
import { checker } from './checks.mjs';

// a shape a copy does not carry reddens its own check instead of taking the file down
function at(value, key) {
  return value?.[key];
}

// a write into a frozen object throws in strict code, which every module is
function refused(write) {
  try {
    write();
    return false;
  } catch (error) {
    return error instanceof TypeError;
  }
}

export function run() {
  const { checks, check } = checker();

  // --- strings: `padStart` takes the left half of the padding, `padEnd` the rest ---
  check('pad', pad('abc', 8, '_-'), '_-abc_-_');
  check('trim_start', trimStart('  both  '), 'both  ');
  check('trim_end', trimEnd('  both  '), '  both');

  // --- predicates: each asked both ways, so a constant answer reddens ---
  check('is_length', [isLength(9007199254740991), isLength(9007199254740992), isLength(-1), isLength(1.5)],
    [true, false, false, false]);
  check('is_weak_set', [isWeakSet(new WeakSet()), isWeakSet(new Set()), isWeakSet({})], [true, false, false]);
  // `isEqual` over two maps is deliberately NOT asserted: it reads the tag, and a pure `Map` carries
  // none on the floor (see AGENTS.md). Driving it still injects the `entries` the walk would use
  isEqual(new Map([['a', [1]]]), new Map([['a', [2]]]));

  // --- freezing: the nested object and the array inside it refuse writes too, which a shallow
  // freeze would not do ---
  const frozen = deepFreeze({ nested: { list: [1] } });
  const nested = at(frozen, 'nested');
  // the two reads after the writes are what tells a refusal from an object that was never there:
  // a missing one would throw at the write too, and `refused` would report the throw as a refusal
  const writes = [
    refused(() => { nested.extra = 1; }),
    refused(() => { nested.list.push(2); }),
    at(nested, 'extra'),
    at(at(nested, 'list'), 'length'),
  ];
  check('deep_freeze', writes, [true, true, undefined, 1]);

  // --- cloning errors. The cause is assigned rather than passed to the constructor, so the options
  // bag `clone` builds for its copy is the library's, not this module's ---
  const cause = new Error('root');
  const error = new Error('boom');
  error.cause = cause;
  // `clone(error)` itself is driven but not asserted on its message: the copy comes from the
  // constructor on the error's own prototype, and IE11 reads `(message, options)` as JScript's
  // `(number, description)` (see AGENTS.md). What it answers about IDENTITY holds everywhere
  const copy = clone(error);
  check('clone_error', [copy !== error, copy instanceof Error, at(copy, 'cause') === cause], [true, true, true]);
  const aggregate = new AggregateError([error], 'many');
  const aggregateCopy = clone(aggregate);
  const errors = at(aggregateCopy, 'errors');
  check('clone_aggregate_error', [aggregateCopy !== aggregate, aggregateCopy instanceof AggregateError,
    at(aggregateCopy, 'message'), at(errors, 'length'), at(errors, 0) === error], [true, true, 'many', 1, true]);
  // deep: the cause is a copy as well
  const failure = at(cloneDeep({ failure: error }), 'failure');
  check('clone_deep_error', [failure !== error, failure instanceof Error, at(failure, 'message'),
    at(failure, 'cause') !== cause, at(at(failure, 'cause'), 'message')], [true, true, 'boom', true, 'root']);

  return { checks };
}
