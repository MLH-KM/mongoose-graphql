/* eslint-disable import/prefer-default-export */
import { find, forOwn, filter, includes, replace } from 'lodash';

import getType from './getType';
import getTypeObjects from './getTypeObjects';
import getTypeTree from './getTypeTree';

export const modelToType = (model, options = {}) => {
  const schema = model.schema;
  const typeTree = getTypeTree(schema.paths);
  const typeObjects = getTypeObjects(options.name || model.modelName, typeTree);

  if (options.extend) {
    forOwn(options.extend, (extension, type) => {
      const typeObject = find(typeObjects, t => t.type === type);
      Object.assign(typeObject.properties, extension);
    });
  }

  // Override refs
  if (options.refs) {
    forOwn(options.refs, (ref, type) => {
      typeObjects.forEach(typeObject => {
        Object.keys(typeObject.properties).forEach(key => {
          if (includes(typeObject.properties[key], type)) {
            typeObject.properties[key] = replace(typeObject.properties[key], type, ref);
          }
        });
      });
    });
  }

  const typeStrings = typeObjects.map(getType);
  return typeStrings.join('\n');
};
