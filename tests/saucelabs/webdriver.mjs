import { setTimeout } from 'node:timers/promises';
import { getGlobalDispatcher } from 'undici';

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
      // The default transport times out after five minutes, even with a longer abort deadline.
      dispatcher: {
        dispatch(options, handler) {
          return getGlobalDispatcher().dispatch({ ...options, headersTimeout: timeout, bodyTimeout: timeout }, handler);
        },
      },
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
    // A previous DELETE can have closed the session even if its response was lost.
    if (method === 'DELETE' && (payload.status === 6 || payload.value?.error === 'invalid session id')) return payload;
    throw new WebDriverError(`${ method } ${ path }: ${ payload.value?.message ?? `HTTP ${ response.status }` }`);
  }
  return payload;
}

export function basicAuthorization(username, accessKey) {
  return `Basic ${ Buffer.from(`${ username }:${ accessKey }`).toString('base64') }`;
}

const sessionPath = id => `/session/${ encodeURIComponent(id) }`;

export async function closeSession(hub, authorization, id, timeout) {
  for (let attempt = 1; ; attempt++) {
    try {
      await request(hub, authorization, 'DELETE', sessionPath(id), undefined, timeout);
      return;
    } catch (error) {
      if (attempt === 3) {
        error.sessionId = id;
        throw error;
      }
      await setTimeout(1000);
    }
  }
}

export async function createSession({ hub, username, accessKey, w3c, capabilities, trackSession }) {
  const authorization = basicAuthorization(username, accessKey);
  const body = w3c ? { capabilities: { alwaysMatch: capabilities } } : { desiredCapabilities: capabilities };
  const payload = await request(hub, authorization, 'POST', '/session', body, SESSION_TIMEOUT);
  const expected = w3c ? payload.value?.sessionId : payload.sessionId;
  const id = (typeof expected === 'string' && expected) || (w3c ? payload.sessionId : payload.value?.sessionId);
  if (typeof id !== 'string' || !id) throw new WebDriverError(`POST /session: no session id in ${ JSON.stringify(payload).slice(0, 200) }`);
  await trackSession?.(id, true);
  if (id !== expected) return quit(new WebDriverError(`POST /session: expected a ${ w3c ? 'W3C' : 'JSON Wire' } session id in ${ JSON.stringify(payload).slice(0, 200) }`));
  return {
    id,
    navigate: url => command('/url', { url }),
    execute: async script => (await command(w3c ? '/execute/sync' : '/execute', { script, args: [] })).value,
    quit,
  };

  function command(path, data) {
    return request(hub, authorization, 'POST', sessionPath(id) + path, data);
  }

  // Report a failed attempt with its session link, including any failure to close it.
  async function quit(failure) {
    try {
      await closeSession(hub, authorization, id);
      await trackSession?.(id, false);
    } catch (error) {
      failure = failure ? new AggregateError([failure, error], `${ failure.message }\n${ error.message }`) : error;
    }
    if (failure) {
      failure.sessionId = id;
      throw failure;
    }
  }
}
