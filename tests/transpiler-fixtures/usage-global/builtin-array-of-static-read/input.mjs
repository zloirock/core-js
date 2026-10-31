// Following values returned by builtins is deferred.
// Global injects Array.of and Map, but leaves the later groupBy read without its polyfill.
const b = Array.of(Map);
const result = typeof b[0].groupBy;
