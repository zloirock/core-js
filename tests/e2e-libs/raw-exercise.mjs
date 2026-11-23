import { basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual, types } from 'node:util';
import { runWithDeadline } from './deadline.mjs';
import { captureChecks, checkResultProblem, checkRows, renderValues } from './diagnostics.mjs';
import { unwrap } from './exercises/checks.mjs';

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
    const first = checks.map(check => snapshotActual(check.actual));
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
function snapshotActual(raw, copies = new WeakMap()) {
  const value = unwrap(raw);
  if (!value || typeof value !== 'object') return value === 0 ? 0 : value;
  if (copies.has(value)) return copies.get(value);
  const array = Array.isArray(value);
  const properties = array ? new Array(value.length) : Object.create(null);
  const map = types.isMap(value);
  const entries = map || types.isSet(value) ? [] : null;
  // Keep ordered contents separate from the collection's own enumerable properties.
  const copy = entries ? { [map ? 'map' : 'set']: entries, properties } : properties;
  copies.set(value, copy);
  if (array) {
    for (let i = 0; i < value.length; i++) if (Object.hasOwn(value, i)) copy[i] = snapshotActual(value[i], copies);
  } else {
    if (entries) {
      for (const entry of value) entries.push(snapshotActual(entry, copies));
    }
    for (const [key, entry] of Object.entries(value)) properties[key] = snapshotActual(entry, copies);
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
    const actual = snapshotActual(other.actual);
    if (check.pass !== other.pass) throw notDeterministic(`'${ check.label }' pass changed from ${ check.pass } to ${ other.pass }`);
    if (!isDeepStrictEqual(first[index], actual)) {
      const [before, after] = renderValues(first[index], actual);
      throw notDeterministic(`'${ check.label }' gave ${ before } on the first run and ${ after } on the second`);
    }
  }
}
