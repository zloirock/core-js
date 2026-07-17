// One stripped-realm evaluation for the usage-global leg: a worker thread IS the realm (own
// isolate, own globals, own module caches - and, unlike ShadowRealm, it dies with its memory:
// realms leak unreclaimably at ~4.5MB each, which OOMs a full-corpus shard). Strips the
// manifest builtins FIRST, then imports the target module, computes its runtimeKey inside and
// posts the key string back.
import { runInThisContext } from 'node:vm';
import { parentPort, workerData } from 'node:worker_threads';
import { pathToFileURL } from 'node:url';
import { buildStripScript } from './strip-manifest.mjs';
import { runtimeKey } from './serialize.mjs';

// old browsers ship `self` natively; Node does not. predefine the realm-global alias the
// full-env native leg uses (non-enumerable, so rest/spread global probes count the same)
Object.defineProperty(globalThis, 'self', { value: globalThis, configurable: true, enumerable: false, writable: true });
// materialize the realm's LAZY global accessors before the strip: object-rest over globalThis
// (the proxy corpora) invokes them, and their loaders run Node internals built on the very
// methods the strip removes (node:http sorts its METHODS with toSorted) - a post-strip lazy
// load then throws inside the HOST, a no-engine half-state. touched now, they load with the
// builtins intact and later reads see plain materialized values
for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(globalThis))) {
  if (descriptor.get) {
    try {
      descriptor.get.call(globalThis);
    } catch {
      // a host getter may throw on its own (workerless surfaces) - the strip is not involved yet
    }
  }
}
// `globalThis` is stripped WITH `Iterator`: usage-global must inject es.global-this for every
// bare read on old targets, and a corpus-wide run proved the detection holds (91 extra armed
// snippets, zero failures) - the injected module restores the binding before any body or
// rig-aliases read, since imports evaluate first. unlike the pure leg there is no rewrite to
// shield the reference: a missed injection must throw here, which is the leg's whole point
runInThisContext(buildStripScript(['Iterator', 'globalThis']));

let result;
try {
  const mod = await import(pathToFileURL(workerData.file).href);
  result = { ok: true, r: mod.r, effects: mod.effects };
} catch (error) {
  result = { ok: false, errorName: error?.name ?? 'Error' };
}
// eslint-disable-next-line unicorn/require-post-message-target-origin -- worker_threads postMessage's 2nd arg is a transferList, not a targetOrigin
parentPort.postMessage(runtimeKey(result));
