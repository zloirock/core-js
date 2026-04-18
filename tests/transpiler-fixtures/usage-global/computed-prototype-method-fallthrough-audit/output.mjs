import "core-js/modules/es.array.at";
// Computed `Array['prototype']['at']` should resolve identically to the dotted form and
// inject only `es.array.at`. The Array.prototype.X shortcut in `buildMemberMeta` requires
// `!obj.computed && obj.property.type === 'Identifier' && obj.property.name === 'prototype'`,
// so the computed form skips the shortcut and falls back to the unknown-receiver path,
// adding `es.string.at` on top of `es.array.at`
Array['prototype']['at'];