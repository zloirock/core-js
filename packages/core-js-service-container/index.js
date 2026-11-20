#!/usr/bin/env node
import fastify from 'fastify';
import { fileURLToPath } from 'node:url';
import { realpath } from 'node:fs/promises';
import { join } from 'node:path';
import createService from '@core-js/service';
import { loadManifest } from './manifest.js';
import { settingsFrom } from './settings.js';
import createLifecycle from './lifecycle.js';
import createReleases from './releases.js';
import createServer from './server.js';

function logIncident(code, detail) {
  process.stderr.write(`service container ${ code }: ${ detail }\n`);
}

// This entry is also imported by the process fixture to exercise the same listener and signal wiring.
// eslint-disable-next-line unicorn/no-exports-in-scripts -- The executable shares its startup wiring with a child-process fixture.
export async function startContainer({ createService: serviceFactory = createService } = {}) {
  const { manifestPath, releases, cacheDirectory, host, port } = settingsFrom(process.env);
  const app = fastify({ logger: false });
  function lifecycleFor(path, release) {
    const versioned = release !== undefined;
    const directory = cacheDirectory && versioned ? join(cacheDirectory, 'releases', release) : cacheDirectory;
    const log = versioned ? (code, detail) => logIncident(code, `[${ release }] ${ detail }`) : logIncident;
    return createLifecycle({
      load: () => loadManifest(path),
      retryManifestRead: versioned,
      createService: scope => serviceFactory({ scope, directory, delivery: 'fixed', route: '/',
        ignoreBrowserslistConfig: true, warn: warning => log('warning', warning) }),
      log,
    });
  }
  const registry = releases && createReleases({ ...releases, createLifecycle: lifecycleFor, log: logIncident });
  const lifecycle = registry ? undefined : lifecycleFor(manifestPath);
  createServer({ lifecycle, releases: registry, fastify: app, log: error => logIncident('request_failed', error) });

  let closing = false;
  async function shutdown() {
    if (closing) return;
    closing = true;
    registry?.stop();
    try {
      await app.close();
    } catch (error) {
      logIncident('shutdown_failed', error);
      process.exitCode = 1;
    }
  }
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  try {
    await app.listen({ host, port });
  } catch (error) {
    process.off('SIGTERM', shutdown);
    process.off('SIGINT', shutdown);
    throw error;
  }
  (registry ?? lifecycle).start();
}

async function isDirectInvocation() {
  if (!process.argv[1]) return false;
  try {
    return await realpath(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

if (await isDirectInvocation()) {
  try {
    await startContainer();
  } catch (error) {
    logIncident('listener_failed', error);
    process.exitCode = 1;
  }
}
