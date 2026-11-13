export class WebDriverError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'WebDriverError';
  }
}

// includes the wait in the Sauce Labs queue
const SESSION_TIMEOUT = 15 * 6e4;
export const COMMAND_TIMEOUT = 5 * 6e4;

async function request(hub, authorization, method, path, body, timeout = COMMAND_TIMEOUT) {
  let response, payload;
  try {
    response = await fetch(hub + path, {
      method,
      headers: { authorization, 'content-type': 'application/json' },
      body: body && JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    });
    // JSON Wire answers a navigation with an empty body
    const text = await response.text();
    payload = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new WebDriverError(`${ method } ${ path }: ${ response && !response.ok ? `HTTP ${ response.status }: ` : '' }${ error.message }`, { cause: error });
  }
  if (payload === null || typeof payload !== 'object') {
    throw new WebDriverError(`${ method } ${ path }: invalid WebDriver response (HTTP ${ response.status })`);
  }
  // W3C reports an error by the status code, JSON Wire by a non-zero `status` in a 200 response
  if (!response.ok || payload.status) {
    throw new WebDriverError(`${ method } ${ path }: ${ payload.value?.message ?? `HTTP ${ response.status }` }`);
  }
  return payload;
}

export async function createSession({ hub, username, accessKey, w3c, capabilities }) {
  const authorization = `Basic ${ Buffer.from(`${ username }:${ accessKey }`).toString('base64') }`;
  const body = w3c ? { capabilities: { alwaysMatch: capabilities } } : { desiredCapabilities: capabilities };
  const payload = await request(hub, authorization, 'POST', '/session', body, SESSION_TIMEOUT);
  const id = w3c ? payload.value?.sessionId : payload.sessionId;
  // a reply in the other dialect may still have created a session
  if (!id) {
    const orphan = w3c ? payload.sessionId : payload.value?.sessionId;
    if (typeof orphan === 'string' && orphan) {
      try {
        await request(hub, authorization, 'DELETE', `/session/${ encodeURIComponent(orphan) }`);
      } catch { /* keep the original error */ }
    }
    throw new WebDriverError(`POST /session: no session id in ${ JSON.stringify(payload).slice(0, 200) }`);
  }

  function command(method, path, data) {
    return request(hub, authorization, method, `/session/${ id }${ path }`, data);
  }

  return {
    id,
    navigate: url => command('POST', '/url', { url }),
    execute: async script => (await command('POST', w3c ? '/execute/sync' : '/execute', { script, args: [] })).value,
    quit: () => command('DELETE', ''),
  };
}
