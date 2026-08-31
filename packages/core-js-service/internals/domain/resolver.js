import { HEADER_LIMIT } from '../../config.js';
import { compareVersions, toTarget } from './target.js';

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
// the OS token, read here rather than taken from the parser, which knows only the underscored form -
// `CPU iPhone OS 13.3.1` with dots is a real string and it loses the version entirely. The word `OS`
// is required: a device that calls itself `Iphone12 pro max` is an Android phone with a name, and
// reading `12` out of it would answer iOS for a Chromium. `iOS` needs the word boundary as well -
// `KaiOS/1.0` ends in one, and a phone running Gecko would be handed a WebKit bundle
const IOS_VERSION = /(?:CPU OS|\biOS|iPhone OS)[ /](?<version>\d+(?:[._]\d+)*)/;
// the Quest UA ends in `SamsungBrowser/4.0`, and a parser that does not know the headset reads
// that: bowser answers "Samsung Internet 4.0", a decade-old engine, for a current Quest
const QUEST_TOKEN = /\bOculusBrowser\/(?<version>\d+(?:\.\d+)*)/;
// a Chromium build under a name of its own - a derivative, or an in-app WebView. the token is the
// engine's own version, so it is worth more than the name we failed to recognize
const CHROMIUM_TOKEN = /\bChrome\/(?<version>\d+(?:\.\d+)*)/;
// Trident is the rendering engine of Internet Explorer and of nothing else - no Chromium, Gecko or
// WebKit string carries the token. `MSIE 7.0` beside `Trident/7.0` is IE 11 in COMPATIBILITY VIEW:
// the claim is a document mode, the engine is the newer one, and the JavaScript is the newer one too
const TRIDENT_TOKEN = /\bTrident\/(?<version>\d+\.\d+)/;
const TRIDENT_IE = new Map([['4.0', '8'], ['5.0', '9'], ['6.0', '10'], ['7.0', '11']]);

// EdgeHTML - Edge before 79 - carries a `Chrome/` token for compatibility and was never Chromium.
// Chromium Edge spells its own token `Edg`, `EdgA` or `EdgiOS`, so the bare `Edge/` is what tells
// the two apart, and reading the borrowed token there would hand EdgeHTML a Chromium bundle
const EDGE_HTML_TOKEN = /\bEdge\/\d/;

// the higher of two versions, either of which may be missing - and both may be, which is a visitor
// with no version at all and an answer of `null` further down
function higher(one, other) {
  if (one === undefined || !/^\d/.test(one)) return other ?? '';
  if (other === undefined || !/^\d/.test(other)) return one;
  return compareVersions(one, other) >= 0 ? one : other;
}

// the other row the same visitor could be on. Where the string leaves two open, both travel and the
// matcher serves what covers them, because only there is there a plan to compare them with
function alsoOn(target, other) {
  return target === null || other === null ? target : { ...target, alternate: other };
}

// a named Chromium browser carries the version of the Chromium it RUNS as well as its own. its own
// row is the better answer - those rows record where a build lags its base, which the Chromium
// version cannot say - but a build can never have less than the Chromium under it, and a row is a
// guess about which Chromium that is
function chromiumUnder(target, userAgent, onChromium) {
  if (target === null || target.engine.startsWith('chrome') || EDGE_HTML_TOKEN.test(userAgent)) return null;

  const chromium = CHROMIUM_TOKEN.exec(userAgent)?.groups.version;

  return chromium === undefined ? null : toTarget(onChromium, chromium);
}

// what a string says about its engine when the name says nothing usable
function fromTokens(userAgent, system, onChromium) {
  const chromium = CHROMIUM_TOKEN.exec(userAgent)?.groups.version;

  if (chromium !== undefined) return toTarget(onChromium, chromium);
  if (system !== 'macos' || !/\bSafari\/\d/.test(userAgent)) return null;

  return toTarget('safari', VERSION_TOKEN.exec(userAgent)?.groups.version ?? '');
}

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
      // two signals, and either one can be the stale one. Apple froze the OS token at 18_7 with
      // iOS 26, so `Version/` runs far above it; and an app that writes its OWN version into
      // `Version/` - Apple News does - puts it far below. WebKit is at least the higher of the two,
      // and an in-app WKWebView, which carries no `Version/` at all, is left with the OS token
      const onIOS = toTarget('ios', higher(VERSION_TOKEN.exec(userAgent)?.groups.version,
        IOS_VERSION.exec(userAgent)?.groups.version.replaceAll('_', '.') ?? parsed.os.version));

      // neither signal, so the string did not say iOS in a way anything can act on - a name like
      // `Iphone12 pro max` is what a parser read it out of, and it is an Android phone
      if (onIOS !== null) return onIOS;
    }

    const onChromium = system === 'android' ? 'chrome-android' : 'chrome';
    const engine = (system === 'android' ? ON_ANDROID.get(browser) : null) ?? ENGINES.get(browser);
    // no authoritative version token, no version - the browser's own token is the only thing that
    // carries one, and it is not ours to reconstruct
    const named = engine === undefined ? null : toTarget(engine, parsed.browser.version ?? '');
    const quest = QUEST_TOKEN.exec(userAgent)?.groups.version;
    const trident = TRIDENT_IE.get(TRIDENT_TOKEN.exec(userAgent)?.groups.version);

    // an ENGINE token beats the name beside it, and there are two: a headset that a parser reads as
    // Samsung Internet 4.0, and a browser running Trident, which IS that Internet Explorer whether
    // it says so, says an older one, or calls itself Sleipnir
    const byToken = quest !== undefined ? toTarget('quest', quest)
      : trident !== undefined && (named === null || named.engine !== 'ie' || compareVersions(named.version, trident) < 0)
        ? toTarget('ie', trident)
        : null;

    // a name that arrives with no version behind it did not come from a browser: `Razer Edge 5G` and
    // `motorola edge 30 pro` are read as Microsoft Edge by anything looking for the word, and a name
    // alone cannot be placed on a threshold. What the string still carries is its own engine - the
    // Chromium token, or, on a Mac, a `Version/` beside `Safari/`, which is WebKit's whatever the
    // browser calls itself: Apple allows no other engine there and Chromium writes no `Version/`
    const identified = byToken ?? named ?? fromTokens(userAgent, system, onChromium);

    if (identified === null) return null;

    // a Mac string is what an iPad has sent since iPadOS 13, and what an iPhone sends when asked for
    // the desktop site. Nothing in it says which, and nothing can: Safari sends no client hints. The
    // WebKit is the same version either way, so `ios` is the other row the visitor could be on
    if (identified.engine === 'safari' && system === 'macos') {
      return alsoOn(identified, toTarget('ios', identified.version));
    }

    return alsoOn(identified, chromiumUnder(identified, userAgent, onChromium));
  };
}
