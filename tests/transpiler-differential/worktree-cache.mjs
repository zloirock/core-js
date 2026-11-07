import { createHash, randomUUID } from 'node:crypto';
import { compatibleRuntimeStamps, readRuntimeStamps } from './runtime-stamps.mjs';

// Only missing files permit borrowing. Retain healthy records while keeping damaged data out of
// cached verdicts; an unreadable own file is a miss, never a request to replace it with a donor.
async function readCache(file) {
  try {
    const parsed = await fs.readJson(file);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    // Repair only damaged records; a malformed counter must not disable the rotating audit.
    if (!Number.isSafeInteger(parsed.round) || parsed.round < 0) parsed.round = 0;
    if (!parsed.cases || typeof parsed.cases !== 'object' || Array.isArray(parsed.cases)) delete parsed.cases;
    for (const [name, group] of Object.entries(parsed.cases ?? {})) {
      if (typeof group?.src !== 'string') delete parsed.cases[name];
      else for (const [type, cell] of Object.entries(group)) {
        if (typeof cell !== 'string' && (typeof cell?.h !== 'string' || typeof cell?.r !== 'string')) delete group[type];
      }
    }
    return parsed;
  } catch (error) {
    return error.code === 'ENOENT' ? null : {};
  }
}

// Glob paths use forward slashes on Windows too; join relative entries before comparing owners.
async function cacheFiles(directory, pattern) {
  return (await glob(pattern, { cwd: directory, onlyFiles: true })).map(file => path.join(directory, file));
}

function sameRuntime(left, right) {
  return Object.keys(right).every(tree => left?.[tree] === right[tree]);
}

// An old shared file has no owner metadata. A registered worktree can prove its absolute stamps,
// but only identical current runtime CONTENT also authorizes copying its results into this tree.
async function legacyDonor(root, trees, runtime, parsed) {
  let stdout;
  try {
    ({ stdout } = await $({ cwd: root, quiet: true })`git worktree list --porcelain -z`);
  } catch { return null; }
  for (const field of stdout.split('\0')) {
    if (!field.startsWith('worktree ')) continue;
    const otherRoot = field.slice('worktree '.length);
    if (otherRoot === root) continue;
    try {
      const other = await readRuntimeStamps(otherRoot, trees, parsed.runtime);
      if (sameRuntime(other.runtime, runtime) && sameRuntime(other.compatible, runtime)) return { ...parsed, runtime };
    } catch { /* a removed or changing worktree is not a compatible donor */ }
  }
  return null;
}

// Each real worktree owns its mutable cache. Only a missing file may borrow compatible data;
// the returned object is a private copy, and neither persistence nor pruning ever writes a donor.
export async function openWorktreeCache({ root, directory, name, trees, invalidate = false }) {
  root = await fs.realpath(root);
  const id = createHash('sha256').update(root).digest('hex').slice(0, 16);
  const ownedDirectory = path.join(directory, 'worktrees', id);
  const file = path.join(ownedDirectory, name);
  let stored = await readCache(file);
  const stamps = await readRuntimeStamps(root, trees, stored?.runtime);
  const { runtime } = stamps;
  let borrowedFrom = null;
  if (stored === null && !invalidate) {
    const donors = await cacheFiles(path.join(directory, 'worktrees'), `*/${ name }`);
    // Prefer recent snapshots, then the old flat cache. The filename already fixes machinery/Node.
    const dated = await Promise.all(donors.filter(donor => donor !== file).map(async donor => {
      try {
        return [donor, (await fs.stat(donor)).mtimeMs];
      } catch { return [donor, 0]; }
    }));
    dated.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const legacyFile = path.join(directory, name);
    for (const donor of [...dated.map(([candidate]) => candidate), legacyFile]) {
      const parsed = await readCache(donor);
      if (!parsed?.cases) continue;
      const compatible = compatibleRuntimeStamps(parsed.runtime, stamps);
      const accepted = sameRuntime(compatible, runtime) ? { ...parsed, runtime }
        : donor === legacyFile ? await legacyDonor(root, trees, runtime, parsed) : null;
      if (accepted) {
        stored = accepted;
        borrowedFrom = donor;
        break;
      }
    }
  } else if (stored !== null) {
    stored = { ...stored, runtime: stamps.compatible };
  }
  return {
    file, runtime, borrowedFrom,
    stored: stored ?? {},
    // One private input per run: publishing twice is an error, never a worker-visible replacement.
    async snapshot(input, { round, cases }) {
      await fs.writeJson(input, { round, runtime, cases }, { flag: 'wx' });
      return input;
    },
    // A unique temporary file keeps concurrent writes atomic, including two writes in one process.
    async write({ round, cases }) {
      await fs.ensureDir(ownedDirectory);
      const temporary = `${ file }.${ process.pid }.${ randomUUID() }.tmp`;
      try {
        await fs.writeJson(temporary, { round, runtime, cases });
        await fs.rename(temporary, file);
      } finally {
        await fs.remove(temporary);
      }
    },
    async prune() {
      const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
      for (const candidate of await cacheFiles(ownedDirectory, 'cache-*.json')) {
        if (candidate !== file && (await fs.stat(candidate)).mtimeMs < cutoff) await fs.remove(candidate);
      }
    },
  };
}
