import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import { createRule, getParserServices } from '../util';

export interface Config {
  ignoreMutableVariables?: boolean;
}

export type Options = [Config];
export type MessageIds =
  | 'missingTypeAnnotation'
  | 'missingTypeAnnotationNewArray'
  | 'missingTypeAnnotationProperty'
  | 'missingTypeAnnotationNewArrayProperty'
  | 'suggestUnknownArray'
  | 'suggestUnknownArrayAssertion';

export default createRule<Options, MessageIds>({
  name: 'require-explicit-array-types',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require explicit type annotations for empty arrays for code clarity',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      missingTypeAnnotation:
        'Empty array should have an explicit type annotation for code clarity. Use `{{name}}: Type[] = []` instead.',
      missingTypeAnnotationNewArray:
        'Empty array should have an explicit type annotation for code clarity. Use `{{name}}: Type[] = new Array()` or `{{name}}: Type[] = []` instead.',
      missingTypeAnnotationProperty:
        'Empty array should have an explicit type annotation for code clarity. Use `{{name}}: [] as Type[]` instead.',
      missingTypeAnnotationNewArrayProperty:
        'Empty array should have an explicit type annotation for code clarity. Use `{{name}}: new Array<Type>()` or `{{name}}: [] as Type[]` instead.',
      suggestUnknownArray: 'Add `: unknown[]` type annotation.',
      suggestUnknownArrayAssertion: 'Add `as unknown[]` type assertion.',
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
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isEmptyArrayLiteral(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.ArrayExpression &&
        node.elements.length === 0
      );
    }

    function isEmptyNewArray(node: TSESTree.Node): boolean {
      return (
        (node.type === AST_NODE_TYPES.NewExpression ||
          node.type === AST_NODE_TYPES.CallExpression) &&
        node.callee.type === AST_NODE_TYPES.Identifier &&
        node.callee.name === 'Array' &&
        node.arguments.length === 0 &&
        !node.typeArguments
      );
    }

    // An array with a contextual type already has a known element type, so it
    // does not need an explicit annotation.
    function hasContextualType(node: TSESTree.Node): boolean {
      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      return checker.getContextualType(tsNode as ts.Expression) !== undefined;
    }

    function isUnannotatedEmptyArray(
      node: TSESTree.Node,
    ): { empty: true; isNewArray: boolean } | { empty: false } {
      const isNewArray = isEmptyNewArray(node);
      if (!isEmptyArrayLiteral(node) && !isNewArray) {
        return { empty: false };
      }
      if (hasContextualType(node)) {
        return { empty: false };
      }
      return { empty: true, isNewArray };
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

      const result = isUnannotatedEmptyArray(node.init);
      if (!result.empty) {
        return;
      }

      context.report({
        node,
        messageId: result.isNewArray
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

      if (!node.value) {
        return;
      }

      const result = isUnannotatedEmptyArray(node.value);
      if (!result.empty) {
        return;
      }

      const key = node.key;
      const name =
        key.type === AST_NODE_TYPES.Identifier
          ? key.name
          : key.type === AST_NODE_TYPES.Literal
            ? String(key.value)
            : '(computed)';

      context.report({
        node,
        messageId: result.isNewArray
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

    function checkProperty(node: TSESTree.Property): void {
      // Only object literal properties, not destructuring patterns.
      if (node.parent.type !== AST_NODE_TYPES.ObjectExpression) {
        return;
      }

      // Shorthand (`{ arr }`) and methods (`{ arr() {} }`) cannot hold an
      // empty array literal value, so there is nothing to annotate.
      if (node.shorthand || node.method) {
        return;
      }

      const value = node.value;
      if (value.type === AST_NODE_TYPES.AssignmentPattern) {
        return;
      }

      const result = isUnannotatedEmptyArray(value);
      if (!result.empty) {
        return;
      }

      const key = node.key;
      const name =
        key.type === AST_NODE_TYPES.Identifier
          ? key.name
          : key.type === AST_NODE_TYPES.Literal
            ? String(key.value)
            : '(computed)';

      context.report({
        node,
        messageId: result.isNewArray
          ? 'missingTypeAnnotationNewArrayProperty'
          : 'missingTypeAnnotationProperty',
        data: { name },
        suggest: [
          {
            messageId: 'suggestUnknownArrayAssertion',
            fix(fixer) {
              return fixer.insertTextAfter(value, ' as unknown[]');
            },
          },
        ],
      });
    }

    return {
      AccessorProperty: checkPropertyDefinition,
      Property: checkProperty,
      PropertyDefinition: checkPropertyDefinition,
      VariableDeclarator: checkVariableDeclarator,
    };
  },
});
