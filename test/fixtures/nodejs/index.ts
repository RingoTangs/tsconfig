import { basename } from 'node:path'
import { Service, Status } from './service.js'

export const result = `${basename('/tmp/example.txt')}:${new Service(Status.Ready).status}`
// Verify that the Node.js type package provides globals as well as module imports.
// eslint-disable-next-line node/prefer-global/process
export const runtime = process.version
// eslint-disable-next-line node/prefer-global/buffer
export const buffer = Buffer.from('ok').toString()
