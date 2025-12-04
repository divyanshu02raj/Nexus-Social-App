// src/utils/asArray.ts
function asArray(v) {
  return [].concat(v);
}

// src/utils/is.ts
function isPsuedoSelector(selector) {
  return selector.startsWith(":");
}
function isStyleCondition(selector) {
  return isString(selector) && (selector === "*" || selector.length > 1 && ":>~.+*".includes(selector.slice(0, 1)) || isImmediatePostcondition(selector));
}
function isValidProperty(property, value) {
  return (isString(value) || typeof value === "number") && !isCssVariables(property) && !isPsuedoSelector(property) && !isMediaQuery(property);
}
function isMediaQuery(selector) {
  return selector.startsWith("@media");
}
function isDirectClass(selector) {
  return selector === ".";
}
function isCssVariables(selector) {
  return selector === "--";
}
function isString(value) {
  return value + "" === value;
}
function isImmediatePostcondition(value) {
  return isString(value) && (value.startsWith("&") || isPsuedoSelector(value));
}

// src/utils/joinTruthy.ts
function joinTruthy(arr, delimiter = "") {
  return arr.filter(Boolean).join(delimiter);
}

// src/utils/stableHash.ts
function stableHash(prefix, seed) {
  let hash = 0;
  if (seed.length === 0)
    return hash.toString();
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `${prefix ?? "cl"}_${hash.toString(36)}`;
}

