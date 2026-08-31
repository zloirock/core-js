// a year and `immutable`, which the identifier has to be worth - it is the hash of everything that
// decides the bytes
export const CACHE_CONTROL = 'public, max-age=31536000, immutable';
export const CONTENT_TYPE = 'text/javascript; charset=utf-8';

// where the bundles are mounted. configurable, because a fixed path is a path that collides
// with somebody else's
export const ROUTE = '/__core-js';

// our preference when the client's q values tie
export const ENCODING_PREFERENCE = ['br', 'gzip', 'identity'];

// how much of an HTML response is scanned for the place to put the tag. everything that decides
// the place is at the very beginning, and the bound is what lets the rest of the response stream
// through untouched
export const HTML_PREFIX = 4096;

// how many generations of bundles stay on disk beside the one being served. one covers both cases
// that matter: the page of the deploy just replaced is already in a browser and will ask for its
// bundle in a moment, and a rollback finds its bundles where it left them
export const RETAIN = 1;

// how much of a header written by the CLIENT is read at all. past the bound it is not read AT
// ALL, never truncated: a cut `;q=0` or a cut `Version/` changes what the header says rather than
// shortening it
export const HEADER_LIMIT = 1024;
