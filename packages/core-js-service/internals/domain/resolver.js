import { HEADER_LIMIT } from '../../config.js';
import parseAcceptEncoding from './accept-encoding.js';
import { compareVersions, toTarget } from './target.js';

// what the parser calls a browser, in the vocabulary of the compat data; any other name is "I do not know"
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

// the compat data counts the Android builds of these as engines of their own
const ON_ANDROID = new Map([
  ['chrome', 'chrome-android'],
  ['chromium', 'chrome-android'],
  ['firefox', 'firefox-android'],
  ['opera', 'opera-android'],
]);

// the iOS token, read here because the parser knows only its underscored form. The word `OS` and the
// boundary before `iOS` keep out an Android phone called `Iphone12 pro max` and the Gecko of `KaiOS/1.0`
const IOS_SYSTEM_TOKEN = /(?:CPU OS|\biOS|iPhone OS)[ /](?<version>\d+(?:[._]\d+)*)/;
// what WebKit writes in place of the OS since iOS 26 - a lower bound, not the OS
const FROZEN_IOS_VERSIONS = new Set(['18.6', '18.6.2', '18.7']);
// the OS an app read from the system and wrote beside the frozen token. Behind a device model only:
// `GNews iOS/5.104` is the version of an app
const REPORTED_IOS_TOKEN = /\bFBSV\/(?<facebook>\d+(?:\.\d+)*)|\((?:iPad|iPhone)\d+,\d+; iOS (?<model>\d+(?:_\d+)*);/;
// `Version/` is WebKit's only where Safari writes it, after `(KHTML, like Gecko)`: apps write theirs elsewhere
const IOS_SAFARI_VERSION_TOKEN = /\)\s*Version\/(?<version>\d+(?:\.\d+)*)/;
// written by WebKit on an iPhone, an iPad or an iPod, and by nothing else
const APPLE_DEVICE = /\blike Mac OS X\b/;
// the iOS builds of Chrome, Edge, Firefox and Opera, which no other system has
const IOS_BROWSER_TOKEN = /\b(?:CriOS|EdgiOS|FxiOS|OPiOS)\/\d/;
// from 147 on Firefox writes `18_7` as a literal on every device, so what is left is the iOS it installs on
const FIREFOX_IOS_TOKEN = /\bFxiOS\/(?<version>\d+)/;
const FIREFOX_IOS_LITERAL_SINCE = 147;
const FIREFOX_IOS_FLOOR = '15.0';
// the network stack asks for `zstd` from iOS 26.3 on (BCD); 26.2 is an ASSUMPTION nobody has checked on a
// device. TODO: check 26.2, and raise this to 26.3 if it sends no `zstd`
const ZSTD_IOS_SINCE = '26.2';

// Safari's own version, and the WebKit build Apple froze the token at from Safari 11.1 and iOS 11.3 on -
// a floor under any Mac string that carries it, with a `Version/` or without
const SAFARI_VERSION_TOKEN = /\bVersion\/(?<version>\d+(?:\.\d+)*)/;
const FROZEN_WEBKIT = /\bAppleWebKit\/605\.1\.15\b/;
const FROZEN_WEBKIT_SINCE = '11.1';

// the engine's own version under a name nothing knows; LG spells it `Chr0me/` on its televisions
const CHROMIUM_TOKEN = /\bChr[0o]me\/(?<version>\d+(?:\.\d+)*)/;
// EdgeHTML carries a borrowed `Chrome/`; Chromium Edge spells its own token `Edg`, never `Edge`
const EDGE_HTML_TOKEN = /\bEdge\/\d/;
// trusted only beside a `Gecko/` that Gecko could have written - its version, or a real build date
const GECKO_TOKEN = /\brv:(?<version>\d+(?:\.\d+)*)(?:[a-z]\w*)?\) Gecko\/(?<build>\d+(?:\.\d+)*)/;
const GECKO_BUILD_DATE = /^(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])(?:\d{2})?$/;
// the engine of Internet Explorer and of nothing else: `MSIE 7.0` beside `Trident/7.0` is IE 11 in
// compatibility view, a document mode rather than an older JavaScript
const TRIDENT_TOKEN = /\bTrident\/(?<version>\d+\.\d+)/;
const TRIDENT_IE = new Map([['4.0', '8'], ['5.0', '9'], ['6.0', '10'], ['7.0', '11']]);
// the Quest ends in `SamsungBrowser/4.0`, which a parser reads as a decade-old Samsung Internet
const QUEST_TOKEN = /\bOculusBrowser\/(?<version>\d+(?:\.\d+)*)/;
// engines with no row in the compat data, behind the Firefox or Chrome they claim. Not `Flow/`, which ends
// `FlyFlow/` and `FreeFlow/` as well
const UNTRACKED_ENGINE_TOKEN = /\b(?:EkiohFlow|Goanna|Ladybird|Servo)\/\d/;

// the higher of two versions, either of which may be missing
function higher(one, other) {
  if (one === undefined || !/^\d/.test(one)) return other ?? '';
  if (other === undefined || !/^\d/.test(other)) return one;
  return compareVersions(one, other) >= 0 ? one : other;
}

// the WebKit of an iOS string: an OS the string states is the answer - the lower one, where it states
// two - and otherwise the frozen token is a floor that Safari's `Version/` can raise
function iosVersion(userAgent, parsedVersion) {
  const system = IOS_SYSTEM_TOKEN.exec(userAgent)?.groups.version.replaceAll('_', '.') ?? parsedVersion;
  const stated = /^\d/.test(system) && !FROZEN_IOS_VERSIONS.has(system) ? system : undefined;
  const { facebook, model } = REPORTED_IOS_TOKEN.exec(userAgent)?.groups ?? {};
  const reported = facebook ?? model?.replaceAll('_', '.');

  if (stated !== undefined && reported !== undefined) return compareVersions(stated, reported) <= 0 ? stated : reported;

  return stated ?? reported ?? higher(IOS_SAFARI_VERSION_TOKEN.exec(userAgent)?.groups.version, system);
}

