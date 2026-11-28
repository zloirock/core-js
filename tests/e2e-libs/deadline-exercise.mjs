import { once } from 'node:events';
import { setImmediate, setTimeout } from 'node:timers/promises';
import { errorReason } from './diagnostics.mjs';

// A fork waiting on user code can otherwise keep its handles after its caller exits.
// eslint-disable-next-line node/no-process-exit -- the caller is gone and the exercise can still hold handles
process.once('disconnect', () => process.exit(1));
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
  // Let already queued timers run, then let Node deliver their unhandled rejections.
  await setTimeout(0);
  await setImmediate();
  process.send({ type: 'e2e-libs:result', result });
} catch (error) {
  process.send({ type: 'e2e-libs:failure', error: errorReason(error) });
}
