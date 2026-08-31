// how much of a header written by the CLIENT is read at all. past the bound it is not read AT
// ALL, never truncated: a cut `;q=0` or a cut `Version/` changes what the header says rather than
// shortening it
export const HEADER_LIMIT = 1024;
