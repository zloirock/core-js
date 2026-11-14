import { deepEqual, rejects } from 'node:assert/strict';
import { createSession, WebDriverError } from './webdriver.mjs';

const options = { hub: 'https://example.test/wd/hub', username: 'test', accessKey: 'test', w3c: false, capabilities: {} };

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
        return { ok: true, status: 200, text: async () => JSON.stringify(request.method === 'DELETE' ? {}
          : w3c ? { sessionId: 'orphan' } : { value: { sessionId: 'orphan' } }) };
      };
      await rejects(createSession({ ...options, w3c }), /no session id/, 'closes a created session returned in the wrong protocol dialect #1');
      deepEqual(paths, [['/wd/hub/session', 'POST'], ['/wd/hub/session/orphan', 'DELETE']], 'closes a created session returned in the wrong protocol dialect #2');
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
        ['/wd/hub/session/test-session', 'DELETE'],
      ], 'rejects null responses to every session command in both dialects #2');
    }
  } finally {
    globalThis.fetch = previous;
  }
}
