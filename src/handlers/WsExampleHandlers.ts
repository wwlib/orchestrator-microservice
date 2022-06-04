import { IncomingMessage } from 'http'
import ws, { WebSocketServer } from 'ws'
import { Model } from '@model'

export const wsEchoHandler = (wss: WebSocketServer, ws: ws, req: IncomingMessage, token?: any) => {
  ws.on('message', (message: string) => {
    Model.getInstance().onRequest()
    console.info(`wsEchoHandler: ${message}`)
    ws.send(`${message}`)
  })
}

export const wsSilentHandler = (wss: WebSocketServer, ws: ws, req: IncomingMessage, token?: any) => {
  ws.on('message', (message: string | Buffer, binary: boolean) => {
    Model.getInstance().onRequest()
    console.info(`wsSilentHandler: ${binary} * ${message}`)
    // ws.send(`${message}`)
  })
}