// whether the client asked for `zstd` - parsed, so `zstd;q=0` refuses it
function asksForZstd(header) {
  return typeof header == 'string' && header.length <= HEADER_LIMIT && parseAcceptEncoding(header).quality.get('zstd') > 0;
}

// a string the parser placed on iOS, where every browser is WKWebView whatever it calls itself
function onIOS(userAgent, parsedVersion, acceptEncoding) {
  if (Number(FIREFOX_IOS_TOKEN.exec(userAgent)?.groups.version) >= FIREFOX_IOS_LITERAL_SINCE) {
    return toTarget('ios', asksForZstd(acceptEncoding) ? ZSTD_IOS_SINCE : FIREFOX_IOS_FLOOR);
  }

  return toTarget('ios', iosVersion(userAgent, parsedVersion));
}

// the Safari of a Mac string, never below the WebKit build it carries
function onMac(userAgent, version) {
  return toTarget('safari', higher(version, FROZEN_WEBKIT.test(userAgent) ? FROZEN_WEBKIT_SINCE : undefined));
}

// an engine token that outranks the name beside it: the Quest's, and Trident's unless the name is that IE
function fromEngineToken(userAgent, named) {
  const quest = QUEST_TOKEN.exec(userAgent)?.groups.version;

  if (quest !== undefined) return toTarget('quest', quest);

  const trident = TRIDENT_IE.get(TRIDENT_TOKEN.exec(userAgent)?.groups.version);

  if (trident === undefined || (named?.engine === 'ie' && compareVersions(named.version, trident) >= 0)) return null;

  return toTarget('ie', trident);
}

// what a string says about its engine when the name says nothing usable: its Chromium or Gecko token,
// or on a Mac a `Version/` beside `Safari/`, which is WebKit's whatever the browser calls itself
function fromTokens(userAgent, system, onChromium) {
  const chromium = CHROMIUM_TOKEN.exec(userAgent)?.groups.version;

  if (chromium !== undefined) return toTarget(onChromium, chromium);

  const gecko = GECKO_TOKEN.exec(userAgent)?.groups;

  if (gecko !== undefined && (gecko.build.includes('.') || GECKO_BUILD_DATE.test(gecko.build))) {
    return toTarget(system === 'android' ? 'firefox-android' : 'firefox', gecko.version);
  }
  if (system !== 'macos') return null;

  return onMac(userAgent, /\bSafari\/\d/.test(userAgent) ? SAFARI_VERSION_TOKEN.exec(userAgent)?.groups.version : undefined);
}

// the Chromium a named browser runs: its own row is the better answer, but never below what it runs on
function chromiumUnder(target, userAgent, onChromium) {
  if (target === null || target.engine.startsWith('chrome') || EDGE_HTML_TOKEN.test(userAgent)) return null;

  const chromium = CHROMIUM_TOKEN.exec(userAgent)?.groups.version;

  return chromium === undefined ? null : toTarget(onChromium, chromium);
}

// the other row the same visitor could be on - the matcher serves what covers both
function alsoOn(target, other) {
  return target === null || other === null ? target : { ...target, alternate: other };
}

export default function createResolver({ parseUserAgent }) {
  return function resolve(headers) {
    const userAgent = headers?.['user-agent'];

    // "I do not know" is a full answer - the baseline - and a header past the bound is not read at all
    if (typeof userAgent != 'string' || !userAgent || userAgent.length > HEADER_LIMIT) return null;

    const parsed = parseUserAgent(userAgent);

    if (parsed === null || UNTRACKED_ENGINE_TOKEN.test(userAgent)) return null;

    const browser = parsed.browser.name?.toLowerCase() ?? null;
    const system = parsed.os.name?.toLowerCase() ?? null;

    // with no version anywhere, an Apple device is the baseline; anything else is a phone named after one
    if (system === 'ios') {
      const target = onIOS(userAgent, parsed.os.version, headers['accept-encoding']);

      if (target !== null || APPLE_DEVICE.test(userAgent)) return target;
    }

    // an iOS browser in a string that names another system: no version is left, the frozen WebKit is the floor
    if (IOS_BROWSER_TOKEN.test(userAgent)) {
      return toTarget('ios', FROZEN_WEBKIT.test(userAgent) ? FROZEN_WEBKIT_SINCE : '');
    }

    const onChromium = system === 'android' ? 'chrome-android' : 'chrome';
    const engine = (system === 'android' ? ON_ANDROID.get(browser) : null) ?? ENGINES.get(browser);
    // a name with no version behind it was read out of something else - `Razer Edge 5G` - and is no answer
    const named = engine === undefined ? null : toTarget(engine, parsed.browser.version ?? '');
    const identified = fromEngineToken(userAgent, named) ?? named ?? fromTokens(userAgent, system, onChromium);

    if (identified === null) return null;

    // a Mac string comes from an iPad, or an iPhone asked for the desktop site, as often as from a Mac
    if (identified.engine === 'safari' && system === 'macos') {
      const safari = onMac(userAgent, identified.version);

      return alsoOn(safari, toTarget('ios', safari.version));
    }

    return alsoOn(identified, chromiumUnder(identified, userAgent, onChromium));
  };
}
