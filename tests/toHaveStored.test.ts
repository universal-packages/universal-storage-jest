import { Storage } from '@universal-packages/storage'
import fs from 'fs'
import stripAnsi from 'strip-ansi'

import '../src'

const file1 = fs.readFileSync('./tests/__fixtures__/test-1.png')
const file2 = fs.readFileSync('./tests/__fixtures__/test-2.png')

describe('toHaveStored', (): void => {
  describe('against the exact Storage instance', (): void => {
    it('asserts file being stored', async (): Promise<void> => {
      const storage = new Storage()

      expect(storage).not.toHaveStored('./tests/__fixtures__/test-1.png')

      await storage.store({ name: 'test-1.png', data: file1 })

      expect(storage).toHaveStored('./tests/__fixtures__/test-1.png')
      expect(storage).not.toHaveStored('./tests/__fixtures__/test-2.png')

      await storage.store({ name: 'test-2.png', data: file2 })

      expect(storage).toHaveStored('./tests/__fixtures__/test-1.png')
      expect(storage).toHaveStored('./tests/__fixtures__/test-2.png')
    })

    it('asserts file being stored with a options', async (): Promise<void> => {
      const storage = new Storage()

      expect(storage).not.toHaveStored('./tests/__fixtures__/test-1.png', { private: true })

      await storage.store({ name: 'test-1.png', data: file1 }, { private: true })

      expect(storage).toHaveStored('./tests/__fixtures__/test-1.png', { private: true })
      expect(storage).not.toHaveStored('./tests/__fixtures__/test-1.png', { private: false })
      expect(storage).not.toHaveStored('./tests/__fixtures__/test-2.png', { private: true })

      await storage.store({ name: 'test-2.png', data: file2 }, { private: true })

      expect(storage).toHaveStored('./tests/__fixtures__/test-1.png', { private: true })
      expect(storage).toHaveStored('./tests/__fixtures__/test-2.png', { private: true })
    })

    it('fails if the file was stored and it was not expected', async (): Promise<void> => {
      const storage = new Storage()

      await storage.store({ name: 'test-1.png', data: file1 })

      let error: Error

      try {
        expect(storage).not.toHaveStored('./tests/__fixtures__/test-1.png')
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual('expected Storage instance not to have stored "./tests/__fixtures__/test-1.png" but it did')
    })

    it('fails if the file does not even exists', async (): Promise<void> => {
      const storage = new Storage()

      await storage.store({ name: 'test-1.png', data: file1 })

      let error: Error

      try {
        expect(storage).toHaveStored('./tests/__fixtures__/nop.png')
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual('expected Storage instance to have stored the file but "./tests/__fixtures__/nop.png" does not exist')
    })

    it('fails if the file was stored with a options and it was not expected', async (): Promise<void> => {
      const storage = new Storage()

      await storage.store({ name: 'test-1.png', data: file1 }, { private: true })

      let error: Error

      try {
        expect(storage).not.toHaveStored('./tests/__fixtures__/test-1.png', { private: true })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual('expected Storage instance not to have stored "./tests/__fixtures__/test-1.png" with options {"private": true} but it did')
    })

    it('fails and shows if no files were stored', async (): Promise<void> => {
      const storage = new Storage()

      let error: Error

      try {
        expect(storage).toHaveStored('./tests/__fixtures__/test-1.png')
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual('expected Storage instance to have stored "./tests/__fixtures__/test-1.png" but it did not store any files at all')
    })

    it('fails and shows if no files were stored with a options', async (): Promise<void> => {
      const storage = new Storage()

      let error: Error

      try {
        expect(storage).toHaveStored('./tests/__fixtures__/test-1.png', { private: true })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        'expected Storage instance to have stored "./tests/__fixtures__/test-1.png" with options {"private": true} but it did not store any files at all'
      )
    })

    it('files if file was not stored but others were', async (): Promise<void> => {
      const storage = new Storage()

      await storage.store({ name: 'test-2.png', data: file2 })

      let error: Error

      try {
        expect(storage).toHaveStored('./tests/__fixtures__/test-1.png')
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(`expected Storage instance to have stored "./tests/__fixtures__/test-1.png" but it did not

Stored files were:

"test-2.png"`)
    })

    it('files if file was not stored with a options but others were', async (): Promise<void> => {
      const storage = new Storage()

      await storage.store({ name: 'test-1.png', data: file2 }, { private: false })

      let error: Error

      try {
        expect(storage).toHaveStored('./tests/__fixtures__/test-1.png', { private: true })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(`expected Storage instance to have stored "./tests/__fixtures__/test-1.png" with options {"private": true} but it did not

Stored files were:

"test-1.png"
Options:

- Expected
+ Received

  Object {
-   "private": true,
+   "private": false,
  }`)
    })
  })

  describe('against the Storage class', (): void => {
    it('asserts file being stored', async (): Promise<void> => {
      const storage = new Storage()

      expect(Storage).not.toHaveStored('./tests/__fixtures__/test-1.png')

      await storage.store({ name: 'test-1.png', data: file1 })

      expect(Storage).toHaveStored('./tests/__fixtures__/test-1.png')
      expect(Storage).not.toHaveStored('./tests/__fixtures__/test-2.png')

      await storage.store({ name: 'test-2.png', data: file2 })

      expect(Storage).toHaveStored('./tests/__fixtures__/test-1.png')
      expect(Storage).toHaveStored('./tests/__fixtures__/test-2.png')
    })

    it('asserts file being stored with a options', async (): Promise<void> => {
      const storage = new Storage()

      expect(Storage).not.toHaveStored('./tests/__fixtures__/test-1.png', { private: true })

      await storage.store({ name: 'test-1.png', data: file1 }, { private: true })

      expect(Storage).toHaveStored('./tests/__fixtures__/test-1.png', { private: true })
      expect(Storage).not.toHaveStored('./tests/__fixtures__/test-1.png', { private: false })
      expect(Storage).not.toHaveStored('./tests/__fixtures__/test-2.png', { private: true })

      await storage.store({ name: 'test-2.png', data: file2 }, { private: true })

      expect(Storage).toHaveStored('./tests/__fixtures__/test-1.png', { private: true })
      expect(Storage).toHaveStored('./tests/__fixtures__/test-2.png', { private: true })
    })

    it('fails if the file was stored and it was not expected', async (): Promise<void> => {
      const storage = new Storage()

      await storage.store({ name: 'test-1.png', data: file1 })

      let error: Error

      try {
        expect(Storage).not.toHaveStored('./tests/__fixtures__/test-1.png')
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual('expected "./tests/__fixtures__/test-1.png" not to have been stored but it was')
    })

    it('fails if the file does not even exists', async (): Promise<void> => {
      const storage = new Storage()

      await storage.store({ name: 'test-1.png', data: file1 })

      let error: Error

      try {
        expect(Storage).toHaveStored('./tests/__fixtures__/nop.png')
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual('expected file to have been stored but "./tests/__fixtures__/nop.png" does not exist')
    })

    it('fails if the file was stored with a options and it was not expected', async (): Promise<void> => {
      const storage = new Storage()

      await storage.store({ name: 'test-1.png', data: file1 }, { private: true })

      let error: Error

      try {
        expect(Storage).not.toHaveStored('./tests/__fixtures__/test-1.png', { private: true })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual('expected "./tests/__fixtures__/test-1.png" not to have been stored with options {"private": true} but it was')
    })

    it('fails and shows if no files were stored', async (): Promise<void> => {
      let error: Error

      try {
        expect(Storage).toHaveStored('./tests/__fixtures__/test-1.png')
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual('expected "./tests/__fixtures__/test-1.png" to have been stored, but no files were stored at all')
    })

    it('fails and shows if no files were stored with a options', async (): Promise<void> => {
      let error: Error

      try {
        expect(Storage).toHaveStored('./tests/__fixtures__/test-1.png', { private: true })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual('expected "./tests/__fixtures__/test-1.png" to have been stored with options {"private": true} but no files were stored at all')
    })

    it('asserts the file was stored no matter which instance did it', async (): Promise<void> => {
      const storage = new Storage()
      const otherStorage = new Storage()

      await storage.store({ name: 'test-1.png', data: file1 })
      await otherStorage.store({ name: 'test-2.png', data: file2 })

      expect(Storage).toHaveStored('./tests/__fixtures__/test-1.png')
      expect(Storage).toHaveStored('./tests/__fixtures__/test-2.png')
    })

    it('asserts the file was stored with options no matter which instance did it', async (): Promise<void> => {
      const storage = new Storage()
      const otherStorage = new Storage()

      await storage.store({ name: 'test-1.png', data: file1 }, { private: true })
      await otherStorage.store({ name: 'test-2.png', data: file2 }, { private: true })

      expect(Storage).toHaveStored('./tests/__fixtures__/test-1.png', { private: true })
      expect(Storage).toHaveStored('./tests/__fixtures__/test-2.png', { private: true })
    })

    it('files if file was not stored but others were', async (): Promise<void> => {
      const storage = new Storage()

      await storage.store({ name: 'test-2.png', data: file2 })

      let error: Error

      try {
        expect(Storage).toHaveStored('./tests/__fixtures__/test-1.png')
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(`expected "./tests/__fixtures__/test-1.png" to have been stored, but it was not

Stored files were:

"test-2.png"`)
    })

    it('files if file was not stored with a options but others were', async (): Promise<void> => {
      const storage = new Storage()

      await storage.store({ name: 'test-1.png', data: file2 }, { private: false })

      let error: Error

      try {
        expect(Storage).toHaveStored('./tests/__fixtures__/test-1.png', { private: true })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(`expected "./tests/__fixtures__/test-1.png" to have been stored with options {"private": true} but it was not

Stored files were:

"test-1.png"
Options:

- Expected
+ Received

  Object {
-   "private": true,
+   "private": false,
  }`)
    })
  })
})
