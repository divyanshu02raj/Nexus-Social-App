"use strict";
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = function(target, all) {
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
var __copyProps = function(to, from, except, desc) {
    if (from && typeof from === "object" || typeof from === "function") {
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            var _loop = function() {
                var key = _step.value;
                if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
                    get: function() {
                        return from[key];
                    },
                    enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
                });
            };
            for(var _iterator = __getOwnPropNames(from)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    return to;
};
var __toCommonJS = function(mod) {
    return __copyProps(__defProp({}, "__esModule", {
        value: true
    }), mod);
};
// src/index.ts
var src_exports = {};
__export(src_exports, {
    createSheet: function() {
        return createSheet;
    },
    cx: function() {
        return cx;
    }
});
module.exports = __toCommonJS(src_exports);
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
function joinTruthy(arr) {
    var delimiter = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return arr.filter(Boolean).join(delimiter);
}
// src/utils/stableHash.ts
function stableHash(prefix, seed) {
    var hash = 0;
    if (seed.length === 0) return hash.toString();
    for(var i = 0; i < seed.length; i++){
        var char = seed.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return "".concat(prefix !== null && prefix !== void 0 ? prefix : "cl", "_").concat(hash.toString(36));
}
// src/utils/stringManipulators.ts
function handlePropertyValue(property, value) {
    if (property === "content") {
        return '"'.concat(value, '"');
    }
    return value;
}
function camelCaseToDash(str) {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function joinedProperty(property, value) {
    return "".concat(property, ":").concat(value);
}
function toClass(str) {
    return str ? ".".concat(str) : "";
}
function appendString(base, line) {
    return base ? "".concat(base, "\n").concat(line) : line;
}
// src/Rule.ts
var Rule = /*#__PURE__*/ function() {
    function _Rule(sheet, property, value, selector) {
        _class_call_check(this, _Rule);
        this.sheet = sheet;
        this.property = property;
        this.value = value;
        this.selector = selector;
        this.property = property;
        this.value = value;
        this.joined = joinedProperty(property, value);
        var joinedConditions = this.selector.preconditions.concat(this.selector.postconditions);
        this.hash = this.selector.hasConditions ? this.selector.scopeClassName : stableHash(this.sheet.name, this.joined);
        this.key = joinTruthy([
            this.joined,
            joinedConditions,
            this.hash
        ]);
    }
    _create_class(_Rule, [
        {
            key: "toString",
            value: function toString() {
                var selectors = mergeSelectors(this.selector.preconditions, {
                    right: this.hash
                });
                selectors = mergeSelectors(this.selector.postconditions, {
                    left: selectors
                });
                return "".concat(selectors, " {").concat(_Rule.genRule(this.property, this.value), "}");
            }
        }
    ], [
        {
            key: "genRule",
            value: function genRule(property, value) {
                var transformedProperty = camelCaseToDash(property);
                return joinedProperty(transformedProperty, handlePropertyValue(property, value)) + ";";
            }
        }
    ]);
    return _Rule;
}();
function mergeSelectors(selectors) {
    var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _ref_left = _ref.left, left = _ref_left === void 0 ? "" : _ref_left, _ref_right = _ref.right, right = _ref_right === void 0 ? "" : _ref_right;
    var output = selectors.reduce(function(selectors2, current) {
        if (isPsuedoSelector(current)) {
            return selectors2 + current;
        }
        if (isImmediatePostcondition(current)) {
            return selectors2 + current.slice(1);
        }
        return joinTruthy([
            selectors2,
            current
        ], " ");
    }, left);
    return joinTruthy([
        output,
        toClass(right)
    ], " ");
}
var Selector = /*#__PURE__*/ function() {
    function _Selector(sheet) {
        var scopeName = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null, _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, preconditions = _ref.preconditions, postconditions = _ref.postconditions;
        _class_call_check(this, _Selector);
        this.sheet = sheet;
        this.preconditions = [];
        this.scopeClassName = null;
        this.scopeName = null;
        this.postconditions = [];
        this.preconditions = preconditions ? asArray(preconditions) : [];
        this.postconditions = postconditions ? asArray(postconditions) : [];
        this.setScope(scopeName);
    }
    _create_class(_Selector, [
        {
            key: "setScope",
            value: function setScope(scopeName) {
                if (!scopeName) {
                    return this;
                }
                if (!this.scopeClassName) {
                    this.scopeName = scopeName;
                    this.scopeClassName = stableHash(this.sheet.name, // adding the count guarantees uniqueness across style.create calls
                    scopeName + this.sheet.count);
                }
                return this;
            }
        },
        {
            key: "hasConditions",
            get: function get() {
                return this.preconditions.length > 0 || this.postconditions.length > 0;
            }
        },
        {
            key: "addScope",
            value: function addScope(scopeName) {
                return new _Selector(this.sheet, scopeName, {
                    preconditions: this.preconditions,
                    postconditions: this.postconditions
                });
            }
        },
        {
            key: "addPrecondition",
            value: function addPrecondition(precondition) {
                return new _Selector(this.sheet, this.scopeClassName, {
                    postconditions: this.postconditions,
                    preconditions: this.preconditions.concat(precondition)
                });
            }
        },
        {
            key: "addPostcondition",
            value: function addPostcondition(postcondition) {
                return new _Selector(this.sheet, this.scopeClassName, {
                    preconditions: this.preconditions,
                    postconditions: this.postconditions.concat(postcondition)
                });
            }
        },
        {
            key: "createRule",
            value: function createRule(property, value) {
                return new Rule(this.sheet, property, value, this);
            }
        }
    ]);
    return _Selector;
}();
// src/Sheet.ts
var Sheet = /*#__PURE__*/ function() {
    function Sheet(name, rootNode) {
        _class_call_check(this, Sheet);
        this.name = name;
        this.rootNode = rootNode;
        // Hash->css
        this.storedStyles = {};
        // styles->hash
        this.storedClasses = {};
        this.style = "";
        this.count = 0;
        this.id = "flairup-".concat(name);
        this.styleTag = this.createStyleTag();
    }
    _create_class(Sheet, [
        {
            key: "getStyle",
            value: function getStyle() {
                return this.style;
            }
        },
        {
            key: "append",
            value: function append(css) {
                this.style = appendString(this.style, css);
            }
        },
        {
            key: "apply",
            value: function apply() {
                this.count++;
                if (!this.styleTag) {
                    return;
                }
                this.styleTag.innerHTML = this.style;
            }
        },
        {
            key: "isApplied",
            value: function isApplied() {
                return !!this.styleTag;
            }
        },
        {
            key: "createStyleTag",
            value: function createStyleTag() {
                if (typeof document === "undefined" || this.isApplied() || // Explicitly disallow mounting to the DOM
                this.rootNode === null) {
                    return this.styleTag;
                }
                var styleTag = document.createElement("style");
                styleTag.type = "text/css";
                styleTag.id = this.id;
                var _this_rootNode;
                ((_this_rootNode = this.rootNode) !== null && _this_rootNode !== void 0 ? _this_rootNode : document.head).appendChild(styleTag);
                return styleTag;
            }
        },
        {
            key: "addRule",
            value: function addRule(rule) {
                var storedClass = this.storedClasses[rule.key];
                if (isString(storedClass)) {
                    return storedClass;
                }
                this.storedClasses[rule.key] = rule.hash;
                this.storedStyles[rule.hash] = [
                    rule.property,
                    rule.value
                ];
                this.append(rule.toString());
                return rule.hash;
            }
        }
    ]);
    return Sheet;
}();
// src/utils/forIn.ts
function forIn(obj, fn) {
    for(var key in obj){
        fn(key.trim(), obj[key]);
    }
}
// src/cx.ts
function cx() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    var classes = args.reduce(function(classes2, arg) {
        if (_instanceof(arg, Set)) {
            var _classes2;
            (_classes2 = classes2).push.apply(_classes2, _to_consumable_array(arg));
        } else if (typeof arg === "string") {
            classes2.push(arg);
        } else if (Array.isArray(arg)) {
            classes2.push(cx.apply(void 0, _to_consumable_array(arg)));
        } else if (typeof arg === "object") {
            Object.entries(arg).forEach(function(param) {
                var _param = _sliced_to_array(param, 2), key = _param[0], value = _param[1];
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
    var sheet = new Sheet(name, rootNode);
    return {
        create: create,
        getStyle: sheet.getStyle.bind(sheet),
        isApplied: sheet.isApplied.bind(sheet)
    };
    function create(styles) {
        var scopedStyles = {};
        iteratePreconditions(sheet, styles, new Selector(sheet)).forEach(function(param) {
            var _param = _sliced_to_array(param, 3), scopeName = _param[0], styles2 = _param[1], selector = _param[2];
            iterateStyles(sheet, styles2, selector).forEach(function(className) {
                addScopedStyle(scopeName, className);
            });
        });
        sheet.apply();
        return scopedStyles;
        function addScopedStyle(name2, className) {
            var _scopedStyles_name2;
            scopedStyles[name2] = (_scopedStyles_name2 = scopedStyles[name2]) !== null && _scopedStyles_name2 !== void 0 ? _scopedStyles_name2 : /* @__PURE__ */ new Set();
            scopedStyles[name2].add(className);
        }
    }
}
function iteratePreconditions(sheet, styles, selector) {
    var output = [];
    forIn(styles, function(key, value) {
        if (isStyleCondition(key)) {
            return iteratePreconditions(sheet, value, selector.addPrecondition(key)).forEach(function(item) {
                return output.push(item);
            });
        }
        output.push([
            key,
            styles[key],
            selector.addScope(key)
        ]);
    });
    return output;
}
function iterateStyles(sheet, styles, selector) {
    var output = /* @__PURE__ */ new Set();
    forIn(styles, function(property, value) {
        var res = [];
        if (isStyleCondition(property)) {
            res = iterateStyles(sheet, value, selector.addPostcondition(property));
        } else if (isDirectClass(property)) {
            res = asArray(value);
        } else if (isMediaQuery(property)) {
            res = handleMediaQuery(sheet, value, property, selector);
        } else if (isCssVariables(property)) {
            res = cssVariablesBlock(sheet, value, selector);
        } else if (isValidProperty(property, value)) {
            var rule = selector.createRule(property, value);
            sheet.addRule(rule);
            output.add(rule.hash);
        }
        return addEachClass(res, output);
    });
    return output;
}
function addEachClass(list, to) {
    list.forEach(function(className) {
        return to.add(className);
    });
    return to;
}
function cssVariablesBlock(sheet, styles, selector) {
    var classes = /* @__PURE__ */ new Set();
    var chunkRows = [];
    forIn(styles, function(property, value) {
        if (isValidProperty(property, value)) {
            chunkRows.push(Rule.genRule(property, value));
            return;
        }
        var res = iterateStyles(sheet, value !== null && value !== void 0 ? value : {}, selector);
        addEachClass(res, classes);
    });
    if (!selector.scopeClassName) {
        return classes;
    }
    if (chunkRows.length) {
        var output = chunkRows.join(" ");
        sheet.append("".concat(mergeSelectors(selector.preconditions, {
            right: selector.scopeClassName
        }), " {").concat(output, "}"));
    }
    classes.add(selector.scopeClassName);
    return classes;
}
function handleMediaQuery(sheet, styles, mediaQuery, selector) {
    sheet.append(mediaQuery + " {");
    var output = iterateStyles(sheet, styles, selector);
    sheet.append("}");
    return output;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
    createSheet: createSheet,
    cx: cx
});
//# sourceMappingURL=index.js.map