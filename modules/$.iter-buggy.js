// Safari has buggy iterators w/o `next`
module.exports = 'keys' in [] && !('next' in [].keys());