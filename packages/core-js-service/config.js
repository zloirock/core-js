// how many generations of bundles stay on disk beside the one being served. one covers both cases
// that matter: the page of the deploy just replaced is already in a browser and will ask for its
// bundle in a moment, and a rollback finds its bundles where it left them
export const RETAIN = 1;

// how much of a header written by the CLIENT is read at all. past the bound it is not read AT
// ALL, never truncated: a cut `;q=0` or a cut `Version/` changes what the header says rather than
// shortening it
export const HEADER_LIMIT = 1024;
