import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/require-explicit-array-types';

const ruleTester = new RuleTester();

ruleTester.run('require-explicit-array-types', rule, {
  valid: [
    // With type annotations
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

    // Non-empty arrays (should not trigger)
    'const arr = [1, 2, 3];',
    "const arr = ['a', 'b'];",

    // Arrays with type annotation and elements
    'const arr: number[] = [1, 2, 3];',
    "const arr: string[] = ['a', 'b'];",

    // Non-array assignments
    'const x = 5;',
    "const y = 'hello';",
    'const z = null;',
    'const w = undefined;',

    // Array with type assertion
    'const arr = [] as string[];',
    'const arr = [] as number[];',

    // Explicit never[] type (intentional placeholder)
    'const placeholder: never[] = [];',

    // For-in loops (init is null, should not trigger)
    `
for (let k in obj) {
}
    `,
    `
for (const key in object) {
}
    `,
    `
for (var prop in obj) {
}
    `,

    // For-of loops (init is null, should not trigger)
    `
for (let item of array) {
}
    `,
    `
for (const value of iterable) {
}
    `,
    `
for (var element of collection) {
}
    `,
  ],
  invalid: [
    {
      code: 'const arr = [];',
      errors: [
        {
          data: {
            kind: 'const',
            name: 'arr',
          },
          messageId: 'missingTypeAnnotation',
        },
      ],
    },
    {
      code: 'let arr = [];',
      errors: [
        {
          data: {
            kind: 'let',
            name: 'arr',
          },
          messageId: 'missingTypeAnnotation',
        },
      ],
    },
    {
      code: 'var arr = [];',
      errors: [
        {
          data: {
            kind: 'var',
            name: 'arr',
          },
          messageId: 'missingTypeAnnotation',
        },
      ],
    },
    {
      code: `
        const items = [];
        const data = [];
      `,
      errors: [
        {
          data: {
            kind: 'const',
            name: 'items',
          },
          messageId: 'missingTypeAnnotation',
        },
        {
          data: {
            kind: 'const',
            name: 'data',
          },
          messageId: 'missingTypeAnnotation',
        },
      ],
    },
    {
      code: `
        const arr = [];
        arr.push(1);
      `,
      errors: [
        {
          data: {
            kind: 'const',
            name: 'arr',
          },
          messageId: 'missingTypeAnnotation',
        },
      ],
    },
    {
      code: `
        function test() {
          const local = [];
        }
      `,
      errors: [
        {
          data: {
            kind: 'const',
            name: 'local',
          },
          messageId: 'missingTypeAnnotation',
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
          data: {
            kind: 'const',
            name: 'arr',
          },
          messageId: 'missingTypeAnnotation',
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
          data: {
            kind: 'const',
            name: 'items',
          },
          messageId: 'missingTypeAnnotation',
        },
      ],
    },
    {
      code: `
        const a = [];
        const b: number[] = [];
        const c = [];
      `,
      errors: [
        {
          data: {
            kind: 'const',
            name: 'a',
          },
          messageId: 'missingTypeAnnotation',
        },
        {
          data: {
            kind: 'const',
            name: 'c',
          },
          messageId: 'missingTypeAnnotation',
        },
      ],
    },
  ],
});
