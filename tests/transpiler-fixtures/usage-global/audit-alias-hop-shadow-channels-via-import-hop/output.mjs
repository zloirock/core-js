// an IMPORT hop could be any module value - the chain stays unresolved
import importedRoot from "./somewhere";
const importLink = importedRoot;
export function viaImportHop() {
  const {
    race
  } = importLink;
  return race([]);
}