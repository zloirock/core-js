import Bowser from 'bowser';

export default function parseUserAgent(userAgent) {
  try {
    const { browser, os } = Bowser.parse(userAgent);
    return {
      browser: { name: browser.name ?? null, version: browser.version ?? null },
      os: { name: os.name ?? null, version: os.version ?? null },
    };
  } catch {
    // bowser throws on an empty user agent, which is a visitor rather than an incident: an
    // unrecognized one is an answer the resolver has a branch for
    return null;
  }
}
