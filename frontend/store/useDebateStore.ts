import { create } from 'zustand'

export type Role = 'PRO' | 'CON' | 'SPECTATOR' | null

interface User {
  id: string
  email: string
  nickname: string
}

interface DebateMessage {
  id: number
  userId: string
  role: 'PRO' | 'CON'
  content: string
  sentAt: string
}

interface Room {
  id: number
  topic: string
  type: 'RANDOM' | 'TOPIC'
  status: 'WAITING' | 'ACTIVE' | 'ENDED'
  proUserId: string | null
  conUserId: string | null
}

interface DebateStore {
  user: User | null
  currentRoom: Room | null
  myRole: Role
  messages: DebateMessage[]
  voteAverage: number

  setUser: (user: User | null) => void
  setCurrentRoom: (room: Room | null) => void
  setMyRole: (role: Role) => void
  addMessage: (msg: DebateMessage) => void
  setVoteAverage: (value: number) => void
  reset: () => void
}

export const useDebateStore = create<DebateStore>((set) => ({
  user: null,
  currentRoom: null,
  myRole: null,
  messages: [],
  voteAverage: 50,

  setUser: (user) => set({ user }),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  setMyRole: (role) => set({ myRole: role }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setVoteAverage: (value) => set({ voteAverage: value }),
  reset: () => set({ currentRoom: null, myRole: null, messages: [], voteAverage: 50 }),
}))
