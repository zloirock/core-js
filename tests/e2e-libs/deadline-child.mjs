import { once } from 'node:events';
import { setImmediate } from 'node:timers/promises';
import { errorReason } from './diagnostics.mjs';

const [{ module, method, args }] = await once(process, 'message');
// Keep a never-settling exercise alive until the caller's deadline.
process.channel.ref();
const run = (await import(module))[method];
if (typeof run !== 'function') throw new Error(`missing child entry point ${ method }`);

process.on('unhandledRejection', reason => {
  throw new Error(`unhandled rejection - ${ errorReason(reason) }`, { cause: reason });
});
process.on('uncaughtException', error => {
  process.send({ type: 'e2e-libs:failure', error: errorReason(error) });
});

try {
  process.send({ type: 'e2e-libs:ready' });
  const result = await run(...args, () => process.send({ type: 'e2e-libs:repeat' }));
  // Give Node a turn to report unhandled rejections before returning the verdict.
  await setImmediate();
  process.send({ type: 'e2e-libs:result', result });
} catch (error) {
  process.send({ type: 'e2e-libs:failure', error: errorReason(error) });
}
