import { Buffer } from 'node:buffer'
import { basename } from 'node:path'
import process from 'node:process'
import { Service, Status } from './service.js'

export const result = `${basename('/tmp/example.txt')}:${new Service(Status.Ready).status}`
export const runtime = process.version
export const buffer = Buffer.from('ok').toString()
