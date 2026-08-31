import { HEADER_LIMIT } from '../../config.js';
import { toTargetKey } from './target-key.js';

// what the UA parser calls a browser, in the vocabulary of the compat data. anything not named
// here resolves to "I do not know", which is a full answer: the visitor gets the baseline
const ENGINES = new Map([
  ['android browser', 'android'],
  ['chrome', 'chrome'],
  ['chromium', 'chrome'],
  ['firefox', 'firefox'],
  ['internet explorer', 'ie'],
  ['microsoft edge', 'edge'],
  ['opera', 'opera'],
  ['safari', 'safari'],
  ['samsung internet for android', 'samsung'],
]);

// the compat data counts the mobile builds of three of them as engines of their own
const ON_ANDROID = new Map([
  ['chrome', 'chrome-android'],
  ['chromium', 'chrome-android'],
  ['firefox', 'firefox-android'],
  ['opera', 'opera-android'],
]);

// the token that carries the live version of an iOS browser, whatever the browser is
const VERSION_TOKEN = /\bVersion\/(?<version>\d+(?:\.\d+)*)/;
// the Quest UA ends in `SamsungBrowser/4.0`, and a parser that does not know the headset reads
// that: bowser answers "Samsung Internet 4.0", a decade-old engine, for a current Quest
const QUEST_TOKEN = /\bOculusBrowser\/(?<version>\d+(?:\.\d+)*)/;
// a Chromium build under a name of its own - a derivative, or an in-app WebView. the token is the
// engine's own version, so it is worth more than the name we failed to recognize
const CHROMIUM_TOKEN = /\bChrome\/(?<version>\d+(?:\.\d+)*)/;

export default function createResolver({ parseUserAgent }) {
  return function resolve(headers) {
    const userAgent = headers?.['user-agent'];

    // the only way not to answer is to say so - there is no "probably Chrome 90" branch. an
    // oversized user agent gets the same answer: it is written by the visitor and goes into a parser
    // with three dozen patterns, so past the bound it is not read at all
    if (typeof userAgent != 'string' || !userAgent || userAgent.length > HEADER_LIMIT) return null;

    const parsed = parseUserAgent(userAgent);

    if (parsed === null) return null;

    const browser = parsed.browser.name?.toLowerCase() ?? null;
    const system = parsed.os.name?.toLowerCase() ?? null;

    // on iOS every browser is WKWebView - Blink and Gecko do not exist there. the parsers answer
    // `Chrome 140` to a `CriOS/` string, and handing that to compat as real Chrome builds a bundle
    // far thinner than WebKit needs
    if (system === 'ios') {
      // the live version is in `Version/` and nowhere else - Apple froze the OS token at 18_7, so it
      // is a LOWER BOUND. an in-app WKWebView carries no `Version/` at all, and building a version
      // upwards there hands a thin bundle to an old engine
      return toTargetKey('ios', VERSION_TOKEN.exec(userAgent)?.groups.version ?? parsed.os.version ?? '');
    }

    const quest = QUEST_TOKEN.exec(userAgent)?.groups.version;

    if (quest !== undefined) return toTargetKey('quest', quest);

    const engine = (system === 'android' ? ON_ANDROID.get(browser) : null) ?? ENGINES.get(browser);

    if (engine === undefined) {
      const chromium = CHROMIUM_TOKEN.exec(userAgent)?.groups.version;
      if (chromium === undefined) return null;
      return toTargetKey(system === 'android' ? 'chrome-android' : 'chrome', chromium);
    }

    // no authoritative version token, no version - the browser's own token is the only thing that
    // carries one, and it is not ours to reconstruct
    return toTargetKey(engine, parsed.browser.version ?? '');
  };
}
