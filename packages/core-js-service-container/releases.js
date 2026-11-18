import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import report from './report.js';

const RELEASE_FILE = /^(?<release>[0-9a-z][-0-9a-z]{0,63})\.(?:json|retired\.(?<timestamp>0|[1-9]\d{0,11}))$/;
const POLL_INTERVAL = 1000;

export default function createReleases({ directory, retentionSeconds, createLifecycle, log, now = Date.now }) {
  const entries = new Map();
  let knownFiles = new Set();
  let unconfirmedRetirements = new Map();
  let unreadable = null;
  let state = 'started';
  let stopped = false;
  let timer;
  let warming = false;

  function expired(retiredAt) {
    return now() / 1000 - retiredAt >= retentionSeconds;
  }

  function withinRetention(release, retiredAt) {
    return !expired(Math.min(retiredAt, unconfirmedRetirements.get(release) ?? Infinity));
  }

  async function warm() {
    if (warming) return;
    warming = true;
    try {
      // A service already uses its share of the CPU to warm its buckets.
      for (const [release, entry] of entries) {
        if (stopped || unreadable === null) break;
        if (entry.started || unreadable.has(release) || !withinRetention(release, entry.retiredAt)) continue;
        // A failed manifest read can be retried after the next scan.
        entry.started = await entry.lifecycle.start() !== false;
      }
    } finally {
      warming = false;
    }
  }

  function failScan(error) {
    if (stopped || state === 'error') return;
    state = 'error';
    report(() => log('releases_unavailable', error), 'service container releases_unavailable', error);
  }

  async function refresh() {
    let files;
    try {
      files = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      unreadable = null;
      failScan(error);
      return;
    }
    if (stopped) return;
    const retired = new Map();
    const nextUnconfirmedRetirements = new Map();
    const manifests = new Map();
    const seenFiles = new Set();
    const nextUnreadable = new Set();
    let failure;
    for (const file of files) {
      const match = RELEASE_FILE.exec(file.name);
      if (!match) continue;
      const { release, timestamp } = match.groups;
      const path = join(directory, file.name);
      const retiredAt = timestamp === undefined ? Infinity : Number(timestamp);
      let retirements = retired;
      if (!file.isFile()) {
        if (!file.isSymbolicLink()) continue;
        try {
          if (!(await stat(path)).isFile()) continue;
        } catch (error) {
          // A published filename can outlive its target during a projected volume update.
          const known = knownFiles.has(file.name);
          if (!known && error.code === 'ELOOP') continue;
          if (known) seenFiles.add(file.name);
          const missing = error.code === 'ENOENT' || error.code === 'ENOTDIR';
          if (known || !missing || expired(retiredAt)) {
            nextUnreadable.add(release);
            if (timestamp === undefined) manifests.set(release, path);
            failure ??= error;
          }
          if (timestamp === undefined) continue;
          retirements = nextUnconfirmedRetirements;
        }
      }
      if (retirements === retired) seenFiles.add(file.name);
      if (timestamp === undefined) manifests.set(release, path);
      else retirements.set(release, Math.min(retirements.get(release) ?? Infinity, retiredAt));
    }
    if (stopped) return;
    knownFiles = seenFiles;
    unconfirmedRetirements = nextUnconfirmedRetirements;
    unreadable = nextUnreadable;

    for (const [release, entry] of entries) {
      entry.retiredAt = Math.min(entry.retiredAt, retired.get(release) ?? Infinity);
      if (!manifests.has(release) || expired(entry.retiredAt)) entries.delete(release);
    }
    for (const [release, path] of manifests) {
      const retiredAt = retired.get(release) ?? Infinity;
      if (!unreadable.has(release) && !entries.has(release) && withinRetention(release, retiredAt)) {
        entries.set(release, { retiredAt, started: false, lifecycle: createLifecycle(path, release) });
      }
    }
    if (failure) failScan(failure);
    else state = 'ready';
    warm();
  }

  async function poll() {
    await refresh();
    if (!stopped) timer = setTimeout(poll, POLL_INTERVAL).unref();
  }

  return {
    get(release) {
      const entry = entries.get(release);
      if (entry && withinRetention(release, entry.retiredAt)) return entry.lifecycle;
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
