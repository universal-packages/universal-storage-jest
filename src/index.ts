import { expect } from '@jest/globals'
import { checkFile } from '@universal-packages/fs-utils'
import { Storage, TestEngine, VersionBlobDescriptor } from '@universal-packages/storage'
import crypto from 'crypto'
import fs from 'fs'

import './globals'

beforeEach((): void => {
  const storageKeys = Object.keys(TestEngine.storage)
  const disposedKeys = Object.keys(TestEngine.disposed)

  for (const key of storageKeys) {
    delete TestEngine.storage[key]
  }

  for (const key of disposedKeys) {
    delete TestEngine.disposed[key]
  }
})

function toHaveDisposed(S: Storage | typeof Storage, key: string): jest.CustomMatcherResult {
  const instance = S instanceof Storage ? S : undefined

  const instanceDisposed = instance
    ? Object.keys(TestEngine.disposed).reduce((acc, key) => {
        const entry = TestEngine.disposed[key]

        if (instance === entry.instance) acc[key] = entry

        return acc
      }, {})
    : TestEngine.disposed

  const pass = !!instanceDisposed[key]

  if (pass) {
    return {
      message: () => {
        const keyToPrint = this.utils.printExpected(key)

        if (instance) {
          return `expected Storage instance not to have disposed ${keyToPrint} but it did`
        } else {
          return `expected ${keyToPrint} not to have been disposed but it was`
        }
      },
      pass
    }
  } else {
    return {
      message: () => {
        const keyToPrint = this.utils.printExpected(key)

        if (instance) {
          if (Object.keys(instanceDisposed).length === 0) {
            return `expected Storage instance to have disposed ${keyToPrint} but it did not dispose any keys at all`
          } else {
            const instanceDisposedToPrint = Object.keys(instanceDisposed)
              .map((key) => this.utils.printReceived(`${key} -> ${instanceDisposed[key].descriptor.name}`))
              .join('\n')

            return `expected Storage instance to have disposed ${keyToPrint} but it did not\n\nDisposed keys were:\n\n${instanceDisposedToPrint}`
          }
        } else {
          if (Object.keys(instanceDisposed).length === 0) {
            return `expected ${keyToPrint} to have been disposed but no keys were disposed at all`
          } else {
            const instanceDisposedToPrint = Object.keys(instanceDisposed)
              .map((key) => this.utils.printReceived(`${key} -> ${instanceDisposed[key].descriptor.name}`))
              .join('\n')

            return `expected ${keyToPrint} to have been disposed but it was not\n\nDisposed keys were:\n\n${instanceDisposedToPrint}`
          }
        }
      },
      pass
    }
  }
}

function toHaveDisposedVersion(S: Storage | typeof Storage, key: string, version: VersionBlobDescriptor): jest.CustomMatcherResult {
  const instance = S instanceof Storage ? S : undefined

  const instanceDisposed = instance
    ? Object.keys(TestEngine.disposed).reduce((acc, key) => {
        const entry = TestEngine.disposed[key]

        if (instance === entry.instance) acc[key] = entry

        return acc
      }, {})
    : TestEngine.disposed
  const disposedVariationsEntries = Object.keys(instanceDisposed).reduce((acc, disposedKey) => {
    const entry = instanceDisposed[disposedKey]

    if (disposedKey.startsWith(key) && disposedKey !== key) acc[disposedKey] = entry

    return acc
  }, {})
  const versionKey = Storage.generateVersionKey(key, version)
  const versionSlug = Storage.serializeVersionBlobDescriptor(version)

  const pass = !!disposedVariationsEntries[versionKey]

  if (pass) {
    return {
      message: () => {
        const keyToPrint = this.utils.printExpected(key)
        const versionToPrint = this.utils.printExpected(versionSlug)

        if (instance) {
          return `expected Storage instance not to have disposed version ${versionToPrint} of ${keyToPrint} but it did`
        } else {
          return `expected version ${versionToPrint} of ${keyToPrint} not to have been disposed but it was`
        }
      },
      pass
    }
  } else {
    return {
      message: () => {
        const keyToPrint = this.utils.printExpected(key)
        const versionToPrint = this.utils.printExpected(versionSlug)

        if (instance) {
          if (Object.keys(instanceDisposed).length === 0) {
            return `expected Storage instance to have disposed version ${versionToPrint} of ${keyToPrint} but it did not dispose any keys at all`
          } else {
            if (Object.keys(disposedVariationsEntries).length === 0) {
              return `expected Storage instance to have disposed version ${versionToPrint} of ${keyToPrint} but it did not dispose any versions for that key`
            } else {
              const disposedVariationsToPrint = Object.keys(disposedVariationsEntries)
                .map((key) => this.utils.printReceived(this.utils.diff(versionSlug, key.split('-V/')[1], { omitAnnotationLines: true })))
                .join('\n')

              return `expected Storage instance to have disposed version ${versionToPrint} of ${keyToPrint} but it did not\n\nDisposed versions were:\n\n${disposedVariationsToPrint}`
            }
          }
        } else {
          if (Object.keys(instanceDisposed).length === 0) {
            return `expected version ${versionToPrint} of ${keyToPrint} to have been disposed but no files were disposed at all`
          } else {
            if (Object.keys(disposedVariationsEntries).length === 0) {
              return `expected version ${versionToPrint} of ${keyToPrint} to have been disposed but no versions were disposed for that key`
            } else {
              const disposedVariationsToPrint = Object.keys(disposedVariationsEntries)
                .map((key) => this.utils.printReceived(this.utils.diff(versionSlug, key.split('-V/')[1], { omitAnnotationLines: true })))
                .join('\n')

              return `expected version ${versionToPrint} of ${keyToPrint} to have been disposed but it was not\n\nDisposed versions were:\n\n${disposedVariationsToPrint}`
            }
          }
        }
      },
      pass
    }
  }
}

