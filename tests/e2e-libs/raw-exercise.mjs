import { basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { runWithDeadline } from './deadline.mjs';
import { captureChecks, checkResultProblem, checkRows, renderDifference } from './diagnostics.mjs';
import { cachedProjection, collectionInfo, collectionValues, deepEqual, enumerableKeys, isEmulatedSymbol } from './exercises/checks.mjs';

const arrayKind = Symbol('array');
const collectionKind = Symbol('collection kind');
const RUN_DEADLINE_MS = 60_000;

export function rawChecks(target, { repeat = false, timeout = RUN_DEADLINE_MS } = {}) {
  const name = basename(target);
  return runWithDeadline(import.meta.url, 'runRaw', [target, name, repeat], { ms: timeout, what: `${ name } run()` });
}

// Comparison and formatting stay in the child, since actual values may contain functions or symbols.
export async function runRaw(target, name, repeat, beforeRepeat) {
  const checks = await oneRun(target, name);
  const rows = checkRows(checks);
  if (repeat) {
    const first = checks.map(({ actual, expected }) => ({
      actual: snapshotValue(actual),
      expected: snapshotValue(expected),
    }));
    beforeRepeat();
    assertDeterministic(name, rows, first, await oneRun(target, name));
  }
  return rows;
}

async function oneRun(target, name) {
  const mod = await import(pathToFileURL(target).href);
  if (typeof mod.run !== 'function') throw new Error(`${ name } does not export run()`);
  const checks = captureChecks(await mod.run());
  const problem = checkResultProblem(checks);
  if (problem) throw new Error(`${ name }: ${ problem }`);
  if (!checks.length) throw new Error(`${ name } returned no checks`);
  return checks;
}

// Compare the observed values even when the second run mutates an object returned by the first.
// Use the exercise's toJSON projection and keep sparse slots and opaque values (e.g. symbols).
function snapshotValue(raw, copies = new WeakMap(), project = cachedProjection()) {
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
    for (let i = 0; i < length; i++) if (Object.hasOwn(value, i)) copy[i] = snapshotValue(value[i], copies, project);
  }
  if (entries) {
    for (const entry of collectionValues(collection)) entries.push(snapshotValue(entry, copies, project));
  }
  for (const key of enumerableKeys(value, length)) {
    Object.defineProperty(properties, key, { enumerable: true, value: snapshotValue(value[key], copies, project) });
  }
  return copy;
}

function assertDeterministic(name, rows, first, second) {
  function notDeterministic(detail) {
    return new Error(`${ name } is not deterministic: ${ detail }`);
  }
  if (first.length !== second.length) throw notDeterministic(`${ first.length } checks on the first run, ${ second.length } on the second`);
  for (const [index, check] of rows.entries()) {
    const other = second[index];
    if (check.label !== other.label) throw notDeterministic(`check #${ index + 1 } is '${ check.label }' on the first run and '${ other.label }' on the second`);
    if (check.pass !== other.pass) throw notDeterministic(`'${ check.label }' pass changed from ${ check.pass } to ${ other.pass }`);
    for (const key of ['actual', 'expected']) {
      const previous = first[index][key];
      const value = snapshotValue(other[key]);
      const difference = {};
      // Both snapshots already contain the result of each toJSON projection.
      if (!deepEqual(previous, value, difference, entry => entry)) {
        const [before, after] = renderDifference(difference);
        const detail = key === 'actual' ? 'gave' : 'expected';
        throw notDeterministic(`'${ check.label }' ${ detail } ${ before } on the first run and ${ after } on the second`);
      }
    }
  }
}
