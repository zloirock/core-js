require("core-js/modules/es.array.at");
// The file's only ESM is the entry itself, and this method REMOVES it - so nothing of the author's
// ESM outlives the pass and what is left is CommonJS. The injection follows that, not the statement
// it is about to take away: an `import` here would land in a file no ESM loader would still accept.

module.exports = 1;