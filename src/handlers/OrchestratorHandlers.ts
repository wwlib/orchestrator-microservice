import path from 'path'
import fs from 'fs'
import { AuthRequest } from '@types'
import { Response, Handler } from 'express'
import { StatusCodes } from 'http-status-codes'
import { IncomingMessage } from 'http'
import ws, { WebSocketServer } from 'ws'
import { Model } from '@model'

const oc = require('@microsoft/orchestrator-core')

export class OrchestratorHandlers {
  private static instance: OrchestratorHandlers;

  private orchestrator: any
  private resolvers: any

  private constructor() {
    this.orchestrator = new oc.Orchestrator()
    this.resolvers = {}
  }

  public static getInstance(): OrchestratorHandlers {
    if (!OrchestratorHandlers.instance) {
      OrchestratorHandlers.instance = new OrchestratorHandlers()
    }

    return OrchestratorHandlers.instance
  }

  public initializeResolver = (snapshotName: string) => {
    return new Promise((resolve, reject) => {
      const modelFolder = './orchestrator-files/model'
      const snapshotFile = `./orchestrator-files/blu/${snapshotName}.blu`

      const fullModelFolder = path.resolve(modelFolder)
      this.orchestrator.load(fullModelFolder)

      const fullSnapshotPath = path.resolve(snapshotFile)
      if (!fs.existsSync(fullSnapshotPath)) {
        reject(new Error(`Snapshot (.blu file) does not exist at ${fullSnapshotPath}.`))
      }
      // Load the snapshot
      const snapshot = fs.readFileSync(fullSnapshotPath)

      // Load snapshot and create resolver
      this.resolvers[snapshotName] = this.orchestrator.createLabelResolver(snapshot)
      resolve(true)
    })
  }

  public initializeResolvers = () => {
    return new Promise( async (resolve, reject) => {
      console.info('Initializing orchestrator...')
      console.info('Initializing Dispatch resolver:')
      await this.initializeResolver('Dispatch')
      console.info('Initializing SmallTalk resolver:')
      await this.initializeResolver('SmallTalk')
      console.info('...orchestrator initilization complete.')
      resolve(true)
    })
  }

  public resolve(resolverName: string, utterance: string): any {
    if (resolverName === '2-Stage') {
      return this.resolveDispatchThenSmallTalk(utterance)
    } else {
      return this.resolveWithResolverName(resolverName, utterance)
    }
  }

  public resolveWithResolverName(resolverName: string, utterance: string): any {
    let result: any = { status: 'TBD' }
    const startTime = new Date().getTime()
    if (this.resolvers[resolverName]) {
      result = (this.resolvers[resolverName].score(utterance, 1)).slice(0, 3)
    } else {
      result = { message: `resolver [${resolverName}] not found` }
    }
    const elapsedTime = new Date().getTime() - startTime
    if (result && result[0]) {
      result[0].processingTime = elapsedTime
      result[0].resolver = resolverName
    }
    return result
  }

  public resolveDispatchThenSmallTalk(utterance: string) {
    const dispatchResult = this.resolve('Dispatch', utterance)
    if (dispatchResult && dispatchResult[0].label.name === 'SmallTalk') {
      const smallTalkResult = this.resolve('SmallTalk', utterance)
      smallTalkResult[0].processingTime2Stage = dispatchResult[0].processingTime + smallTalkResult[0].processingTime
      smallTalkResult[0].resolver = 'Dispatch:SmallTalk'
      smallTalkResult[0].label.name = `${dispatchResult[0].label.name}:${smallTalkResult[0].label.name}`
      return [smallTalkResult[0], {
        Dispatch: dispatchResult,
        SmallTalk: smallTalkResult
      }
      ]
    } else {
      return dispatchResult
    }
  }

  public intentHandler: Handler = async (req: AuthRequest, res: Response) => {
    Model.getInstance().onRequest()
    const utterance = req.body?.utterance || req.query?.utterance
    const resolverName = req.body?.resolverName || req.query?.resolverName
    res.status(StatusCodes.OK).json(this.resolve(resolverName, utterance))
  }

  public initHandler: Handler = async (req: AuthRequest, res: Response) => {
    Model.getInstance().onRequest()
    await this.initializeResolvers();
    res.status(StatusCodes.OK).json({ status: 'OK', message: 'Resovlers initialized'})
  }

  public wsIntentHandler = (wss: WebSocketServer, ws: ws, req: IncomingMessage, token?: any) => {
    ws.on('message', (message: string) => {
      Model.getInstance().onRequest()
      console.info(`wsIntentHandler: ${message}`)
      let messageObj: any = {}
      let utterance = ''
      let resolverName = ''
      try {
        messageObj = JSON.parse(message)
        utterance = messageObj.utterance
        resolverName = messageObj.resolver
      } catch (error) {
        utterance = `${message}`
        resolverName = 'Dispatch'
        console.info(`Unable to parse message as json. Using message string as utterance: '${utterance}', and '${resolverName}' as resolverName`)
      }
      let result: any = { status: 'TBD' }
      try {
        result = this.resolve(resolverName, utterance)
      } catch (error) {
        console.info(error)
        result = { status: `Orchestrator error: cannot resolve utterance: ${utterance} with ${resolverName} as resolverName`, error: error }
      }
      ws.send(JSON.stringify(result))
    })
  }
}
