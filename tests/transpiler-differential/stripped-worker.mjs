// IPC eval worker run with `--import ./strip-builtins.mjs`, so the leaf builtins are already gone
// before this (and any @core-js) code loads. The parent forks ONE of these for the whole run and
// sends module file paths; the worker imports each and replies with its runtimeKey. @core-js
// modules cache here exactly once - loaded into a builtin-absent realm, so they resolve to the
// polyfill path. Importing only serialize.mjs keeps the worker free of @babel/core (which would
// itself break under the strip).
import { pathToFileURL } from 'node:url';
import { runtimeKey } from './serialize.mjs';

process.on('message', async ({ id, file }) => {
  let key;
  try {
    const mod = await import(pathToFileURL(file).href);
    key = runtimeKey({ ok: true, r: mod.r, effects: mod.effects });
  } catch (error) {
    key = runtimeKey({ ok: false, errorName: error?.name ?? 'Error' });
  }
  process.send({ id, key });
});

process.send({ ready: true });
