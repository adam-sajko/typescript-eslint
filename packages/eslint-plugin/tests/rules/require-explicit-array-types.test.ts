import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/require-explicit-array-types';

const ruleTester = new RuleTester();

ruleTester.run('require-explicit-array-types', rule, {
  valid: [
    // Variable declarations with type annotations
    'const arr: string[] = [];',
    'const arr: number[] = [];',
    'const arr: boolean[] = [];',
    'const arr: any[] = [];',
    'const arr: unknown[] = [];',
    'const arr: Array<string> = [];',
    'const arr: Array<number> = [];',
    'const arr: (string | number)[] = [];',
    'let arr: string[] = [];',
    'var arr: string[] = [];',

    // Non-empty arrays
    'const arr = [1, 2, 3];',
    "const arr = ['a', 'b'];",
    'const arr: number[] = [1, 2, 3];',
    "const arr: string[] = ['a', 'b'];",

    // Non-array assignments
    'const x = 5;',
    "const y = 'hello';",
    'const z = null;',
    'const w = undefined;',

    // Type assertions
    'const arr = [] as string[];',
    'const arr = [] as number[];',

    // Explicit never[]
    'const placeholder: never[] = [];',

    // new Array() with type annotation
    'const arr: string[] = new Array();',
    'const arr: number[] = new Array();',

    // new Array() with type argument
    'const arr = new Array<string>();',

    // new Array with arguments (not empty)
    'const arr = new Array(10);',
    'const arr = new Array(1, 2, 3);',

    // Array() call with type argument
    'const arr = Array<string>();',

    // For-in loops
    `
for (let k in obj) {
}
    `,
    `
for (const key in object) {
}
    `,

    // For-of loops
    `
for (let item of array) {
}
    `,
    `
for (const value of iterable) {
}
    `,

    // Class properties with type annotations
    `
class Foo {
  items: string[] = [];
}
    `,
    `
class Foo {
  items: Array<number> = [];
}
    `,
    `
class Foo {
  items: string[] = new Array();
}
    `,

    // Class properties without initializer
    `
class Foo {
  items: string[];
}
    `,

    // Class properties with non-empty arrays
    `
class Foo {
  items = [1, 2, 3];
}
    `,

    // ignoreMutableVariables: let and var ignored
    {
      code: 'let arr = [];',
      options: [{ ignoreMutableVariables: true }],
    },
    {
      code: 'var arr = [];',
      options: [{ ignoreMutableVariables: true }],
    },
    {
      code: 'let arr = new Array();',
      options: [{ ignoreMutableVariables: true }],
    },
  ],
  invalid: [
    // Basic variable declarations — empty array literal
    {
      code: 'const arr = [];',
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: 'const arr: unknown[] = [];',
            },
          ],
        },
      ],
    },
    {
      code: 'let arr = [];',
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: 'let arr: unknown[] = [];',
            },
          ],
        },
      ],
    },
    {
      code: 'var arr = [];',
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: 'var arr: unknown[] = [];',
            },
          ],
        },
      ],
    },

    // new Array() without type annotation or type argument
    {
      code: 'const arr = new Array();',
      errors: [
        {
          messageId: 'missingTypeAnnotationNewArray',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: 'const arr: unknown[] = new Array();',
            },
          ],
        },
      ],
    },
    {
      code: 'let arr = new Array();',
      errors: [
        {
          messageId: 'missingTypeAnnotationNewArray',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: 'let arr: unknown[] = new Array();',
            },
          ],
        },
      ],
    },

    // Array() call (without new)
    {
      code: 'const arr = Array();',
      errors: [
        {
          messageId: 'missingTypeAnnotationNewArray',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: 'const arr: unknown[] = Array();',
            },
          ],
        },
      ],
    },

    // Multiple declarations
    {
      code: `
const items = [];
const data = [];
      `,
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: `
const items: unknown[] = [];
const data = [];
      `,
            },
          ],
        },
        {
          messageId: 'missingTypeAnnotation',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: `
const items = [];
const data: unknown[] = [];
      `,
            },
          ],
        },
      ],
    },

    // Nested scopes
    {
      code: `
function test() {
  const local = [];
}
      `,
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: `
function test() {
  const local: unknown[] = [];
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
if (true) {
  const arr = [];
}
      `,
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: `
if (true) {
  const arr: unknown[] = [];
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
for (let i = 0; i < 10; i++) {
  const items = [];
}
      `,
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: `
for (let i = 0; i < 10; i++) {
  const items: unknown[] = [];
}
      `,
            },
          ],
        },
      ],
    },

    // Mixed typed and untyped
    {
      code: `
const a = [];
const b: number[] = [];
const c = [];
      `,
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          data: { name: 'a' },
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: `
const a: unknown[] = [];
const b: number[] = [];
const c = [];
      `,
            },
          ],
        },
        {
          messageId: 'missingTypeAnnotation',
          data: { name: 'c' },
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: `
const a = [];
const b: number[] = [];
const c: unknown[] = [];
      `,
            },
          ],
        },
      ],
    },

    // Class properties without type annotation
    {
      code: `
class Foo {
  items = [];
}
      `,
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: `
class Foo {
  items: unknown[] = [];
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
class Foo {
  items = new Array();
}
      `,
      errors: [
        {
          messageId: 'missingTypeAnnotationNewArray',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: `
class Foo {
  items: unknown[] = new Array();
}
      `,
            },
          ],
        },
      ],
    },

    // Multiple class properties
    {
      code: `
class Foo {
  a = [];
  b: string[] = [];
  c = [];
}
      `,
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          data: { name: 'a' },
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: `
class Foo {
  a: unknown[] = [];
  b: string[] = [];
  c = [];
}
      `,
            },
          ],
        },
        {
          messageId: 'missingTypeAnnotation',
          data: { name: 'c' },
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: `
class Foo {
  a = [];
  b: string[] = [];
  c: unknown[] = [];
}
      `,
            },
          ],
        },
      ],
    },

    // ignoreMutableVariables still flags const
    {
      code: 'const arr = [];',
      options: [{ ignoreMutableVariables: true }],
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: 'const arr: unknown[] = [];',
            },
          ],
        },
      ],
    },
    {
      code: 'const arr = new Array();',
      options: [{ ignoreMutableVariables: true }],
      errors: [
        {
          messageId: 'missingTypeAnnotationNewArray',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: 'const arr: unknown[] = new Array();',
            },
          ],
        },
      ],
    },

    // ignoreMutableVariables still flags class properties
    {
      code: `
class Foo {
  items = [];
}
      `,
      options: [{ ignoreMutableVariables: true }],
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: `
class Foo {
  items: unknown[] = [];
}
      `,
            },
          ],
        },
      ],
    },

    // Usage with push (still flags)
    {
      code: `
const arr = [];
arr.push(1);
      `,
      errors: [
        {
          messageId: 'missingTypeAnnotation',
          suggestions: [
            {
              messageId: 'suggestUnknownArray',
              output: `
const arr: unknown[] = [];
arr.push(1);
      `,
            },
          ],
        },
      ],
    },
  ],
});
