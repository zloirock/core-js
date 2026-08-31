import { strictEqual } from 'node:assert/strict';
import createResolver from '../../packages/core-js-polyfill-service/internals/domain/resolver.js';
import parseUserAgent from '../../packages/core-js-polyfill-service/internals/infrastructure/ua-bowser.js';

const resolve = createResolver({ parseUserAgent });
function resolveUA(userAgent) {
  return resolve({ 'user-agent': userAgent });
}

const IOS_SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 '
  + '(KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
// no `Version/` token: the browser writes its own instead
const IOS_CHROME = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 '
  + '(KHTML, like Gecko) CriOS/140.0.7339.100 Mobile/15E148 Safari/604.1';
const IOS_IN_APP = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 '
  + '(KHTML, like Gecko) Mobile/15E148 musical_ly_15.9.1 JsSdk/2.0 WKWebView/1';

// on iOS every browser is WKWebView, whatever it calls itself. the parsers answer `Chrome 140`
// here, and handing that to compat as real Chrome builds a bundle far thinner than WebKit needs - a
// broken page, not extra weight
strictEqual(resolveUA(IOS_CHROME), 'ios 18.7', 'resolver-5 #1');
strictEqual(resolveUA(IOS_SAFARI), 'ios 26.1', 'resolver-5 #2');

// the OS token is a lower bound, never a version - Apple froze it at 18_7 with iOS 26, so the live
// version lives in `Version/` alone. both cases above come out of this one rule: on a current device
// the token itself reads 18.7, on an old one it tells the truth
strictEqual(resolveUA(IOS_SAFARI.replace('Version/26.1 ', '')), 'ios 18.7', 'resolver-2 #1');
// an in-app WKWebView carries no `Version/` at all. the OS token is all there is, and building a
// version up from it would hand a thin bundle to what may be an old engine
strictEqual(resolveUA(IOS_IN_APP), 'ios 13.3.1', 'resolver-4 #1');

// the engines the compat data counts separately on Android
const CHROME_DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/143.0.0.0 Safari/537.36';

strictEqual(resolveUA(CHROME_DESKTOP), 'chrome 143.0.0.0', 'resolver #1');
strictEqual(resolveUA('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/143.0.0.0 Mobile Safari/537.36'), 'chrome-android 143.0.0.0', 'resolver #2');
strictEqual(resolveUA('Mozilla/5.0 (Android 14; Mobile; rv:140.0) Gecko/140.0 Firefox/140.0'),
  'firefox-android 140.0', 'resolver #3');
strictEqual(resolveUA('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/140.0.0.0 Mobile Safari/537.36 OPR/95.0.0.0'), 'opera-android 95.0.0.0', 'resolver #4');
strictEqual(resolveUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'), 'edge 143.0.0.0', 'resolver #5');
strictEqual(resolveUA('Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S928B) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) SamsungBrowser/28.0 Chrome/136.0.0.0 Mobile Safari/537.36'),
'samsung 28.0', 'resolver #6');
strictEqual(resolveUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 '
  + '(KHTML, like Gecko) Version/26.2 Safari/605.1.15'), 'safari 26.2', 'resolver #7');
strictEqual(resolveUA('Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko'),
  'ie 11.0', 'resolver #8');

// the Quest UA ends in `SamsungBrowser/4.0`, which a parser that does not know the headset reads
// as Samsung Internet 4.0 - a decade-old engine for a current device
strictEqual(resolveUA('Mozilla/5.0 (X11; Linux x86_64; Quest 3) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'OculusBrowser/39.0.0.0.0 SamsungBrowser/4.0 Chrome/136.0.0.0 VR Safari/537.36'),
'quest 39.0.0.0.0', 'resolver #9');

// a Chromium build under a name of its own - an in-app Android WebView, a derivative browser. the
// `Chrome/` token is the engine's own version, so it outweighs the name we did not recognize
strictEqual(resolveUA('Mozilla/5.0 (Linux; Android 14; SM-A155F Build/UP1A) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Version/4.0 Chrome/139.0.7258.158 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/500.0.0.42.76;]'),
'chrome-android 139.0.7258.158', 'resolver #10');
strictEqual(resolveUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/128.0.0.0 YaBrowser/24.10.0 Safari/537.36'), 'chrome 128.0.0.0', 'resolver #11');

// every failure to identify leads to the baseline, never past it. a confident wrong answer costs a
// missing module; "I do not know" costs a few kilobytes
strictEqual(resolveUA('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'),
  null, 'resolver-1 #1');
strictEqual(resolveUA('x'), null, 'resolver-1 #2');
// bowser throws on an empty user agent, which is a visitor, not an incident
strictEqual(resolveUA(''), null, 'resolver-1 #3');
strictEqual(resolve({}), null, 'resolver-1 #4');
strictEqual(resolve(undefined), null, 'resolver-1 #5');

// the same rule on the size of what the visitor wrote. the string goes into a parser with three
// dozen patterns and this runs once per HTML response, so past the bound it is not read - the same
// answer as any other failure to identify, and it leads to the same baseline
strictEqual(resolveUA(CHROME_DESKTOP + 'x'.repeat(2000)), null, 'resolver-1 #7');
// and a user agent of an ordinary length is still read - real ones are far below the bound
strictEqual(resolveUA(`${ CHROME_DESKTOP } ${ 'x'.repeat(700) }`), 'chrome 143.0.0.0', 'resolver-1 #8');

// the parser is raw material, not the answer: whatever it fails to say, the resolver says nothing
const blind = createResolver({ parseUserAgent: () => null });
const nameless = createResolver({
  parseUserAgent: () => ({ browser: { name: 'Chrome', version: null }, os: { name: 'Windows', version: null } }),
});

strictEqual(blind({ 'user-agent': IOS_SAFARI }), null, 'resolver-1 #6');
strictEqual(nameless({ 'user-agent': 'whatever' }), null, 'resolver-4 #2');
