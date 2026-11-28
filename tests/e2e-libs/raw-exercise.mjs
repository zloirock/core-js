import { basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { types } from 'node:util';
import { runWithDeadline } from './deadline.mjs';
import { captureChecks, checkResultProblem, checkRows, renderDifference } from './diagnostics.mjs';
import { cachedProjection, collectionInfo, collectionValues, deepEqual, enumerableKeys, isEmulatedSymbol } from './exercises/checks.mjs';

const arrayKind = Symbol('array');
const collectionKind = Symbol('collection kind');
const inaccessibleTag = Symbol('unreadable toStringTag');
const unavailableSnapshot = Symbol('unavailable snapshot');
const accessor = Symbol('accessor');
const operandKind = Symbol('operand kind');
const operandValue = Symbol('operand value');
const RUN_DEADLINE_MS = 60_000;
const CHECK_FLOOR = 520;

export function assertRawCheckFloor(count, scoped = false) {
  const minimum = scoped ? 1 : CHECK_FLOOR;
  if (count < minimum) throw new Error(`raw exercise run compared ${ count } checks, under the floor of ${ minimum }`);
}

export function rawChecks(target, { repeat = false, timeout = RUN_DEADLINE_MS } = {}) {
  const name = basename(target);
  return runWithDeadline(import.meta.url, 'runRaw', [target, name, repeat], { ms: timeout, what: `${ name } run()` });
}

// Comparison and formatting stay in the child, since actual values may contain functions or symbols.
export async function runRaw(target, name, repeat, beforeRepeat) {
  const functions = new WeakMap();
  const checks = await oneRun(target, name, functions);
  if (repeat) {
    const first = checks.map(check => ({
      label: check.label, pass: check.pass, report: check.report,
      actual: snapshotCheckValue(check, 'actual'),
      expected: snapshotCheckValue(check, 'expected'),
    }));
    beforeRepeat();
    assertDeterministic(name, first, await oneRun(target, name, functions));
  }
  return checkRows(checks.map(check => check.report));
}

async function oneRun(target, name, functions) {
  const mod = await import(pathToFileURL(target).href);
  if (typeof mod.run !== 'function') throw new Error(`${ name } does not export run()`);
  const checks = captureChecks(await mod.run());
  const problem = checkResultProblem(checks);
  if (problem) throw new Error(`${ name }: ${ problem }`);
  if (!checks.length) throw new Error(`${ name } returned no checks`);
  // Capture every failure before replay can read a live getter or mutate an operand.
  for (const check of checks) {
    const report = { label: check.label, pass: check.pass };
    check.report = report;
    if (check.pass) continue;
    const { difference } = check;
    const pair = difference?.pair;
    const copies = new WeakMap();
    if (Array.isArray(pair)) {
      const { path, missing } = difference;
      const operands = [pair[0], pair[1]];
      report.difference = { path, missing, pair: operands.map(value => snapshotOperand(value, copies, functions)) };
    } else {
      report.actual = snapshotOperand(check.actual, copies, functions);
      report.expected = snapshotOperand(check.expected, copies, functions);
    }
  }
  return checks;
}

function snapshotCheckValue(check, key) {
  try {
    return snapshotValue(check[key], { copies: new WeakMap(), project: cachedProjection(), effects: 0, failed: !check.pass });
  } catch (error) {
    // Preserve the comparison's diagnostic when a failed check cannot be copied.
    if (check.pass) throw error;
    return unavailableSnapshot;
  }
}

function ownArrayIndices(value, length, after) {
  return Object.getOwnPropertyNames(value).filter(key => String(key >>> 0) === key && +key < length && +key > after);
}

function snapshotArrayIndices(array, length, copy, state) {
  if (types.isProxy(array)) {
    // A proxy can hide an own index from ownKeys while exposing it through a descriptor.
    for (let index = 0; index < length; index++) {
      if (Object.hasOwn(array, index)) copy[index] = snapshotField(array, index, state);
    }
    return;
  }

  // Ordinary arrays enumerate own indices in order. An accessor or nested
  // snapshot can fill a gap. Bound the total probes of unlisted slots between enumerations.
  let index = -1;
  let keys = ownArrayIndices(array, length, index);
  let offset = 0;
  let probesLeft = keys.length;
  let refresh = false;
  for (;;) {
    const listed = keys[offset] === undefined ? length : +keys[offset];
    const gap = listed - index - 1;
    if (refresh && gap > probesLeft) {
      keys = ownArrayIndices(array, length, index);
      offset = 0;
      probesLeft = keys.length;
      refresh = false;
      continue;
    }
    index = refresh && gap > 0 ? index + 1 : listed;
    if (index === length) return;
    if (index === listed) offset++;
    else probesLeft--;
    const descriptor = Object.getOwnPropertyDescriptor(array, index);
    if (!descriptor) continue;
    const before = state.effects;
    if (!Object.hasOwn(descriptor, 'value')) state.effects++;
    copy[index] = snapshotField(array, index, state);
    refresh ||= before !== state.effects;
  }
}

function snapshotField(value, key, state) {
  let field;
  try {
    field = value[key];
  } catch (error) {
    if (key === Symbol.toStringTag) return inaccessibleTag;
    if (state.failed) return unavailableSnapshot;
    throw error;
  }
  return snapshotValue(field, state);
}

// Reflection on ordinary records and arrays with data properties runs no user code.
// A proxy, custom prototype or toJSON projection can change enclosing array slots.
function mayRunUserCode(value) {
  if (value === null || value === undefined) return false;
  const object = Object(value);
  if (types.isProxy(object)) return true;
  if (object === value) {
    const prototype = Object.getPrototypeOf(object);
    if (prototype !== null && prototype !== Object.prototype && prototype !== Array.prototype) return true;
  }
  return 'toJSON' in object;
}

// Compare the observed values even when the second run mutates an object returned by the first.
// Use the exercise's toJSON projection and keep sparse slots and opaque values (e.g. symbols).
function snapshotValue(raw, state) {
  if (mayRunUserCode(raw)) state.effects++;
  const { copies, project } = state;
  const value = project(raw);
  if (!value || typeof value !== 'object') return value === 0 ? 0 : value;
  if (isEmulatedSymbol(value)) return value;
  if (copies.has(value)) return copies.get(value);
  const array = Array.isArray(value);
  const length = array ? value.length : undefined;
  const properties = Object.create(null);
  const collection = !array && collectionInfo(value);
  const entries = collection ? [] : null;
  // Keep ordered contents separate from the collection's own enumerable properties.
  const copy = entries ? { [collectionKind]: collection.isMap ? 'Map' : 'Set', entries, properties } : properties;
  copies.set(value, copy);
  if (array) {
    // A proxy can report a length below one of its enumerable indices. An Array
    // copy would grow while recording that key and lose the observed length.
    properties[arrayKind] = true;
    properties.length = length;
    snapshotArrayIndices(value, length, copy, state);
  }
  if (entries) {
    state.effects++;
    for (const entry of collectionValues(collection)) entries.push(snapshotValue(entry, state));
  }
  for (const key of enumerableKeys(value, length)) {
    if (!types.isProxy(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !Object.hasOwn(descriptor, 'value')) state.effects++;
    }
    Object.defineProperty(properties, key, { enumerable: true, value: snapshotField(value, key, state) });
  }
  return copy;
}

// The checker already read these operands. Copy data descriptors without projecting
// them again or invoking accessors. Keep the graph independent of diagnostic formatting.
function snapshotOperand(value, copies, functions) {
  const callable = typeof value === 'function';
  if (!value || typeof value !== 'object' && !callable) return value;
  if (copies.has(value)) return copies.get(value);
  const copy = {};
  copies.set(value, copy);
  try {
    const array = Array.isArray(value);
    const error = Error.isError ? Error.isError(value) : types.isNativeError(value);
    if (callable) {
      // Distinct functions can have identical descriptors. Keep their identity across both runs.
      if (!functions.has(value)) functions.set(value, Symbol('function'));
      copy[operandKind] = functions.get(value);
    } else if (array) copy[operandKind] = 'Array';
    else if (error) {
      copy[operandKind] = 'Error';
      // Built-in error names live on the prototype; a subclass can override name with a getter.
      const seen = new Set();
      for (let proto = value; proto && !seen.has(proto); proto = Object.getPrototypeOf(proto)) {
        const name = Object.getOwnPropertyDescriptor(proto, 'name');
        if (name) {
          copy[operandValue] = Object.hasOwn(name, 'value') ? snapshotOperand(name.value, copies, functions) : accessor;
          break;
        }
        seen.add(proto);
      }
    } else if (types.isMap(value) || types.isSet(value)) {
      const isMap = types.isMap(value);
      copy[operandKind] = isMap ? 'Map' : 'Set';
      const entries = copy[operandValue] = [];
      if (isMap) Map.prototype.forEach.call(value, (item, key) => {
        entries.push([snapshotOperand(key, copies, functions), snapshotOperand(item, copies, functions)]);
      });
      else Set.prototype.forEach.call(value, item => entries.push(snapshotOperand(item, copies, functions)));
    } else if (types.isAnyArrayBuffer(value)) {
      copy[operandKind] = types.isSharedArrayBuffer(value) ? 'SharedArrayBuffer' : 'ArrayBuffer';
      try {
        copy[operandValue] = new Uint8Array(value).slice();
      } catch {
        // Detached buffers have no readable bytes but can still have own properties.
        copy[operandValue] = unavailableSnapshot;
      }
    } else if (types.isDate(value)) {
      copy[operandKind] = 'Date';
      copy[operandValue] = Date.prototype.getTime.call(value);
    } else if (types.isRegExp(value)) {
      // The clone retains the native pattern and flags and discards instance overrides.
      copy[operandKind] = 'RegExp';
      copy[operandValue] = structuredClone(value).toString();
    }
    for (const key of Reflect.ownKeys(value)) {
      if (error && key === 'stack') continue;
      let field;
      try {
        field = Object.getOwnPropertyDescriptor(value, key);
      } catch {
        Object.defineProperty(copy, key, { enumerable: true, value: unavailableSnapshot });
        continue;
      }
      const arrayField = array && typeof key === 'string' && (key === 'length' || String(key >>> 0) === key && key !== '4294967295');
      const errorField = error && (key === 'message' || key === 'name' || key === 'cause' || key === 'errors');
      const functionField = callable && (key === 'name' || key === 'length');
      if (field && (field.enumerable || arrayField || errorField || functionField)) {
        const observed = Object.hasOwn(field, 'value') ? snapshotOperand(field.value, copies, functions) : accessor;
        Object.defineProperty(copy, key, { enumerable: true, value: observed });
      }
    }
    return copy;
  } catch {
    copies.set(value, unavailableSnapshot);
    return unavailableSnapshot;
  }
}

function assertDeterministic(name, first, second) {
  function notDeterministic(detail) {
    return new Error(`${ name } is not deterministic: ${ detail }`);
  }
  if (first.length !== second.length) throw notDeterministic(`${ first.length } checks on the first run, ${ second.length } on the second`);
  for (const [index, check] of first.entries()) {
    const other = second[index];
    if (check.label !== other.label) throw notDeterministic(`check #${ index + 1 } is '${ check.label }' on the first run and '${ other.label }' on the second`);
    if (check.pass !== other.pass) throw notDeterministic(`'${ check.label }' pass changed from ${ check.pass } to ${ other.pass }`);
    for (const key of ['actual', 'expected']) {
      const previous = check[key];
      const value = snapshotCheckValue(other, key);
      if (previous === unavailableSnapshot || value === unavailableSnapshot) continue;
      const difference = {};
      // Both snapshots already contain the result of each toJSON projection.
      if (!deepEqual(previous, value, difference, entry => entry)) {
        const [before, after] = renderDifference(difference);
        const detail = key === 'actual' ? 'gave' : 'expected';
        throw notDeterministic(`'${ check.label }' ${ detail } ${ before } on the first run and ${ after } on the second`);
      }
    }
    if (check.pass) continue;
    const difference = {};
    if (!deepEqual(check.report, other.report, difference, entry => entry)) {
      const [before, after] = renderDifference(difference);
      const location = other.report.difference?.path ? ` at ${ other.report.difference.path }` : '';
      throw notDeterministic(`'${ check.label }' reported${ location } ${ before } on the first run and ${ after } on the second`);
    }
  }
}
