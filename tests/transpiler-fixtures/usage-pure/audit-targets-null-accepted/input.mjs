// `targets: null` passes validation - an empty/null `targets` clears the
// option rather than being rejected or crashing. matches conditional-spread
// (`{ targets: ci ? cfg : null }`); target resolution then falls back to the
// browserslist project config.
Array.from(x);
