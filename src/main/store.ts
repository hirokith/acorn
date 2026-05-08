import Store from 'electron-store'

export interface AgentConfig {
  id: string
  name: string
  command: string
  args: string[]
  cwd?: string
  env?: Record<string, string>
}

interface StoreSchema {
  agents: AgentConfig[]
}

const store = new Store<StoreSchema>({
  defaults: {
    agents: []
  }
})

export function getAgents(): AgentConfig[] {
  return store.get('agents')
}

export function addAgent(agent: AgentConfig): void {
  const agents = getAgents()
  agents.push(agent)
  store.set('agents', agents)
}

export function updateAgent(id: string, updates: Partial<Omit<AgentConfig, 'id'>>): void {
  const agents = getAgents()
  const idx = agents.findIndex(a => a.id === id)
  if (idx !== -1) {
    agents[idx] = { ...agents[idx], ...updates }
    store.set('agents', agents)
  }
}

export function deleteAgent(id: string): void {
  const agents = getAgents().filter(a => a.id !== id)
  store.set('agents', agents)
}
