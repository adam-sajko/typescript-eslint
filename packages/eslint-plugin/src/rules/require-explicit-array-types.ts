import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

export type Options = [];
export type MessageIds = 'missingTypeAnnotation';

export default createRule<Options, MessageIds>({
  name: 'require-explicit-array-types',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require explicit type annotations for empty arrays assigned to variables for code clarity',
    },
    messages: {
      missingTypeAnnotation:
        'Empty array assigned to variable should have an explicit type annotation for code clarity. Use `{{kind}} {{name}}: Type[] = []` instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      VariableDeclarator(node) {
        const id = node.id;
        if (id.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        if (
          node.init &&
          node.init.type === AST_NODE_TYPES.ArrayExpression &&
          node.init.elements.length === 0 &&
          !id.typeAnnotation
        ) {
          const kind = node.parent.kind;

          context.report({
            node,
            messageId: 'missingTypeAnnotation',
            data: {
              name: id.name,
              kind,
            },
          });
        }
      },
    };
  },
});
