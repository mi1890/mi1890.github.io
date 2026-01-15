---
title: "TypeScript 进阶指南"
date: "2024-01-20"
tags: ["TypeScript", "JavaScript", "类型系统"]
excerpt: "深入理解 TypeScript 的高级特性，包括泛型、条件类型、映射类型等，提升代码的类型安全性。"
---

# TypeScript 进阶指南

TypeScript 作为 JavaScript 的超集，为前端开发带来了强大的类型系统。掌握其高级特性对于构建大型项目至关重要。

## 泛型 (Generics)

### 基础泛型

```typescript
// 基础泛型函数
function identity<T>(arg: T): T {
  return arg;
}

// 使用
const result = identity<string>("hello");
const number = identity<number>(42);

// 泛型接口
interface GenericIdentityFn<T> {
  (arg: T): T;
}

let myIdentity: GenericIdentityFn<number> = identity;
```

### 约束泛型

```typescript
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

// 正确
loggingIdentity("hello");
loggingIdentity([1, 2, 3]);

// 错误：number 没有 length 属性
// loggingIdentity(3);
```

### 高级泛型模式

```typescript
// 映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
}

// 条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

// 工具类型组合
type PartialReadonly<T> = Partial<Readonly<T>>;
```

## 高级类型

### 联合类型和交叉类型

```typescript
// 联合类型
type StringOrNumber = string | number;

// 交叉类型
interface Colorful {
  color: string;
}

interface Circle {
  radius: number;
}

type ColorfulCircle = Colorful & Circle;

const cc: ColorfulCircle = {
  color: "red",
  radius: 42,
};
```

### 字面量类型

```typescript
// 字符串字面量类型
type Theme = "light" | "dark" | "auto";

// 数字字面量类型
type Dice = 1 | 2 | 3 | 4 | 5 | 6;

// 模板字面量类型
type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";

type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
// "welcome_email_id" | "email_heading_id" | "footer_title_id" | "footer_sendoff_id"
```

## 实用工具类型

### 内置工具类型

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Partial - 所有属性可选
type PartialUser = Partial<User>;

// Required - 所有属性必需
type RequiredUser = Required<PartialUser>;

// Pick - 选择特定属性
type UserSummary = Pick<User, "id" | "name">;

// Omit - 排除特定属性
type UserWithoutAge = Omit<User, "age">;

// Record - 创建对象类型
type UserRoles = Record<string, User>;
```

### 自定义工具类型

```typescript
// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
}

// 可空类型
type Nullable<T> = T | null;

// 函数参数类型
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

// 函数返回类型
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

## 条件类型

### 基础条件类型

```typescript
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";

type T0 = TypeName<string>;  // "string"
type T1 = TypeName<"a">;     // "string"
type T2 = TypeName<true>;    // "boolean"
```

### 分布式条件类型

```typescript
type ToArray<Type> = Type extends any ? Type[] : never;

type StrArrOrNumArr = ToArray<string | number>;
// string[] | number[]
```

### infer 关键字

```typescript
// 提取数组元素类型
type ArrayElement<T> = T extends (infer U)[] ? U : never;

type StringArray = string[];
type ElementType = ArrayElement<StringArray>; // string

// 提取 Promise 值类型
type Unpacked<T> = T extends Promise<infer U> ? U : T;

type PromiseString = Promise<string>;
type UnpackedType = Unpacked<PromiseString>; // string
```

## 模块和命名空间

### 模块声明

```typescript
// types/api.d.ts
declare module "api-client" {
  export interface User {
    id: number;
    name: string;
  }
  
  export function getUser(id: number): Promise<User>;
}

// 使用
import { getUser, User } from "api-client";
```

### 全局类型扩展

```typescript
// global.d.ts
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      API_URL: string;
    }
  }
}

export {};
```

## 装饰器

### 类装饰器

```typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  
  constructor(message: string) {
    this.greeting = message;
  }
  
  greet() {
    return "Hello, " + this.greeting;
  }
}
```

### 方法装饰器

```typescript
function log(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyName} with arguments:`, args);
    const result = method.apply(this, args);
    console.log(`Method ${propertyName} returned:`, result);
    return result;
  };
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}
```

## 类型守卫

### 内置类型守卫

```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function processValue(value: unknown) {
  if (isString(value)) {
    // value 的类型现在是 string
    console.log(value.toUpperCase());
  }
}
```

### 自定义类型守卫

```typescript
interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function getSmallPet(): Fish | Bird {
  // ...
  return {} as Fish | Bird;
}

const pet = getSmallPet();

if (isFish(pet)) {
  pet.swim(); // TypeScript 知道这是 Fish
} else {
  pet.fly(); // TypeScript 知道这是 Bird
}
```

## 配置优化

### tsconfig.json 最佳实践

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "checkJs": false,
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 路径映射

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"]
    }
  }
}
```

## 性能优化

### 项目引用

```json
// tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "incremental": true
  },
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" }
  ]
}
```

### 类型导入

```typescript
// 仅导入类型，不会在运行时存在
import type { User } from './types';

// 混合导入
import { someFunction, type SomeType } from './module';
```

## 实用技巧

### 键值对象类型

```typescript
const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    debug: true
  },
  production: {
    apiUrl: 'https://api.example.com',
    debug: false
  }
} as const;

type Environment = keyof typeof config;
type Config = typeof config[Environment];
```

### 函数重载

```typescript
function createElement(tag: 'img'): HTMLImageElement;
function createElement(tag: 'div'): HTMLDivElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

const img = createElement('img'); // HTMLImageElement
const div = createElement('div'); // HTMLDivElement
```

## 总结

TypeScript 的类型系统极其强大，掌握这些高级特性能够：

1. **提升代码质量** - 编译期捕获错误
2. **改善开发体验** - 更好的 IDE 支持
3. **增强代码可维护性** - 自文档化的类型信息
4. **促进团队协作** - 统一的类型约定

在实际项目中，建议渐进式地采用这些特性，从基础类型开始，逐步引入更复杂的类型操作。记住，类型系统的目标是帮助开发，而不是增加负担。