// src/utils/stringManipulators.ts
function handlePropertyValue(property, value) {
  if (property === "content") {
    return `"${value}"`;
  }
  return value;
}
function camelCaseToDash(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function joinedProperty(property, value) {
  return `${property}:${value}`;
}
function toClass(str) {
  return str ? `.${str}` : "";
}
function appendString(base, line) {
  return base ? `${base}
${line}` : line;
}

// src/Rule.ts
var Rule = class _Rule {
  constructor(sheet, property, value, selector) {
    this.sheet = sheet;
    this.property = property;
    this.value = value;
    this.selector = selector;
    this.property = property;
    this.value = value;
    this.joined = joinedProperty(property, value);
    const joinedConditions = this.selector.preconditions.concat(
      this.selector.postconditions
    );
    this.hash = this.selector.hasConditions ? this.selector.scopeClassName : stableHash(this.sheet.name, this.joined);
    this.key = joinTruthy([this.joined, joinedConditions, this.hash]);
  }
  toString() {
    let selectors = mergeSelectors(this.selector.preconditions, {
      right: this.hash
    });
    selectors = mergeSelectors(this.selector.postconditions, {
      left: selectors
    });
    return `${selectors} {${_Rule.genRule(this.property, this.value)}}`;
  }
  static genRule(property, value) {
    const transformedProperty = camelCaseToDash(property);
    return joinedProperty(
      transformedProperty,
      handlePropertyValue(property, value)
    ) + ";";
  }
};
function mergeSelectors(selectors, { left = "", right = "" } = {}) {
  const output = selectors.reduce((selectors2, current) => {
    if (isPsuedoSelector(current)) {
      return selectors2 + current;
    }
    if (isImmediatePostcondition(current)) {
      return selectors2 + current.slice(1);
    }
    return joinTruthy([selectors2, current], " ");
  }, left);
  return joinTruthy([output, toClass(right)], " ");
}
var Selector = class _Selector {
  constructor(sheet, scopeName = null, {
    preconditions,
    postconditions
  } = {}) {
    this.sheet = sheet;
    this.preconditions = [];
    this.scopeClassName = null;
    this.scopeName = null;
    this.postconditions = [];
    this.preconditions = preconditions ? asArray(preconditions) : [];
    this.postconditions = postconditions ? asArray(postconditions) : [];
    this.setScope(scopeName);
  }
  setScope(scopeName) {
    if (!scopeName) {
      return this;
    }
    if (!this.scopeClassName) {
      this.scopeName = scopeName;
      this.scopeClassName = stableHash(
        this.sheet.name,
        // adding the count guarantees uniqueness across style.create calls
        scopeName + this.sheet.count
      );
    }
    return this;
  }
  get hasConditions() {
    return this.preconditions.length > 0 || this.postconditions.length > 0;
  }
  addScope(scopeName) {
    return new _Selector(this.sheet, scopeName, {
      preconditions: this.preconditions,
      postconditions: this.postconditions
    });
  }
  addPrecondition(precondition) {
    return new _Selector(this.sheet, this.scopeClassName, {
      postconditions: this.postconditions,
      preconditions: this.preconditions.concat(precondition)
    });
  }
  addPostcondition(postcondition) {
    return new _Selector(this.sheet, this.scopeClassName, {
      preconditions: this.preconditions,
      postconditions: this.postconditions.concat(postcondition)
    });
  }
  createRule(property, value) {
    return new Rule(this.sheet, property, value, this);
  }
};

// src/Sheet.ts
var Sheet = class {
  constructor(name, rootNode) {
    this.name = name;
    this.rootNode = rootNode;
    // Hash->css
    this.storedStyles = {};
    // styles->hash
    this.storedClasses = {};
    this.style = "";
    this.count = 0;
    this.id = `flairup-${name}`;
    this.styleTag = this.createStyleTag();
  }
  getStyle() {
    return this.style;
  }
  append(css) {
    this.style = appendString(this.style, css);
  }
  apply() {
    this.count++;
    if (!this.styleTag) {
      return;
    }
    this.styleTag.innerHTML = this.style;
  }
  isApplied() {
    return !!this.styleTag;
  }
  createStyleTag() {
    if (typeof document === "undefined" || this.isApplied() || // Explicitly disallow mounting to the DOM
    this.rootNode === null) {
      return this.styleTag;
    }
    const styleTag = document.createElement("style");
    styleTag.type = "text/css";
    styleTag.id = this.id;
    (this.rootNode ?? document.head).appendChild(styleTag);
    return styleTag;
  }
  addRule(rule) {
    const storedClass = this.storedClasses[rule.key];
    if (isString(storedClass)) {
      return storedClass;
    }
    this.storedClasses[rule.key] = rule.hash;
    this.storedStyles[rule.hash] = [rule.property, rule.value];
    this.append(rule.toString());
    return rule.hash;
  }
};

// src/utils/forIn.ts
function forIn(obj, fn) {
  for (const key in obj) {
    fn(key.trim(), obj[key]);
  }
}

// src/cx.ts
function cx(...args) {
  const classes = args.reduce((classes2, arg) => {
    if (arg instanceof Set) {
      classes2.push(...arg);
    } else if (typeof arg === "string") {
      classes2.push(arg);
    } else if (Array.isArray(arg)) {
      classes2.push(cx(...arg));
    } else if (typeof arg === "object") {
      Object.entries(arg).forEach(([key, value]) => {
        if (value) {
          classes2.push(key);
        }
      });
    }
    return classes2;
  }, []);
  return joinTruthy(classes, " ").trim();
}

// src/index.ts
function createSheet(name, rootNode) {
  const sheet = new Sheet(name, rootNode);
  return {
    create,
    getStyle: sheet.getStyle.bind(sheet),
    isApplied: sheet.isApplied.bind(sheet)
  };
  function create(styles) {
    const scopedStyles = {};
    iteratePreconditions(sheet, styles, new Selector(sheet)).forEach(
      ([scopeName, styles2, selector]) => {
        iterateStyles(sheet, styles2, selector).forEach(
          (className) => {
            addScopedStyle(scopeName, className);
          }
        );
      }
    );
    sheet.apply();
    return scopedStyles;
    function addScopedStyle(name2, className) {
      scopedStyles[name2] = scopedStyles[name2] ?? /* @__PURE__ */ new Set();
      scopedStyles[name2].add(className);
    }
  }
}
function iteratePreconditions(sheet, styles, selector) {
  const output = [];
  forIn(styles, (key, value) => {
    if (isStyleCondition(key)) {
      return iteratePreconditions(
        sheet,
        value,
        selector.addPrecondition(key)
      ).forEach((item) => output.push(item));
    }
    output.push([key, styles[key], selector.addScope(key)]);
  });
  return output;
}
function iterateStyles(sheet, styles, selector) {
  const output = /* @__PURE__ */ new Set();
  forIn(styles, (property, value) => {
    let res = [];
    if (isStyleCondition(property)) {
      res = iterateStyles(
        sheet,
        value,
        selector.addPostcondition(property)
      );
    } else if (isDirectClass(property)) {
      res = asArray(value);
    } else if (isMediaQuery(property)) {
      res = handleMediaQuery(sheet, value, property, selector);
    } else if (isCssVariables(property)) {
      res = cssVariablesBlock(sheet, value, selector);
    } else if (isValidProperty(property, value)) {
      const rule = selector.createRule(property, value);
      sheet.addRule(rule);
      output.add(rule.hash);
    }
    return addEachClass(res, output);
  });
  return output;
}
function addEachClass(list, to) {
  list.forEach((className) => to.add(className));
  return to;
}
function cssVariablesBlock(sheet, styles, selector) {
  const classes = /* @__PURE__ */ new Set();
  const chunkRows = [];
  forIn(styles, (property, value) => {
    if (isValidProperty(property, value)) {
      chunkRows.push(Rule.genRule(property, value));
      return;
    }
    const res = iterateStyles(sheet, value ?? {}, selector);
    addEachClass(res, classes);
  });
  if (!selector.scopeClassName) {
    return classes;
  }
  if (chunkRows.length) {
    const output = chunkRows.join(" ");
    sheet.append(
      `${mergeSelectors(selector.preconditions, {
        right: selector.scopeClassName
      })} {${output}}`
    );
  }
  classes.add(selector.scopeClassName);
  return classes;
}
function handleMediaQuery(sheet, styles, mediaQuery, selector) {
  sheet.append(mediaQuery + " {");
  const output = iterateStyles(sheet, styles, selector);
  sheet.append("}");
  return output;
}
export {
  createSheet,
  cx
};
//# sourceMappingURL=index.js.map