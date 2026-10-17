// a WRITE whose key is spelled through an enum member names the slot it patches, exactly as the
// four other spellings do: the patched member stops being substitutable while its NEIGHBOUR keeps
// its claim. spelled as an unreadable key the census deopted the whole receiver, and the neighbour
// lost its polyfill with it
enum WriteKeys {
  OF = 'of'
}
Array[WriteKeys.OF] = function () {
  return [9];
};