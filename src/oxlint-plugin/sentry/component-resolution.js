function isSyntaxNode(candidate) {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof Reflect.get(candidate, "type") === "string"
  );
}

function isSyntaxType(candidate, type) {
  return isSyntaxNode(candidate) && candidate.type === type;
}

function fieldOf(candidate, field) {
  return typeof candidate === "object" && candidate !== null
    ? Reflect.get(candidate, field)
    : undefined;
}

function isSyntaxTypeIn(candidate, types) {
  return isSyntaxNode(candidate) && types.has(candidate.type);
}

function syntaxField(node, field) {
  return isSyntaxNode(node) ? fieldOf(node, field) : undefined;
}

function syntaxText(node, field) {
  const text = syntaxField(node, field);
  return typeof text === "string" ? text : null;
}

const TRANSPARENT_EXPRESSION_TYPES = new Set([
  "TSAsExpression",
  "TSNonNullExpression",
  "TSSatisfiesExpression",
]);

export function unwrapExpression(expression) {
  if (isSyntaxType(expression, "ChainExpression")) {
    return syntaxField(expression, "expression");
  }
  if (isSyntaxTypeIn(expression, TRANSPARENT_EXPRESSION_TYPES)) {
    return unwrapExpression(syntaxField(expression, "expression"));
  }
  return expression;
}

const FUNCTION_TYPES = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

export function isFunctionLike(node) {
  return isSyntaxTypeIn(node, FUNCTION_TYPES);
}

function isScopeSource(candidate) {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof Reflect.get(candidate, "getScope") === "function"
  );
}

function isLexicalScope(candidate) {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    Reflect.get(candidate, "set") instanceof Map &&
    "upper" in candidate
  );
}

function isBinding(candidate) {
  return typeof candidate === "object" && candidate !== null;
}

function resolveVariable(sourceCode, reference, name) {
  if (!isScopeSource(sourceCode)) {
    return null;
  }
  let scope = sourceCode.getScope(reference);
  while (isLexicalScope(scope)) {
    const binding = scope.set.get(name);
    if (isBinding(binding)) {
      return binding;
    }
    scope = scope.upper;
  }
  return null;
}

export function findVariable(sourceCode, identifier) {
  if (!isSyntaxType(identifier, "Identifier")) {
    return null;
  }
  const name = syntaxText(identifier, "name");
  return name === null ? null : resolveVariable(sourceCode, identifier, name);
}

function collectJsxLocals(statement, jsxLocals) {
  if (statement.type !== "VariableDeclaration") {
    return;
  }
  for (const declaration of statement.declarations) {
    if (
      declaration.id.type === "Identifier" &&
      containsJsxNode(declaration.init)
    ) {
      jsxLocals.add(declaration.id.name);
    }
  }
}
function returnsJsxExpression(statement, jsxLocals) {
  if (statement.type !== "ReturnStatement") {
    return false;
  }
  if (containsJsxNode(statement.argument)) {
    return true;
  }
  return Boolean(
    statement.argument?.type === "Identifier" &&
    jsxLocals.has(statement.argument.name)
  );
}
function statementsReturnJsx(statements, outerJsxLocals) {
  const jsxLocals = new Set(outerJsxLocals);
  for (const statement of statements) {
    collectJsxLocals(statement, jsxLocals);
    if (statementReturnsJsx(statement, jsxLocals)) {
      return true;
    }
  }
  return false;
}
function statementReturnsJsx(statement, jsxLocals) {
  switch (statement?.type) {
    case "ReturnStatement":
      return returnsJsxExpression(statement, jsxLocals);
    case "BlockStatement":
      return statementsReturnJsx(statement.body, jsxLocals);
    case "IfStatement":
      return (
        statementReturnsJsx(statement.consequent, jsxLocals) ||
        statementReturnsJsx(statement.alternate, jsxLocals)
      );
    case "SwitchStatement":
      return statement.cases.some((switchCase) =>
        statementsReturnJsx(switchCase.consequent, jsxLocals)
      );
    case "TryStatement":
      return (
        statementReturnsJsx(statement.block, jsxLocals) ||
        statementReturnsJsx(statement.handler?.body, jsxLocals) ||
        statementReturnsJsx(statement.finalizer, jsxLocals)
      );
    case "LabeledStatement":
    case "WhileStatement":
    case "DoWhileStatement":
    case "ForStatement":
    case "ForInStatement":
    case "ForOfStatement":
      return statementReturnsJsx(statement.body, jsxLocals);
    default:
      return false;
  }
}
export function functionReturnsJsx(functionNode) {
  if (functionNode?.body.type !== "BlockStatement") {
    return containsJsxNode(functionNode?.body);
  }
  return statementsReturnJsx(functionNode.body.body, new Set());
}
function containsJsxNode(node) {
  if (!isSyntaxNode(node)) {
    return false;
  }
  if (node.type === "JSXElement" || node.type === "JSXFragment") {
    return true;
  }
  if (isFunctionLike(node)) {
    return false;
  }
  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }
    if (Array.isArray(child) && child.some((child) => containsJsxNode(child))) {
      return true;
    }
    if (isSyntaxNode(child) && containsJsxNode(child)) {
      return true;
    }
  }
  return false;
}