function toHaveStored(S: Storage | typeof Storage, file: string, options?: Record<string, any>): jest.CustomMatcherResult {
  const instance = S instanceof Storage ? S : undefined

  let finalFilePath = file

  try {
    finalFilePath = checkFile(file)
  } catch {
    return {
      message: () => {
        if (instance) {
          return `expected Storage instance to have stored the file but ${this.utils.printExpected(file)} does not exist`
        } else {
          return `expected file to have been stored but ${this.utils.printExpected(file)} does not exist`
        }
      },
      pass: false
    }
  }

  const fileBuffer = fs.readFileSync(finalFilePath)
  const fileMd5 = crypto.createHash('md5').update(fileBuffer).digest('hex')

  const instanceStorage = instance
    ? Object.keys(TestEngine.storage).reduce((acc, key) => {
        const entry = TestEngine.storage[key]

        if (instance === entry.instance) acc[key] = entry

        return acc
      }, {})
    : TestEngine.storage
  const storedFileEntries = Object.keys(instanceStorage).reduce((acc, key) => {
    const entry = instanceStorage[key]

    if (entry.descriptor.md5 === fileMd5) acc[key] = entry

    return acc
  }, {})

  const pass = Object.keys(storedFileEntries).some((key) => (options ? this.equals(storedFileEntries[key].options, options) : true))

  if (pass) {
    return {
      message: () => {
        const fileToPrint = this.utils.printReceived(file)

        if (instance) {
          if (options) {
            const optionsToPrint = this.utils.printReceived(options)

            return `expected Storage instance not to have stored ${fileToPrint} with options ${optionsToPrint} but it did`
          } else {
            return `expected Storage instance not to have stored ${fileToPrint} but it did`
          }
        } else {
          if (options) {
            const optionsToPrint = this.utils.printReceived(options)

            return `expected ${fileToPrint} not to have been stored with options ${optionsToPrint} but it was`
          } else {
            return `expected ${fileToPrint} not to have been stored but it was`
          }
        }
      },
      pass
    }
  } else {
    return {
      message: () => {
        const fileToPrint = this.utils.printExpected(file)

        if (instance) {
          if (Object.keys(instanceStorage).length === 0) {
            if (options) {
              const optionsToPrint = this.utils.printExpected(options)

              return `expected Storage instance to have stored ${fileToPrint} with options ${optionsToPrint} but it did not store any files at all`
            } else {
              return `expected Storage instance to have stored ${fileToPrint} but it did not store any files at all`
            }
          } else {
            if (options) {
              const optionsToPrint = this.utils.printExpected(options)
              const storedFileEntriesToPrint = Object.keys(instanceStorage)
                .map((key) => {
                  const entry = instanceStorage[key]

                  return `${this.utils.printReceived(entry.descriptor.name)}\nOptions:\n\n${this.utils.diff(options, entry.options || {})}`
                })
                .join('\n')

              return `expected Storage instance to have stored ${fileToPrint} with options ${optionsToPrint} but it did not\n\nStored files were:\n\n${storedFileEntriesToPrint}`
            } else {
              const storedFileEntriesToPrint = Object.keys(instanceStorage)
                .map((key) => {
                  const entry = instanceStorage[key]

                  return this.utils.printReceived(entry.descriptor.name)
                })
                .join('\n')

              return `expected Storage instance to have stored ${fileToPrint} but it did not\n\nStored files were:\n\n${storedFileEntriesToPrint}`
            }
          }
        } else {
          if (Object.keys(instanceStorage).length === 0) {
            if (options) {
              const optionsToPrint = this.utils.printExpected(options)

              return `expected ${fileToPrint} to have been stored with options ${optionsToPrint} but no files were stored at all`
            } else {
              return `expected ${fileToPrint} to have been stored, but no files were stored at all`
            }
          } else {
            if (options) {
              const optionsToPrint = this.utils.printExpected(options)
              const storedFileEntriesToPrint = Object.keys(instanceStorage)
                .map((key) => {
                  const entry = instanceStorage[key]

                  return `${this.utils.printReceived(entry.descriptor.name)}\nOptions:\n\n${this.utils.diff(options, entry.options || {})}`
                })
                .join('\n')

              return `expected ${fileToPrint} to have been stored with options ${optionsToPrint} but it was not\n\nStored files were:\n\n${storedFileEntriesToPrint}`
            } else {
              const storedFileEntriesToPrint = Object.keys(instanceStorage)
                .map((key) => {
                  const entry = instanceStorage[key]

                  return this.utils.printReceived(entry.descriptor.name)
                })
                .join('\n')

              return `expected ${fileToPrint} to have been stored, but it was not\n\nStored files were:\n\n${storedFileEntriesToPrint}`
            }
          }
        }
      },
      pass
    }
  }
}

