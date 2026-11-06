// `exclude: [/array/y]` is anchored at the start of the module name, where no module spells
// `array`: both reads rewrite to their ponyfills. the sticky flag was once stripped to a bare
// `/array/`, which silently left the array read native
[1].at(0);
'str'.at(-1);
