import { v4 as uuidv4 } from 'uuid'
import { JsonRpcMessage } from './jsonrpc'
import { LogDirection } from '../../shared/constants'

export interface LogEntry {
  id: string
  timestamp: number
  direction: LogDirection
  message: JsonRpcMessage
}

const MAX_ENTRIES = 10000

export class MessageLogger {
  private entries: LogEntry[] = []

  log(direction: LogDirection, message: JsonRpcMessage): void {
    const entry: LogEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      direction,
      message
    }
    this.entries.push(entry)
    if (this.entries.length > MAX_ENTRIES) {
      this.entries.shift()
    }
  }

  getEntries(): LogEntry[] {
    return [...this.entries]
  }

  clear(): void {
    this.entries = []
  }
}