function toHaveStoredVersion(S: Storage | typeof Storage, file: string, version: VersionBlobDescriptor, options?: Record<string, any>): jest.CustomMatcherResult {
  const instance = S instanceof Storage ? S : undefined

  let finalFilePath = file

  try {
    finalFilePath = checkFile(file)
  } catch {
    return {
      message: () => {
        if (instance) {
          return `expected Storage instance to have stored the file but ${this.utils.printExpected(file)} does not exist`
        } else {
          return `expected file to have been stored but ${this.utils.printExpected(file)} does not exist`
        }
      },
      pass: false
    }
  }

  const fileBuffer = fs.readFileSync(finalFilePath)
  const fileMd5 = crypto.createHash('md5').update(fileBuffer).digest('hex')

  const instanceStorage = Object.keys(TestEngine.storage).reduce((acc, key) => {
    const entry = TestEngine.storage[key]

    if (!instance || entry.instance === instance) acc[key] = entry

    return acc
  }, {})
  const storedFileKey = Object.keys(instanceStorage).find((key) => instanceStorage[key].descriptor.md5 === fileMd5) || '%NOT_FOUND%'
  const storedFileVariationsEntries = Object.keys(instanceStorage).reduce((acc, key) => {
    const entry = instanceStorage[key]

    if (key.startsWith(storedFileKey) && key !== storedFileKey) acc[key] = entry

    return acc
  }, {})
  const versionKey = Storage.generateVersionKey(storedFileKey, version)
  const storedVersionEntry = storedFileVariationsEntries[versionKey]

  const pass = !!storedVersionEntry && (options ? this.equals(storedVersionEntry.options, options) : true)

  if (pass) {
    return {
      message: () => {
        const fileToPrint = this.utils.printExpected(file)
        const versionToPrint = this.utils.printExpected(Storage.serializeVersionBlobDescriptor(version))

        if (instance) {
          if (options) {
            const optionsToPrint = this.utils.printExpected(options)

            return `expected Storage instance not to have stored version ${versionToPrint} of ${fileToPrint} with options ${optionsToPrint} but it did`
          } else {
            return `expected Storage instance not to have stored version ${versionToPrint} of ${fileToPrint} but it did`
          }
        } else {
          if (options) {
            const optionsToPrint = this.utils.printExpected(options)

            return `expected version ${versionToPrint} of ${fileToPrint} not to have been stored with options ${optionsToPrint} but it was`
          } else {
            return `expected version ${versionToPrint} of ${fileToPrint} not to have been stored but it was`
          }
        }
      },
      pass
    }
  } else {
    return {
      message: () => {
        const fileToPrint = this.utils.printExpected(file)
        const versionToPrint = this.utils.printExpected(Storage.serializeVersionBlobDescriptor(version))

        if (instance) {
          if (Object.keys(instanceStorage).length === 0) {
            if (options) {
              const optionsToPrint = this.utils.printExpected(options)

              return `expected Storage instance to have stored version ${versionToPrint} of ${fileToPrint} with options ${optionsToPrint} but it did not store any files at all`
            } else {
              return `expected Storage instance to have stored version ${versionToPrint} of ${fileToPrint} but it did not store any files at all`
            }
          } else {
            if (storedFileKey === '%NOT_FOUND%') {
              if (options) {
                const optionsToPrint = this.utils.printExpected(options)

                return `expected Storage instance to have stored version ${versionToPrint} of ${fileToPrint} with options ${optionsToPrint} but ${fileToPrint} was not even stored`
              } else {
                return `expected Storage instance to have stored version ${versionToPrint} of ${fileToPrint} but ${fileToPrint} was not even stored`
              }
            } else {
              if (Object.keys(storedFileVariationsEntries).length === 0) {
                if (options) {
                  const optionsToPrint = this.utils.printExpected(options)

                  return `expected Storage instance to have stored version ${versionToPrint} of ${fileToPrint} with options ${optionsToPrint} but not a single version was generated for that file`
                } else {
                  return `expected Storage instance to have stored version ${versionToPrint} of ${fileToPrint} but not a single version was generated for that file`
                }
              } else {
                if (options) {
                  const optionsToPrint = this.utils.printExpected(options)
                  const storedFileVariationsEntriesToPrint = Object.keys(storedFileVariationsEntries)
                    .map((key) => {
                      const entry = storedFileVariationsEntries[key]
                      const versionSlug = this.utils.printReceived(key.split('-V/')[1])

                      return `${versionSlug}\nOptions:\n\n${this.utils.diff(options, entry.options || {})}`
                    })
                    .join('\n')

                  return `expected Storage instance to have stored version ${versionToPrint} of ${fileToPrint} with options ${optionsToPrint} but it did not\n\nStored versions were:\n\n${storedFileVariationsEntriesToPrint}`
                } else {
                  const storedFileVariationsEntriesToPrint = Object.keys(storedFileVariationsEntries)
                    .map((key) => {
                      const versionSlug = this.utils.printReceived(key.split('-V/')[1])

                      return versionSlug
                    })
                    .join('\n')

                  return `expected Storage instance to have stored version ${versionToPrint} of ${fileToPrint} but it did not\n\nStored versions were:\n\n${storedFileVariationsEntriesToPrint}`
                }
              }
            }
          }
        } else {
          if (Object.keys(instanceStorage).length === 0) {
            if (options) {
              const optionsToPrint = this.utils.printExpected(options)

              return `expected version ${versionToPrint} of ${fileToPrint} to have been stored with options ${optionsToPrint} but no files were stored at all`
            } else {
              return `expected version ${versionToPrint} of ${fileToPrint} to have been stored, but no files were stored at all`
            }
          } else {
            if (storedFileKey === '%NOT_FOUND%') {
              if (options) {
                const optionsToPrint = this.utils.printExpected(options)

                return `expected version ${versionToPrint} of ${fileToPrint} to have been stored with options ${optionsToPrint} but ${fileToPrint} was not even stored`
              } else {
                return `expected version ${versionToPrint} of ${fileToPrint} to have been stored but ${fileToPrint} was not even stored`
              }
            } else {
              if (Object.keys(storedFileVariationsEntries).length === 0) {
                if (options) {
                  const optionsToPrint = this.utils.printExpected(options)

                  return `expected version ${versionToPrint} of ${fileToPrint} to have been stored with options ${optionsToPrint} but not a single version was generated for that file`
                } else {
                  return `expected version ${versionToPrint} of ${fileToPrint} to have been stored but not a single version was generated for that file`
                }
              } else {
                if (options) {
                  const optionsToPrint = this.utils.printExpected(options)
                  const storedFileVariationsEntriesToPrint = Object.keys(storedFileVariationsEntries)
                    .map((key) => {
                      const entry = storedFileVariationsEntries[key]
                      const versionSlug = this.utils.printReceived(key.split('-V/')[1])

                      return `${versionSlug}\nOptions:\n\n${this.utils.diff(options, entry.options || {})}`
                    })
                    .join('\n')

                  return `expected version ${versionToPrint} of ${fileToPrint} to have been stored with options ${optionsToPrint} but it was not\n\nStored versions were:\n\n${storedFileVariationsEntriesToPrint}`
                } else {
                  const storedFileVariationsEntriesToPrint = Object.keys(storedFileVariationsEntries)
                    .map((key) => {
                      const versionSlug = this.utils.printReceived(key.split('-V/')[1])

                      return versionSlug
                    })
                    .join('\n')

                  return `expected version ${versionToPrint} of ${fileToPrint} to have been stored, but it was not\n\nStored versions were:\n\n${storedFileVariationsEntriesToPrint}`
                }
              }
            }
          }
        }
      },
      pass
    }
  }
}

expect.extend({
  toHaveDisposed,
  toHaveDisposedVersion,
  toHaveStored,
  toHaveStoredVersion
})
