// ACP-specific protocol types
import { ToolCallStatus, SessionUpdateKind as SharedSessionUpdateKind } from '../../shared/constants'

// Content types
export interface TextContent {
  type: 'text'
  text: string
}

export interface ImageContent {
  type: 'image'
  url: string
  mimeType?: string
}

export interface ResourceContent {
  type: 'resource'
  uri: string
  mimeType?: string
  text?: string
}

export type Content = TextContent | ImageContent | ResourceContent

// Tool call types
export interface ToolCall {
  toolCallId: string
  title: string
  kind?: string
  status: ToolCallStatus
  rawInput?: string
  rawOutput?: string
  content?: Content[]
}

// Session update types
export type SessionUpdateKind =
  | SharedSessionUpdateKind.AgentMessageChunk
  | SharedSessionUpdateKind.ToolCall
  | SharedSessionUpdateKind.ToolCallUpdate
  | SharedSessionUpdateKind.ThoughtMessageChunk
  | 'plan'

export interface SessionUpdateBase {
  sessionId: string
  kind: SessionUpdateKind
}

export interface AgentMessageChunkUpdate extends SessionUpdateBase {
  kind: SharedSessionUpdateKind.AgentMessageChunk
  text: string
}

export interface ToolCallUpdate extends SessionUpdateBase {
  kind: SharedSessionUpdateKind.ToolCall
  toolCall: ToolCall
}

export interface ToolCallStatusUpdate extends SessionUpdateBase {
  kind: SharedSessionUpdateKind.ToolCallUpdate
  toolCallId: string
  status: ToolCall['status']
  rawOutput?: string
  content?: Content[]
}

export interface ThoughtMessageChunkUpdate extends SessionUpdateBase {
  kind: SharedSessionUpdateKind.ThoughtMessageChunk
  text: string
}

export interface PlanUpdate extends SessionUpdateBase {
  kind: 'plan'
  steps: string[]
}

export type SessionUpdate =
  | AgentMessageChunkUpdate
  | ToolCallUpdate
  | ToolCallStatusUpdate
  | ThoughtMessageChunkUpdate
  | PlanUpdate

// Permission request types
export interface PermissionRequest {
  id: number | string
  sessionId: string
  toolCallId: string
  title: string
  description?: string
  rawInput?: string
}

export type PermissionOutcome = 'allow' | 'deny' | 'allow_always'

// Session types
export interface Session {
  sessionId: string
  status: 'active' | 'idle' | 'closed'
}

// Agent connection config
export interface AgentConfig {
  command: string
  args?: string[]
  cwd?: string
  env?: Record<string, string>
}
