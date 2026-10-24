// the two dialects Sauce Labs speaks: the W3C protocol, and the JSON Wire protocol that the oldest
// browsers of the matrix still need and the maintained clients have dropped
export class WebDriverError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'WebDriverError';
  }
}

// a session request waits in the Sauce Labs queue while the concurrency is used up
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
    // the JSON Wire side of Sauce Labs answers a navigation with an empty body
    const text = await response.text();
    payload = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new WebDriverError(`${ method } ${ path }: ${ error.message }`, { cause: error });
  }
  // W3C reports an error by the status code, JSON Wire by a non-zero `status` in a 200 response
  if (!response.ok || payload.status) {
    throw new WebDriverError(`${ method } ${ path }: ${ payload.value?.message ?? response.status }`);
  }
  return payload;
}

export async function createSession({ hub, username, accessKey, w3c, capabilities }) {
  const authorization = `Basic ${ Buffer.from(`${ username }:${ accessKey }`).toString('base64') }`;
  const body = w3c ? { capabilities: { alwaysMatch: capabilities } } : { desiredCapabilities: capabilities };
  const payload = await request(hub, authorization, 'POST', '/session', body, SESSION_TIMEOUT);
  const id = w3c ? payload.value?.sessionId : payload.sessionId;
  // a reply in the other dialect would send every command to /session/undefined
  if (!id) throw new WebDriverError(`POST /session: no session id in ${ JSON.stringify(payload).slice(0, 200) }`);

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
