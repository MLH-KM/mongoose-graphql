(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lodash'), require('pluralize')) :
  typeof define === 'function' && define.amd ? define(['exports', 'lodash', 'pluralize'], factory) :
  (factory((global.mongooseGraphql = global.mongooseGraphql || {}),global.lodash,global.pluralize));
}(this, (function (exports,lodash,pluralize) { 'use strict';

pluralize = 'default' in pluralize ? pluralize['default'] : pluralize;

/* eslint-disable import/prefer-default-export */

var getType = function getType(typeObject) {
    var typeString = 'type ' + typeObject.type + ' {\n';

    Object.keys(typeObject.properties).sort().forEach(function (key) {
        typeString += '  ' + key + ': ' + typeObject.properties[key] + '\n';
    });

    typeString += '}';

    return typeString;
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





















var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var getTypeObjects = function getTypeObjects(name, typeTree) {
    var typeObjects = [];

    var currentType = {
        type: name,
        properties: {}
    };

    lodash.forOwn(typeTree, function (value, key) {
        var isArray = Array.isArray(value);
        var typeValue = isArray ? value[0] : value;

        var type = void 0;
        if ((typeof typeValue === 'undefined' ? 'undefined' : _typeof(typeValue)) === 'object') {
            var childTypeName = pluralize('' + name + lodash.upperFirst(key), 1);

            // Add the child type objects to the front
            var childTypeObjects = getTypeObjects(childTypeName, typeValue);
            typeObjects = childTypeObjects.concat(typeObjects);

            type = childTypeName;
        } else {
            type = typeValue;
        }

        if (isArray) {
            type = '[' + type + ']';
        }

        currentType.properties[key] = type;
    });

    if (Object.keys(currentType.properties).length > 0) {
        typeObjects.push(currentType);
    }

    return typeObjects;
};

/* eslint-disable no-use-before-define */
var setDescendant = function setDescendant(tree, key, value) {
    var parentTree = tree;

    // Make sure there is an object for each of the ancestors
    // Ex. 'location.address.street1'' -> { location: { address: {} } }
    var splitPath = key.split('.');
    for (var i = 0; i < splitPath.length - 1; i += 1) {
        var ancestor = splitPath[i];
        parentTree[ancestor] = parentTree[ancestor] || {};
        parentTree = parentTree[ancestor];
    }

    var property = splitPath[splitPath.length - 1];
    parentTree[property] = value;
};

var instanceToType = function instanceToType(instance) {
    switch (instance) {
        case 'Boolean':
            return 'Boolean';
        case 'ObjectID':
        case 'String':
            return 'String';
        case 'Date':
        case 'Number':
            return 'Float';
        default:
            throw new Error(instance + ' not implemented yet in instanceToType');
    }
};

var refToType = function refToType(instance) {
    return instance;
};

var arrayToTree = function arrayToTree(path) {
    if (path.caster && path.caster.instance) {
        // If a "ref" is specified (model utilizes Mongoose population), use the ref name or override
        if (path.caster.options && path.caster.options.ref) {
            return [refToType(path.caster.options.ref)];
        }
        return [instanceToType(path.caster.instance)];
    } else if (path.casterConstructor) {
        return [getTypeTree(path.casterConstructor.schema.paths)];
    }

    throw new Error(path + ' is not a supported path');
};

var getTypeTree = function getTypeTree(schemaPaths) {
    var typeTree = {};

    lodash.forOwn(schemaPaths, function (path, key) {
        if (key === '__v') {
            return;
        }

        var value = void 0;

        if (path.instance === 'Array') {
            value = arrayToTree(path);
        } else if (path.instance === 'Embedded') {
            value = getTypeTree(path.caster.schema.paths);
        } else {
            value = path.options && path.options.ref ? refToType(path.options.ref) : instanceToType(path.instance);
        }

        setDescendant(typeTree, key, value);
    });

    return typeTree;
};

/* eslint-disable import/prefer-default-export */
var modelToType = function modelToType(model) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var schema = model.schema;
    var typeTree = getTypeTree(schema.paths);

    // Remove any fields from the typeTree that should be omitted
    if (options.omit) {
        if (Array.isArray(options.omit)) {
            if (options.omit.length) {
                typeTree = lodash.omit(typeTree, options.omit);
            }
        } else {
            console.error('options.omit must be an array');
        }
    }

    var typeObjects = getTypeObjects(options.name || model.modelName, typeTree);

    if (options.extend) {
        lodash.forOwn(options.extend, function (extension, type) {
            var typeObject = lodash.find(typeObjects, function (t) {
                return t.type === type;
            });
            Object.assign(typeObject.properties, extension);
        });
    }

    // Override refs
    if (options.refs) {
        lodash.forOwn(options.refs, function (ref, type) {
            typeObjects.forEach(function (typeObject) {
                Object.keys(typeObject.properties).forEach(function (key) {
                    if (lodash.includes(typeObject.properties[key], type)) {
                        typeObject.properties[key] = lodash.replace(typeObject.properties[key], type, ref);
                    }
                });
            });
        });
    }

    var typeStrings = typeObjects.map(getType);
    return typeStrings.join('\n');
};

exports.modelToType = modelToType;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=mongoose-graphql.js.map
