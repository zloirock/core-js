import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSession, WebDriverError } from './webdriver.mjs';

const options = { hub: 'https://example.test/wd/hub', username: 'test', accessKey: 'test', w3c: false, capabilities: {} };

async function responseTest(body, status = 200) {
  const previous = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: status < 400, status, text: async () => body });
    await assert.rejects(createSession(options), error => error instanceof WebDriverError &&
      error.message.includes(`HTTP ${ status }`));
  } finally {
    globalThis.fetch = previous;
  }
}

test('rejects null WebDriver responses as retriable errors', async () => {
  await responseTest('null');
});

test('preserves HTTP status when the response is not JSON', async () => {
  await responseTest('<html>unavailable</html>', 502);
});

test('rejects null responses to every session command in both dialects', async () => {
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
        await assert.rejects(command(), error => error instanceof WebDriverError &&
          error.message.includes('invalid WebDriver response'));
      }
      assert.deepEqual(paths, [
        ['/wd/hub/session', 'POST'],
        ['/wd/hub/session/test-session/url', 'POST'],
        [`/wd/hub/session/test-session/${ w3c ? 'execute/sync' : 'execute' }`, 'POST'],
        ['/wd/hub/session/test-session', 'DELETE'],
      ]);
    }
  } finally {
    globalThis.fetch = previous;
  }
});
