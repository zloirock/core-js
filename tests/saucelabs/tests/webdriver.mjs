import { deepEqual, rejects } from 'node:assert/strict';
import { getGlobalDispatcher } from 'undici';
import { createSession, WebDriverError } from '../webdriver.mjs';

const options = { hub: 'https://example.test/wd/hub', username: 'test', accessKey: 'test', w3c: false, capabilities: {} };

{
  const dispatcher = getGlobalDispatcher();
  const ownDispatch = Object.getOwnPropertyDescriptor(dispatcher, 'dispatch');
  const { verbose } = $;
  const timeouts = [];
  try {
    $.verbose = false;
    dispatcher.dispatch = ({ headersTimeout, bodyTimeout }) => {
      timeouts.push([headersTimeout, bodyTimeout]);
      throw new Error('hub unavailable');
    };
    await rejects(createSession(options), WebDriverError);
    deepEqual(timeouts, [[15 * 6e4, 15 * 6e4]], 'the transport waits for the queued session and its response body');
  } finally {
    if (ownDispatch) Object.defineProperty(dispatcher, 'dispatch', ownDispatch);
    else delete dispatcher.dispatch;
    $.verbose = verbose;
  }
}

async function responseTest(body, status = 200) {
  const previous = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: status < 400, status, text: async () => body });
    await rejects(createSession(options), error => error instanceof WebDriverError &&
      error.message.includes(`HTTP ${ status }`), `HTTP ${ status } with ${ body } is a WebDriverError`);
  } finally {
    globalThis.fetch = previous;
  }
}

{
  const previous = globalThis.fetch;
  try {
    for (const w3c of [false, true]) {
      const paths = [];
      globalThis.fetch = async (url, request) => {
        paths.push([new URL(url).pathname, request.method]);
        if (request.method === 'POST') return { ok: true, status: 200, text: async () => JSON.stringify(
          w3c ? { sessionId: 'orphan' } : { sessionId: 42, value: { sessionId: 'orphan' } },
        ) };
        if (paths.length === 2) throw new Error('connection reset after DELETE');
        return w3c ? { ok: true, status: 200, text: async () => '{"status":6}' }
          : { ok: false, status: 404, text: async () => '{"value":{"error":"invalid session id"}}' };
      };
      const tracked = [];
      await rejects(createSession({ ...options, w3c, trackSession: (id, open) => tracked.push([id, open]) }), {
        name: 'WebDriverError', sessionId: 'orphan', message: w3c ? /expected a W3C session id/ : /expected a JSON Wire session id/,
      }, 'a retried attempt carries the id returned in the other dialect');
      deepEqual(paths, [['/wd/hub/session', 'POST'], ['/wd/hub/session/orphan', 'DELETE'], ['/wd/hub/session/orphan', 'DELETE']]);
      deepEqual(tracked, [['orphan', true], ['orphan', false]], 'tracks a session returned in the wrong dialect until the hub confirms it is gone');
    }
  } finally {
    globalThis.fetch = previous;
  }
}

await responseTest('null');

await responseTest('<html>unavailable</html>', 502);

{
  const previous = globalThis.fetch;
  try {
    for (const w3c of [false, true]) {
      const paths = [];
      globalThis.fetch = async (url, request) => {
        paths.push([new URL(url).pathname, request.method]);
        return {
          ok: true, status: 200,
          text: async () => url.endsWith('/session')
            ? JSON.stringify(w3c ? { value: { sessionId: 'test-session' } } : { sessionId: 'test-session' })
            : url.endsWith('/url') ? '' : 'null',
        };
      };
      const session = await createSession({ ...options, w3c });
      await session.navigate('http://example.test');
      for (const command of [() => session.execute('return 1'), () => session.quit()]) {
        await rejects(command(), error => error instanceof WebDriverError &&
          error.message.includes('invalid WebDriver response'), 'rejects null responses to every session command in both dialects #1');
      }
      deepEqual(paths, [
        ['/wd/hub/session', 'POST'],
        ['/wd/hub/session/test-session/url', 'POST'],
        [`/wd/hub/session/test-session/${ w3c ? 'execute/sync' : 'execute' }`, 'POST'],
        ...Array(3).fill(['/wd/hub/session/test-session', 'DELETE']),
      ], 'rejects null responses to every session command in both dialects #2');

      if (w3c) {
        globalThis.fetch = async (url, { method }) => method === 'DELETE'
          ? { ok: false, status: 500, text: async () => '{"value":{"error":"unknown error","message":"unable to close session"}}' }
          : { ok: false, status: 404, text: async () => '{"value":{"error":"invalid session id","message":"session has ended"}}' };
        await rejects(session.execute('return 1'), { name: 'WebDriverError', message: /POST .*: session has ended$/ });
        await rejects(session.quit(), { name: 'WebDriverError', message: /DELETE .*: unable to close session$/ });
      }
    }
  } finally {
    globalThis.fetch = previous;
  }
}

echo(chalk.green('Sauce Labs WebDriver client tested'));
