import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '@/store/authStore'

let stompClient: Client | null = null

export function connectStomp(
  roomId: string,
  onMessage: (msg: IMessage) => void,
  onVoteResult: (msg: IMessage) => void,
  onStatus: (msg: IMessage) => void,
): Client {
  const token = useAuthStore.getState().token

  const client = new Client({
    webSocketFactory: () => new SockJS(`${process.env.NEXT_PUBLIC_WS_URL}/ws`),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    onConnect: () => {
      client.subscribe(`/sub/debate/${roomId}/message`, onMessage)
      client.subscribe(`/sub/debate/${roomId}/vote-result`, onVoteResult)
      client.subscribe(`/sub/debate/${roomId}/status`, onStatus)
    },
    reconnectDelay: 3000,
  })

  client.activate()
  stompClient = client
  return client
}

export function disconnectStomp() {
  stompClient?.deactivate()
  stompClient = null
}

export function sendMessage(roomId: string, content: string) {
  stompClient?.publish({
    destination: `/pub/debate/${roomId}/message`,
    body: JSON.stringify({ content }),
  })
}

export function sendVote(roomId: string, value: number) {
  stompClient?.publish({
    destination: `/pub/debate/${roomId}/vote`,
    body: JSON.stringify({ value }),
  })
}
