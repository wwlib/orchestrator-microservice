import { Request, Response, Handler } from 'express'
import { AuthRequest } from '@types'
import { StatusCodes } from 'http-status-codes'
import { Model } from '@model'
import { OrchestratorHandlers } from '../OrchestratorHandlers'

// handlebars templates are loaded by WebPack using handlebars-loader
// https://www.npmjs.com/package/handlebars-loader
// see webpack.config.js for handlebars-loader config
const signin_handlebars = require('./signin.handlebars.html');
const dashboard_handlebars = require('./dashboard.handlebars.html');
const console_handlebars = require('./console.handlebars.html');

export class SiteHandlers {
    private static instance: SiteHandlers;

    private constructor() {
    }

    public static getInstance(): SiteHandlers {
        if (!SiteHandlers.instance) {
            SiteHandlers.instance = new SiteHandlers()
        }
        return SiteHandlers.instance
    }

    public redirectToDashboardHandler: Handler = async (req: AuthRequest, res: Response) => {
        res.status(StatusCodes.OK).redirect('/dashboard/');
    }

    public redirectToConsoleHandler: Handler = async (req: AuthRequest, res: Response) => {
        res.status(StatusCodes.OK).redirect('/console/');
    }

    public signinHandler: Handler = async (req: AuthRequest, res: Response) => {
        console.log('signinHandler')
        Model.getInstance().onRequest()
        res.status(StatusCodes.OK).send(this.getSigninContent(req.auth?.userId))
    }

    private getSigninContent(userId?: string) {
        return signin_handlebars({ userId: userId })
    }

    public dashboardHandler: Handler = async (req: AuthRequest, res: Response) => {
        console.log('dashboardHandler')
        Model.getInstance().onRequest()
        res.status(StatusCodes.OK).send(this.getDashboardContent(req.auth?.userId))
    }

    private getDashboardContent(userId?: string) {
        const data = []
        for (let i=0; i<7; i++) {
            data.push(15000 + Math.floor(Math.random()*5000))
        }
        return dashboard_handlebars({ linkStates: { dashboard: 'active', console: '' }, userId: userId, requestCount: Model.getInstance().requestCount, chartData: data.join(',') })
    }

    public consoleHandler: Handler = async (req: AuthRequest, res: Response) => {
        console.log('consoleHandler')
        Model.getInstance().onRequest()
        const resolverName: string = req.query?.resolverName ? `${req.query?.resolverName}` : ''
        const utterance: string = req.query?.utterance ? `${req.query?.utterance}` : ''
        let summary = ''
        let details = ''
        if (resolverName && utterance) {
            const result = OrchestratorHandlers.getInstance().resolve(resolverName, utterance)
            console.log(result)
            const best = result[0];
            const summaryData = {
                resolver: best.resolver,
                label: best.label.name,
                closest_text: best.closest_text,
                score: best.score, 
                processingTime: `${best.processingTime2Stage || best.processingTime} ms`,
            }

            summary = JSON.stringify(summaryData, null, 2)
            details = JSON.stringify(result, null, 2)
        }
        res.status(StatusCodes.OK).send(this.getConsoleContent(req.auth?.userId, utterance, resolverName, summary, details))
    }

    private getConsoleContent(userId: string | undefined, utterance: string, resolverName: string, summary: string, details: string) {
        return console_handlebars({ linkStates: { dashboard: '', console: 'active' }, userId: userId, utterance, resolverName, summary, details })
    }

    public forbiddenHandler: Handler = async (req: AuthRequest, res: Response) => {
        console.log('forbiddenHandler')
        Model.getInstance().onRequest()
        res.status(StatusCodes.OK).json({ error: 'Forbidden.' })
    }
}
