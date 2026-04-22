// barrel re-export - preserves external import surface while logic lives in focused modules
export {
  ESM_MARKER_TYPES,
  TS_EXPR_WRAPPERS,
  createTypeAnnotationChecker,
  declaresRequireBinding,
  detectCommonJS,
  getSuperTypeArgs,
  getTypeArgs,
  hasTopLevelESM,
  isDeleteTarget,
  isForXWriteTarget,
  isASTNode,
  isFunctionParamDestructureParent,
  isSingleNestedProxyChain,
  isTSTypeOnlyIdentifier,
  isTaggedTemplateTag,
  isUpdateTarget,
  kebabToCamel,
  kebabToPascal,
  mayHaveSideEffects,
  singleQuasiString,
  unwrapExportedDeclaration,
  unwrapParens,
  walkPatternIdentifiers,
} from './helpers/ast-patterns.js';
export {
  findUniqueName,
  isEntryPattern,
  isModulePattern,
  patternToRegExp,
  toStatelessRegExp,
  validatePatternList,
} from './helpers/pattern-matching.js';
export {
  POSSIBLE_GLOBAL_OBJECTS,
  buildSuperStaticMeta,
  createClassHelpers,
  globalProxyMemberName,
  resolveSuperImportName,
  symbolKeyToEntry,
} from './helpers/class-walk.js';
export {
  isCoreJSFile,
  lookupEntryModules,
  resolveImportPath,
  stripQueryHash,
} from './helpers/path-normalize.js';
export {
  buildOffsetToLine,
  mergeVisitors,
  parseDisableDirectives,
} from './helpers/source-scan.js';
