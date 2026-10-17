import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.to-reversed";
// A deleted member standing past a `!` over a claim hides nothing from usage detection: the claim
// below the assertion pulls its modules as it would without it, whether a paren seals the chain
// under the deleted member or not.
declare const boxes: {
  k?: number;
  j?: {
    k?: number;
  };
}[] | null;
delete boxes?.at(-1)!.k;
delete boxes?.findLast(Boolean)!!.j!.k;
delete (boxes?.toReversed())!.k;