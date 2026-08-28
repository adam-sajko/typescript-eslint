import rule from '../../src/rules/require-explicit-array-types';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

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

    // Object literal properties with type assertions
    'const obj = { arr: [] as string[] };',
    'const obj = { arr: [] as number[] };',
    'const obj = { arr: new Array<string>() };',

    // Object literal properties with non-empty arrays
    'const obj = { arr: [1, 2, 3] };',
    "const obj = { arr: ['a', 'b'] };",

    // Object literal shorthand and methods
    'const arr: string[] = []; const obj = { arr };',
    'const obj = { add() {} };',

    // Destructuring with array default (not an object literal value)
    'const { arr = [] } = input;',
    'function fn({ arr = [] }) {}',

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

    // Contextually-typed empty arrays: the element type is already known

    // Object literal property inside a typed variable
    'interface Cfg { arr: string[] } const cfg: Cfg = { arr: [] };',
    'const cfg: { arr: string[] } = { arr: [] };',
    'const cfg: { arr: string[] } = { arr: new Array() };',

    // Deeply nested typed object literal
    'const cfg: { outer: { inner: string[] } } = { outer: { inner: [] } };',

    // Function return position
    'function make(): { arr: string[] } { return { arr: [] }; }',
    'const make = (): { arr: string[] } => ({ arr: [] });',

    // Typed array elements
    'const list: { arr: string[] }[] = [{ arr: [] }];',

    // Contextually-typed call argument holding a typed property
    'declare function use(cfg: { arr: string[] }): void; use({ arr: [] });',

    // satisfies provides the contextual type
    'const cfg = { arr: [] } satisfies { arr: string[] };',

    // Contextually-typed variable via a mapped/generic alias
    'type Cfg<T> = { arr: T[] }; const cfg: Cfg<number> = { arr: [] };',
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

    // Object literal property — empty array literal (untyped object)
    {
      code: 'const obj = { arr: [] };',
      errors: [
        {
          messageId: 'missingTypeAnnotationProperty',
          data: { name: 'arr' },
          suggestions: [
            {
              messageId: 'suggestUnknownArrayAssertion',
              output: 'const obj = { arr: [] as unknown[] };',
            },
          ],
        },
      ],
    },

    // Object literal property — new Array()
    {
      code: 'const obj = { arr: new Array() };',
      errors: [
        {
          messageId: 'missingTypeAnnotationNewArrayProperty',
          data: { name: 'arr' },
          suggestions: [
            {
              messageId: 'suggestUnknownArrayAssertion',
              output: 'const obj = { arr: new Array() as unknown[] };',
            },
          ],
        },
      ],
    },

    // Object literal property — Array() call
    {
      code: 'const obj = { arr: Array() };',
      errors: [
        {
          messageId: 'missingTypeAnnotationNewArrayProperty',
          data: { name: 'arr' },
          suggestions: [
            {
              messageId: 'suggestUnknownArrayAssertion',
              output: 'const obj = { arr: Array() as unknown[] };',
            },
          ],
        },
      ],
    },

    // Object literal property — string-literal key
    {
      code: "const obj = { 'my-arr': [] };",
      errors: [
        {
          messageId: 'missingTypeAnnotationProperty',
          data: { name: 'my-arr' },
          suggestions: [
            {
              messageId: 'suggestUnknownArrayAssertion',
              output: "const obj = { 'my-arr': [] as unknown[] };",
            },
          ],
        },
      ],
    },

    // Nested object literal properties (untyped)
    {
      code: 'const obj = { outer: { inner: [] } };',
      errors: [
        {
          messageId: 'missingTypeAnnotationProperty',
          data: { name: 'inner' },
          suggestions: [
            {
              messageId: 'suggestUnknownArrayAssertion',
              output: 'const obj = { outer: { inner: [] as unknown[] } };',
            },
          ],
        },
      ],
    },

    // Multiple properties, mixed typed and untyped
    {
      code: 'const obj = { a: [], b: [] as number[], c: [] };',
      errors: [
        {
          messageId: 'missingTypeAnnotationProperty',
          data: { name: 'a' },
          suggestions: [
            {
              messageId: 'suggestUnknownArrayAssertion',
              output:
                'const obj = { a: [] as unknown[], b: [] as number[], c: [] };',
            },
          ],
        },
        {
          messageId: 'missingTypeAnnotationProperty',
          data: { name: 'c' },
          suggestions: [
            {
              messageId: 'suggestUnknownArrayAssertion',
              output:
                'const obj = { a: [], b: [] as number[], c: [] as unknown[] };',
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
