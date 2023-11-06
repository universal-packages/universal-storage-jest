import { VersionBlobDescriptor } from '@universal-packages/storage'

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveDisposed(key: string): R
      toHaveDisposedVersion(key: string, version: VersionBlobDescriptor): R
      toHaveStored(file: string, options?: Record<string, any>): R
      toHaveStoredVersion(file: string, version: VersionBlobDescriptor, options?: Record<string, any>): R
    }
  }
}

export {}
