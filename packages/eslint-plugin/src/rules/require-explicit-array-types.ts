import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

import { createRule } from '../util';

export interface Config {
  ignoreMutableVariables?: boolean;
}

export type Options = [Config];
export type MessageIds =
  | 'missingTypeAnnotation'
  | 'missingTypeAnnotationNewArray'
  | 'suggestUnknownArray';

export default createRule<Options, MessageIds>({
  name: 'require-explicit-array-types',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require explicit type annotations for empty arrays for code clarity',
    },
    hasSuggestions: true,
    messages: {
      missingTypeAnnotation:
        'Empty array should have an explicit type annotation for code clarity. Use `{{name}}: Type[] = []` instead.',
      missingTypeAnnotationNewArray:
        'Empty array should have an explicit type annotation for code clarity. Use `{{name}}: Type[] = new Array()` or `{{name}}: Type[] = []` instead.',
      suggestUnknownArray: 'Add `: unknown[]` type annotation.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          ignoreMutableVariables: {
            type: 'boolean',
            description:
              'Whether to ignore `let` and `var` declarations, since their type will evolve as elements are added.',
          },
        },
      },
    ],
  },
  defaultOptions: [{ ignoreMutableVariables: false }],
  create(context, [option]) {
    function isEmptyArrayLiteral(node: TSESTree.Expression): boolean {
      return (
        node.type === AST_NODE_TYPES.ArrayExpression &&
        node.elements.length === 0
      );
    }

    function isEmptyNewArray(node: TSESTree.Expression): boolean {
      return (
        (node.type === AST_NODE_TYPES.NewExpression ||
          node.type === AST_NODE_TYPES.CallExpression) &&
        node.callee.type === AST_NODE_TYPES.Identifier &&
        node.callee.name === 'Array' &&
        node.arguments.length === 0 &&
        !node.typeArguments
      );
    }

    function checkVariableDeclarator(node: TSESTree.VariableDeclarator): void {
      const id = node.id;
      if (id.type !== AST_NODE_TYPES.Identifier || id.typeAnnotation) {
        return;
      }

      if (!node.init) {
        return;
      }

      if (option.ignoreMutableVariables && node.parent.kind !== 'const') {
        return;
      }

      const isNewArray = isEmptyNewArray(node.init);
      if (!isEmptyArrayLiteral(node.init) && !isNewArray) {
        return;
      }

      context.report({
        node,
        messageId: isNewArray
          ? 'missingTypeAnnotationNewArray'
          : 'missingTypeAnnotation',
        data: { name: id.name },
        suggest: [
          {
            messageId: 'suggestUnknownArray',
            fix(fixer) {
              return fixer.insertTextAfter(id, ': unknown[]');
            },
          },
        ],
      });
    }

    function checkPropertyDefinition(
      node: TSESTree.PropertyDefinition | TSESTree.AccessorProperty,
    ): void {
      if (node.typeAnnotation) {
        return;
      }

      if (
        !node.value ||
        (!isEmptyArrayLiteral(node.value) && !isEmptyNewArray(node.value))
      ) {
        return;
      }

      const key = node.key;
      const name =
        key.type === AST_NODE_TYPES.Identifier
          ? key.name
          : key.type === AST_NODE_TYPES.Literal
            ? String(key.value)
            : '(computed)';

      const isNewArray = isEmptyNewArray(node.value);

      context.report({
        node,
        messageId: isNewArray
          ? 'missingTypeAnnotationNewArray'
          : 'missingTypeAnnotation',
        data: { name },
        suggest:
          key.type === AST_NODE_TYPES.Identifier
            ? [
                {
                  messageId: 'suggestUnknownArray',
                  fix(fixer) {
                    return fixer.insertTextAfter(key, ': unknown[]');
                  },
                },
              ]
            : [],
      });
    }

    return {
      AccessorProperty: checkPropertyDefinition,
      PropertyDefinition: checkPropertyDefinition,
      VariableDeclarator: checkVariableDeclarator,
    };
  },
});
