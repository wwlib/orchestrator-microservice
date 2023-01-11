import { Request, Response, Handler } from 'express'
import { AuthRequest } from '@types'
import { StatusCodes } from 'http-status-codes'

export class ExampleHandlers {

  static getHandler: Handler = async (req: AuthRequest, res: Response) => {
    console.info('ExampleHandler: req.query:', req.query)
    const utterance = req.query?.utterance
    let userId = '';
    if (req.auth && req.auth.accessTokenPayload) {
      userId = req.auth.accessTokenPayload.userId
    }
    const result = { status: 'OK', utterance: utterance || 'na', userId }
    res.status(StatusCodes.OK).json(result)
  }

  static postHandler: Handler = async (req: AuthRequest, res: Response) => {
    console.info('ExampleHandler: req.body:', req.body)
    const utterance = req.body?.utterance
    let userId = '';
    if (req.auth && req.auth.accessTokenPayload) {
      userId = req.auth.accessTokenPayload.userId
    }
    const result = { status: 'OK', utterance: utterance || 'na', userId }
    res.status(StatusCodes.OK).json(result)
  }
}
