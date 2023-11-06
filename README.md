# Storage Jest

[![npm version](https://badge.fury.io/js/@universal-packages%2Fstorage-jest.svg)](https://www.npmjs.com/package/@universal-packages/storage-jest)
[![Testing](https://github.com/universal-packages/universal-storage-jest/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-storage-jest/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-storage-jest/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-storage-jest)

Jest matchers for [Storage](https://github.com/universal-packages/universal-storage) testing.

## Install

```shell
npm install @universal-packages/storage-jest

npm install @universal-packages/storage
```

## Setup

Add the following to your `jest.config.js` or where you configure Jest:

```js
module.exports = {
  setupFilesAfterEnv: ['@universal-packages/storage-jest']
}
```

## Matchers

### toHaveStored

```js
import { Storage } from '@universal-packages/storage'

import config from './config'

it('should store file', async () => {
  const storage = new Storage(config)

  await storage.store({ name: 'file.png', data: buffer })

  expect(storage).toHaveStored('./path/to/file.png')

  // Or against the Storage class
  expect(Storage).toHaveStored('./path/to/file.png')
})
```

### toHaveStoredVersion

```js
import { Storage } from '@universal-packages/storage'

import config from './config'

it('should store file', async () => {
  const storage = new Storage(config)

  const key = await storage.store({ name: 'file.png', data: buffer })
  await storage.storeVersion(key, { width: 100, height: 100 })

  expect(storage).toHaveStoredVersion('./path/to/file.png', { width: 100, height: 100 })

  // Or against the Storage class
  expect(Storage).toHaveStoredVersion('./path/to/file.png', { width: 100, height: 100 })
})
```

### toHaveDisposed

```js
import { Storage } from '@universal-packages/storage'

import config from './config'

it('should dispose file', async () => {
  const storage = new Storage(config)

  const key = await storage.store({ name: 'file.png', data: buffer })

  await storage.dispose(key)

  expect(storage).toHaveDisposed(key)

  // Or against the Storage class
  expect(Storage).toHaveDisposed(key)
})
```

### toHaveDisposedVersion

```js
import { Storage } from '@universal-packages/storage'

import config from './config'

it('should dispose file', async () => {
  const storage = new Storage(config)

  const key = await storage.store({ name: 'file.png', data: buffer })
  await storage.storeVersion(key, { width: 100, height: 100 })

  await storage.disposeVersion(key, { width: 100, height: 100 })

  expect(storage).toHaveDisposedVersion(key, { width: 100, height: 100 })

  // Or against the Storage class
  expect(Storage).toHaveDisposedVersion(key, { width: 100, height: 100 })
})
```

## Typescript

In order for typescript to see the global types you need to reference the types somewhere in your project, normally `./src/globals.d.ts`.

```ts
/// <reference types="@universal-packages/storage-jest" />
```

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
