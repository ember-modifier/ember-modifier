'use strict';

module.exports = {
  description: 'Generates a modifier.',
  shouldTransformTypeScript: true,

  availableOptions: [
    {
      name: 'modifier-type',
      type: ['function', 'class'],
      default: 'function',
      aliases: [
        { f: 'function' },
        { s: 'class' },
        { function: 'function' },
        { functional: 'function' },
        { class: 'class' },
      ],
    },
  ],

  fileMapTokens() {
    return {
      __collection__() {
        return 'modifiers';
      },
    };
  },

  normalizeEntityName(entityName) {
    if (entityName === undefined) {
      throw new Error('Please provide a name for the modifier.');
    }

    return entityName.replace(/\.js$/, '');
  },

  locals(options) {
    const modifierType = options.modifierType || 'function';
    return { modifierType };
  },
};
