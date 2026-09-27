import "core-js/modules/es.string.at";
// @flow
// An absent callable field can select the string fallback; its optional marker must survive.
declare class C {
  m?: () => number[]
}
(new C().m || "abc").at(0);