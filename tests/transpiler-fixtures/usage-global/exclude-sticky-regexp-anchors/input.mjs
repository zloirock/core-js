// `exclude: [/array/y]` is anchored at the start of the module name, where no module spells
// `array`: both polyfills stay injected. the sticky flag was once stripped to a bare `/array/`,
// which silently dropped `es.array.at`
[1].at(0);
'str'.at(-1);
