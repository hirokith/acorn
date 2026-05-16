import { v4 as uuidv4 } from 'uuid'
import { JsonRpcMessage } from './jsonrpc'
import { LogDirection } from '../../shared/constants'
import { insertLog, queryLogs, LogRow } from '../db'

export interface LogEntry {
  id: string
  timestamp: number
  direction: LogDirection
  message: JsonRpcMessage
  sessionId?: string
  agentId?: string
}

export class MessageLogger {
  log(direction: LogDirection, message: JsonRpcMessage, agentId?: string | null, sessionId?: string | null): void {
    const entry = {
      id: uuidv4(),
      timestamp: Date.now(),
      direction,
      sessionId: sessionId || null,
      agentId: agentId || null,
      method: (message as any).method || null,
      message
    }
    insertLog(entry).catch((err) => {
      console.error('[Logger] Failed to persist log:', err)
    })
  }

  async getEntries(options?: { limit?: number; offset?: number; agentId?: string }): Promise<LogRow[]> {
    return queryLogs({
      limit: options?.limit || 500,
      offset: options?.offset || 0,
      agentId: options?.agentId
    })
  }
}
