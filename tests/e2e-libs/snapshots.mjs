// The injection baselines: comparing one, authoring one under OVERWRITE, and finding the ones no cell
// produces any more. babel-plugin is the REFERENCE, stored as the set it injected; each unplugin phase
// is a DELTA from it - `-spec` for what the reference has and this phase does not, `+spec` the other way.
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { allCells } from './cells.mjs';
import { HERE, SNAPSHOTS } from './paths.mjs';

const { OVERWRITE } = process.env;

function pathOf(cell) {
  return join(SNAPSHOTS, cell.snapshot);
}

export function ensureDirectory() {
  return mkdir(SNAPSHOTS, { recursive: true });
}

async function baseline(file) {
  try {
    return (await readFile(file, 'utf8')).split('\n').map(line => line.trim()).filter(Boolean);
  } catch (err) {
    if (err.code === 'ENOENT') return null; // no baseline yet - first run
    throw err; // a real read error must not masquerade as "no baseline" and silently overwrite
  }
}

export function deltaLines(reference, injected) {
  const ref = new Set(reference);
  const now = new Set(injected);
  return [
    ...reference.filter(spec => !now.has(spec)).sort().map(spec => `-${ spec }`),
    ...injected.filter(spec => !ref.has(spec)).sort().map(spec => `+${ spec }`),
  ];
}

// Compare (or author) a cell's snapshot lines. Returns 'ok' | 'updated' | 'drift' | 'missing'. A drift
// prints the modules the specifier was injected into: which detection site changed its mind is what a
// bare list of lines cannot answer.
export async function compare(cell, lines, origins) {
  const file = pathOf(cell);
  const base = await baseline(file);
  if (OVERWRITE) {
    // a delta can legitimately be EMPTY, and the file is still written: otherwise a vanished baseline
    // and a phase agreeing with the reference exactly would look identical on the next run
    const content = lines.length ? `${ lines.join('\n') }\n` : '';
    // only what actually moved is reported, or an OVERWRITE sweep says "updated" for the whole matrix
    if (base && `${ base.join('\n') }\n`.trim() === content.trim()) return 'ok';
    await writeFile(file, content);
    echo(chalk.yellow(`    snapshot ${ base ? 'updated' : 'created' } (${ chalk.cyan(lines.length) })`));
    return 'updated';
  }
  // only an explicit OVERWRITE may author a baseline. Auto-creating one here would make a new library
  // (or a baseline lost in a merge) report success while having verified nothing.
  if (!base) {
    echo(chalk.red(`    FAIL no baseline at ${ chalk.cyan(file) } - rerun with OVERWRITE=1 to author it`));
    return 'missing';
  }
  const now = new Set(lines);
  const old = new Set(base);
  const added = lines.filter(spec => !old.has(spec));
  const removed = base.filter(spec => !now.has(spec));
  if (!added.length && !removed.length) return 'ok';
  // quoted because a delta line carries its own leading `-`/`+`: `+ -core-js/modules/web.self` is two
  // signs meaning different things. Both directions get origins - in a DELTA file a vanished `-spec`
  // also means "this phase started injecting it" - and the sign is stripped, `origins` keying the bare one.
  function withOrigins(mark, spec) {
    echo(chalk.red(`    ${ mark } "${ chalk.cyan(spec) }"`));
    for (const where of origins.get(spec.replace(/^[+-]/, '')) ?? []) echo(chalk.red(`        injected into ${ chalk.cyan(where) }`));
  }
  for (const spec of added) withOrigins('+', spec);
  for (const spec of removed) withOrigins('-', spec);
  return 'drift';
}

// A baseline with no cell behind it is invisible to everything else - nothing reads it, so nothing
// notices, and it sits in git looking like coverage. Derived from the REGISTRY rather than from this
// run, so a filtered run does not accuse the libraries it skipped.
export async function orphans(libraries) {
  const expected = new Set(allCells(libraries).filter(cell => cell.snapshot).map(cell => pathOf(cell)));
  const found = (await readdir(SNAPSHOTS)).map(name => join(SNAPSHOTS, name));
  const stale = found.filter(file => !expected.has(file));
  for (const file of stale) {
    if (OVERWRITE) await rm(file);
    echo(chalk[OVERWRITE ? 'yellow' : 'red'](`${ OVERWRITE ? 'removed orphan' : 'FAIL orphan' } snapshot ${ chalk.cyan(relative(HERE, file)) }`
      + `${ OVERWRITE ? '' : ' - no cell produces it; rerun with OVERWRITE=1 to remove it' }`));
  }
  return stale.length;
}
