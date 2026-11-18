import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const RELEASE_FILE = /^(?<release>[0-9a-z][-0-9a-z]{0,63})\.(?:json|retired\.(?<timestamp>0|[1-9]\d{0,11}))$/;
const POLL_INTERVAL = 1000;

export default function createReleases({ directory, retentionSeconds, createLifecycle, log, now = Date.now }) {
  const entries = new Map();
  let state = 'started';
  let stopped = false;
  let timer;
  let warming = false;

  function expired(retiredAt) {
    return now() / 1000 - retiredAt >= retentionSeconds;
  }

  async function warm() {
    if (warming) return;
    warming = true;
    try {
      // A service already uses its share of the CPU to warm its buckets.
      for (const entry of entries.values()) {
        if (stopped) break;
        if (entry.started || expired(entry.retiredAt)) continue;
        entry.started = true;
        await entry.lifecycle.start();
      }
    } finally {
      warming = false;
    }
  }

  async function refresh() {
    let files;
    try {
      files = await readdir(directory);
    } catch (error) {
      if (stopped) return;
      if (state !== 'error') log('releases_unavailable', error);
      state = 'error';
      return;
    }
    if (stopped) return;
    const retired = new Map();
    const manifests = new Map();
    for (const file of files) {
      const match = RELEASE_FILE.exec(file);
      if (match) {
        const { release, timestamp } = match.groups;
        if (timestamp === undefined) manifests.set(release, file);
        else retired.set(release, Math.min(retired.get(release) ?? Infinity, Number(timestamp)));
      }
    }

    for (const [release, entry] of entries) {
      entry.retiredAt = Math.min(entry.retiredAt, retired.get(release) ?? Infinity);
      if (!manifests.has(release) || expired(entry.retiredAt)) entries.delete(release);
    }
    for (const [release, file] of manifests) {
      const retiredAt = retired.get(release) ?? Infinity;
      if (!entries.has(release) && !expired(retiredAt)) {
        entries.set(release, { retiredAt, started: false, lifecycle: createLifecycle(join(directory, file), release) });
      }
    }
    state = 'ready';
    warm();
  }

  async function poll() {
    await refresh();
    if (!stopped) timer = setTimeout(poll, POLL_INTERVAL).unref();
  }

  return {
    get(release) {
      const entry = entries.get(release);
      if (entry && !expired(entry.retiredAt)) return entry.lifecycle;
    },
    status() {
      return { state, ...state === 'error' ? { errorCode: 'releases_unavailable' } : {} };
    },
    start: poll,
    stop() {
      stopped = true;
      clearTimeout(timer);
    },
  };
}
