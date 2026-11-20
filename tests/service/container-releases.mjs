import { deepStrictEqual, notStrictEqual, strictEqual } from 'node:assert/strict';
import fs, { mkdir, mkdtemp, readFile, rename, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mock } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import createLifecycle from '../../packages/core-js-service-container/lifecycle.js';
import createReleases from '../../packages/core-js-service-container/releases.js';

const EMPTY_MANIFEST = JSON.stringify({ modules: [] });

const directory = await mkdtemp(join(tmpdir(), 'core-js-releases-'));
const releases = join(directory, 'manifests');
let now = 110000;
const started = [];
const incidents = [];
const registry = createReleases({
  directory: releases,
  retentionSeconds: 60,
  now: () => now,
  createLifecycle(path, release) {
    return { start() { started.push(release); } };
  },
  log(code, error) { incidents.push([code, error]); },
});

async function until(check) {
  const signal = AbortSignal.timeout(5000);
  while (!check()) await setTimeout(20, undefined, { signal });
}

try {
  await mkdir(releases);
  await mkdir(join(releases, 'current.retired.0'));
  await mkdir(join(releases, 'directory.json'));
  await writeFile(join(releases, 'current.json'), EMPTY_MANIFEST);
  await writeFile(join(releases, 'previous.json'), EMPTY_MANIFEST);
  await writeFile(join(releases, 'previous.retired.120'), '');
  await writeFile(join(releases, 'expired.json'), EMPTY_MANIFEST);
  await writeFile(join(releases, 'expired.retired.40'), '');
  if (process.platform !== 'win32') {
    await symlink('directory.json', join(releases, 'current.retired.1'), 'dir');
    await symlink('missing', join(releases, 'current.retired.200'));
    await symlink('cycle.json', join(releases, 'cycle.json'));
    await symlink('current.json', join(releases, 'linked.json'));
    await symlink('current.json', join(releases, 'previous.retired.100'));
    await writeFile(join(releases, 'withdrawn.json'), EMPTY_MANIFEST);
    await symlink('current.json', join(releases, 'withdrawn.retired.120'));
  } else {
    await writeFile(join(releases, 'previous.retired.100'), '');
  }
  await registry.start();
  deepStrictEqual(registry.status(), { state: 'ready' },
    'container-releases-2 #16: invalid links do not block a scan');
  strictEqual(registry.get('cycle'), undefined, 'container-releases-2 #17: a link cycle cannot publish a release');
  notStrictEqual(registry.get('current'), undefined, 'container-releases-2 #8: a directory cannot retire a release');
  strictEqual(registry.get('directory'), undefined, 'container-releases-2 #9: directories are not manifests');
  strictEqual(registry.get('expired'), undefined, 'container-releases-3 #6: expired releases are not warmed');

  const expected = process.platform === 'win32' ? ['current', 'previous'] : ['current', 'linked', 'previous', 'withdrawn'];
  await until(() => started.length >= expected.length);
  deepStrictEqual(started.toSorted(), expected, 'container-releases-2 #10');
  now = 159999;
  notStrictEqual(registry.get('previous'), undefined, 'container-releases-3 #7: available until the deadline');
  now = 160000;
  strictEqual(registry.get('previous'), undefined, 'container-releases-3 #8: first marker fixes the deadline');

  if (process.platform !== 'win32') {
    const linkPath = join(releases, 'linked.json');
    const lifecycle = registry.get('linked');
    const failure = Object.assign(new Error('manifest target unavailable'), { code: 'EIO' });
    const realStat = stat;
    const unreadable = mock.method(fs, 'stat', async (path, ...options) => {
      if (path !== linkPath) return realStat(path, ...options);
      throw failure;
    });
    syncBuiltinESMExports();
    try {
      await writeFile(join(releases, 'independent.json'), EMPTY_MANIFEST);
      await until(() => registry.status().state === 'error' && registry.get('independent'));
      deepStrictEqual(registry.status(), { state: 'error', errorCode: 'releases_unavailable' },
        'container-releases-2 #13: a failed metadata read makes the catalog unavailable');
      strictEqual(registry.get('linked'), lifecycle, 'container-releases-2 #14: keep the active release');
      deepStrictEqual(incidents, [['releases_unavailable', failure]], 'container-releases-2 #15');
      notStrictEqual(registry.get('independent'), undefined,
        'container-releases-2 #18: unreadable input cannot block an independent release');
    } finally {
      unreadable.mock.restore();
      syncBuiltinESMExports();
    }

    await until(() => registry.status().state === 'ready');
    await rm(join(releases, 'withdrawn.json'));
    await rename(join(releases, 'current.json'), join(releases, 'current.hidden'));
    await writeFile(join(releases, 'published.json'), EMPTY_MANIFEST);
    await until(() => registry.status().state === 'error' && registry.get('published'));
    strictEqual(registry.get('linked'), lifecycle, 'container-releases-2 #19: a listed link lost its target');
    strictEqual(registry.get('previous'), undefined, 'container-releases-3 #12: a lost target cannot undo expiry');
    notStrictEqual(registry.get('published'), undefined, 'container-releases-2 #20: other releases still load');
    strictEqual(registry.get('withdrawn'), undefined,
      'container-releases-2 #21: a missing manifest withdraws its release even while an existing marker cannot be read');

    await writeFile(join(releases, 'linked.retired.100'), '');
    await writeFile(join(releases, 'after-retirement.json'), EMPTY_MANIFEST);
    await until(() => registry.get('after-retirement'));
    strictEqual(registry.get('linked'), undefined,
      'container-releases-3 #13: a readable retirement marker still applies when the manifest target is unavailable');

    const queue = join(directory, 'queue');
    const target = join(queue, 'queued.target');
    const hidden = join(queue, 'queued.hidden');
    const warmed = Promise.withResolvers();
    const starts = [];
    const queued = createReleases({
      directory: queue,
      retentionSeconds: 60,
      createLifecycle(path, release) {
        return {
          start() {
            starts.push(release);
            if (release === 'warming') return warmed.promise;
          },
        };
      },
      log() { /* expected target errors */ },
    });
    try {
      await mkdir(queue);
      await writeFile(join(queue, 'warming.json'), EMPTY_MANIFEST);
      await queued.start();
      await writeFile(target, EMPTY_MANIFEST);
      await symlink('queued.target', join(queue, 'queued.json'));
      await until(() => queued.get('queued'));
      await rename(target, hidden);
      await until(() => queued.status().state === 'error');
      warmed.resolve();
      await warmed.promise;
      deepStrictEqual(starts, ['warming'], 'container-releases-2 #22: defer warm-up while a target is missing');
      await rename(hidden, target);
      await until(() => starts.includes('queued'));
      deepStrictEqual(starts, ['warming', 'queued'], 'container-releases-2 #23: resume warm-up when the target returns');
    } finally {
      queued.stop();
      warmed.resolve();
    }

    const restart = join(directory, 'restart');
    const markerTarget = join(restart, 'marker');
    const markerHidden = join(restart, 'marker.hidden');
    await mkdir(restart);
    await writeFile(join(restart, 'retired.json'), EMPTY_MANIFEST);
    await writeFile(join(restart, 'active.json'), EMPTY_MANIFEST);
    await writeFile(markerTarget, '');
    await symlink('marker', join(restart, 'retired.retired.100'));
    let clock = 159999;
    const options = {
      directory: restart,
      retentionSeconds: 60,
      now: () => clock,
      createLifecycle() { return { start() { /* no warm-up needed */ } }; },
      log() { /* expected target errors */ },
    };
    const previous = createReleases(options);
    const beforeDeadline = createReleases(options);
    const restarted = createReleases(options);
    try {
      await previous.start();
      await rename(markerTarget, markerHidden);
      await beforeDeadline.start();
      notStrictEqual(beforeDeadline.get('retired'), undefined,
        'container-releases-3 #17: a missing marker target allows the remaining retention period');
      clock = 160000;
      strictEqual(previous.get('retired'), undefined, 'container-releases-3 #14: retire before restarting');
      strictEqual(beforeDeadline.get('retired'), undefined,
        'container-releases-3 #18: honor the deadline while a marker target is unavailable');
      await restarted.start();
      strictEqual(restarted.get('retired'), undefined, 'container-releases-3 #15: an expired release stays unavailable on restart');
      deepStrictEqual(restarted.status(), { state: 'error', errorCode: 'releases_unavailable' },
        'container-releases-2 #24: report the unreadable marker');
      notStrictEqual(restarted.get('active'), undefined, 'container-releases-2 #25: publish an unaffected release on restart');
      await rename(markerHidden, markerTarget);
      await until(() => restarted.status().state === 'ready');
      strictEqual(restarted.get('retired'), undefined, 'container-releases-3 #16: confirming the marker preserves expiry');
    } finally {
      previous.stop();
      beforeDeadline.stop();
      restarted.stop();
    }

    const retryDir = join(directory, 'retry');
    const manifest = join(retryDir, 'manifest');
    const staged = join(retryDir, 'manifest.hidden');
    const errors = [];
    let reads = 0;
    const retrying = createReleases({
      directory: retryDir,
      retentionSeconds: 60,
      createLifecycle(path) {
        return createLifecycle({
          async load() {
            if (++reads === 1) await rename(manifest, staged);
            return JSON.parse(await readFile(path, 'utf8'));
          },
          createService: () => ({
            start: () => ({ ready: Promise.resolve(), warmed: Promise.resolve({ failed: [] }) }),
          }),
          retryManifestRead: true,
          log: code => errors.push(code),
        });
      },
      log() { /* expected target errors */ },
    });
    try {
      await mkdir(retryDir);
      await writeFile(manifest, '[]');
      await symlink('manifest', join(retryDir, 'retry.json'));
      await retrying.start();
      const readLifecycle = retrying.get('retry');
      await until(() => errors.length > 0);
      deepStrictEqual(readLifecycle.status(), { state: 'error', baselineReady: false, fullyWarmed: false,
        errorCode: 'manifest_unavailable' }, 'container-releases-2 #26: distinguish a filesystem read failure');
      await rename(staged, manifest);
      await until(() => readLifecycle.status().fullyWarmed);
      deepStrictEqual(readLifecycle.status(), { state: 'ready', baselineReady: true, fullyWarmed: true },
        'container-releases-2 #27: a later scan retries the manifest read on the same lifecycle');
      strictEqual(reads, 2, 'container-releases-2 #28: only the failed manifest read is retried');
    } finally {
      retrying.stop();
    }
  }
} finally {
  registry.stop();
  await rm(directory, { recursive: true, force: true });
}

const unavailable = createReleases({
  directory: releases,
  retentionSeconds: 60,
  createLifecycle() { throw new Error('unexpected lifecycle'); },
  log() { throw new Error('fixture logging failed'); },
});
try {
  await unavailable.start();
  deepStrictEqual(unavailable.status(), { state: 'error', errorCode: 'releases_unavailable' },
    'container-releases-2 #11: failed logging cannot hide a directory error');
} finally {
  unavailable.stop();
}
