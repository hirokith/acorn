import { create } from 'zustand'
import { McpTransport } from '@shared/constants'

export { McpTransport }

export interface McpServerConfig {
  id: string
  name: string
  transport: McpTransport
  // stdio fields
  command?: string
  args?: string[]
  env?: Record<string, string>
  // http fields
  url?: string
}

interface McpConfigState {
  servers: McpServerConfig[]
  loading: boolean
  fetchServers: () => Promise<void>
  addServer: (server: Omit<McpServerConfig, 'id'>) => Promise<void>
  updateServer: (id: string, updates: Partial<Omit<McpServerConfig, 'id'>>) => Promise<void>
  deleteServer: (id: string) => Promise<void>
}

export const useMcpConfigStore = create<McpConfigState>((set) => ({
  servers: [],
  loading: false,
  fetchServers: async () => {
    set({ loading: true })
    try {
      const servers = await (window as any).acpApi.mcpConfig.list()
      set({ servers, loading: false })
    } catch (e) {
      set({ loading: false })
      console.error('[mcpConfigStore] Failed to fetch servers:', e)
    }
  },
  addServer: async (server) => {
    const id = crypto.randomUUID()
    const servers = await (window as any).acpApi.mcpConfig.add({ ...server, id })
    set({ servers })
  },
  updateServer: async (id, updates) => {
    const servers = await (window as any).acpApi.mcpConfig.update(id, updates)
    set({ servers })
  },
  deleteServer: async (id) => {
    const servers = await (window as any).acpApi.mcpConfig.delete(id)
    set({ servers })
  },
}))
