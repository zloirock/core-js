import "core-js/modules/es.array.of";
// a call root FORWARDING the real global through an object literal: the shorthand binding IS
// the global constructor, so the method's module still injects - the source text stays verbatim
const forwards = () => ({
  window: {
    Array
  }
});
export const literalForwardedRoot = forwards()?.window?.Array.of(13);