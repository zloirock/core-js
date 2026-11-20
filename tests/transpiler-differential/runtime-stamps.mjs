import { createHash } from 'node:crypto';

// Hash the loaded implementation of each flavour and the manifests that resolve its imports.
export const RUNTIME_TREES = { pure: ['packages/core-js-pure'], global: ['packages/core-js/modules', 'packages/core-js/internals', 'packages/core-js/package.json'] };

// Worktrees can borrow evaluations: their runtime identity is relative paths plus file bytes.
// Accept an old absolute-path stamp only when it matches these exact files in this checkout.
export async function readRuntimeStamps(root, trees, previous = {}) {
  const runtime = {};
  const legacy = {};
  // Keep header serialization deterministic while the two trees are read concurrently.
  for (const tree of Object.keys(trees)) {
    runtime[tree] = undefined;
    legacy[tree] = undefined;
  }
  await Promise.all(Object.entries(trees).map(async ([tree, directories]) => {
    const patterns = directories.flatMap(entry => entry.endsWith('/package.json') ? entry
      : [`${ entry }/**/*.js`, `${ entry }/**/package.json`]);
    const found = await glob(patterns, { cwd: root, absolute: true, onlyFiles: true });
    const current = createHash('sha256');
    const absolute = createHash('sha256');
    // NUL separates path and content, so moving bytes across their boundary cannot preserve a stamp.
    for (const file of found.sort()) {
      const bytes = await fs.readFile(file);
      current.update(path.relative(root, file).replaceAll('\\', '/')).update('\0').update(bytes).update('\0');
      absolute.update(file).update('\0').update(bytes).update('\0');
    }
    runtime[tree] = `relative-v1:${ current.digest('hex').slice(0, 12) }`;
    legacy[tree] = absolute.digest('hex').slice(0, 12);
  }));
  const stamps = { runtime, legacy };
  return { ...stamps, compatible: compatibleRuntimeStamps(previous, stamps) };
}

// Normalize only legacy stamps proven against the files just read; unknown stamps stay mismatched.
export function compatibleRuntimeStamps(previous, { runtime, legacy }) {
  return Object.fromEntries(Object.entries(runtime).map(([tree, stamp]) => [
    tree, previous?.[tree] === legacy[tree] ? stamp : previous?.[tree],
  ]));
}
