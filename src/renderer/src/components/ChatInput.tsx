import { useState, useRef, useCallback, useEffect } from 'react'
import { Send } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'

export default function ChatInput() {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const connectedAgents = useChatStore((s) => s.connectedAgents)
  const activeSessionId = useChatStore((s) => s.activeSessionId)
  const activeSession = useChatStore((s) =>
    s.sessions.find((ses) => ses.sessionId === s.activeSessionId)
  )
  const isPrompting = activeSession?.isPrompting ?? false
  const activeAgentId = activeSession?.agentId
  const addUserMessage = useChatStore((s) => s.addUserMessage)
  const setIsPrompting = useChatStore((s) => s.setIsPrompting)
  const updateSessionId = useChatStore((s) => s.updateSessionId)

  const isAgentConnected = activeAgentId
    ? connectedAgents.some((a) => a.agentId === activeAgentId)
    : false
  const canSend = isAgentConnected && activeSessionId && text.trim() && !isPrompting

  // Auto-focus input when active session changes
  useEffect(() => {
    if (activeSessionId && isAgentConnected) {
      textareaRef.current?.focus()
    }
  }, [activeSessionId, isAgentConnected])

  const handleSend = useCallback(async () => {
    if (!canSend || !activeSessionId || !activeAgentId) return
    const prompt = text.trim()
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    addUserMessage(prompt)
    setIsPrompting(true)
    try {
      await (window as any).acpApi.sendPrompt(activeAgentId, activeSessionId, prompt)
    } catch (e: any) {
      const errMsg = e?.message || String(e)
      // If session not found on agent side, recreate and retry
      if (errMsg.toLowerCase().includes('not found')) {
        console.log('[ChatInput] Session not found, recreating...')
        try {
          const result = await (window as any).acpApi.createSession(activeAgentId)
          updateSessionId(activeSessionId, result.sessionId)
          await (window as any).acpApi.sendPrompt(activeAgentId, result.sessionId, prompt)
          return
        } catch (retryErr) {
          console.error('[ChatInput] Retry after recreate failed:', retryErr)
        }
      }
      console.error('sendPrompt error:', e)
      setIsPrompting(false)
    }
  }, [canSend, activeSessionId, activeAgentId, text, addUserMessage, setIsPrompting, updateSessionId])

  const handleCancel = useCallback(async () => {
    if (!activeSessionId || !activeAgentId) return
    try {
      await (window as any).acpApi.cancelPrompt(activeAgentId, activeSessionId)
    } catch (e) {
      console.error('cancelPrompt error:', e)
    }
  }, [activeSessionId, activeAgentId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="border-t border-border bg-sidebar-bg px-2 py-1.5">
      <div className="flex items-center gap-1.5">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={isAgentConnected ? 'Message... (Enter to send)' : 'Connect to an agent first'}
          disabled={!isAgentConnected || !activeSessionId}
          rows={1}
          className="flex-1 min-w-0 resize-none bg-panel-bg border border-border text-text text-xs px-2 py-1 rounded-sm placeholder:text-text-subtle focus:outline-none focus:border-accent disabled:opacity-40 font-[inherit] leading-[1.4]"
        />
        {isPrompting ? (
          <button
            onClick={handleCancel}
            className="shrink-0 px-1.5 py-1 text-xs bg-error/20 text-error border border-error/40 rounded-sm hover:bg-error/30 font-medium leading-[1.4]"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="shrink-0 p-1 bg-accent text-panel-bg rounded-sm hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
