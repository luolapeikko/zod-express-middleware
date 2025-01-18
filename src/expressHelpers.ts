import {type Server} from 'http';
import Express, {type Application, type ErrorRequestHandler, type RequestHandler} from 'express';
import {z} from 'zod';

function printIssue(issue: z.ZodIssue): string {
	const buildPath = issue.path.length > 0 ? issue.path.map((p) => p.toString()).join('.') : undefined;
	return buildPath ? `path '${buildPath}' ${issue.message}` : issue.message;
}

function zodErrorToString(error: z.ZodError): string {
	return error.issues.map(printIssue).join(', ');
}

const app = Express();

let server: undefined | Server;
export async function startExpress(port: string | number): Promise<Application> {
	return new Promise((resolve) => {
		server = app.listen(port, () => {
			app.use(Express.json());
			resolve(app);
		});
	});
}

export async function stopExpress(): Promise<void> {
	return new Promise((resolve, reject) => {
		if (!server) {
			reject(new Error('no express instance found'));
		} else {
			server.close(() => {
				resolve();
			});
		}
	});
}

export const errorMiddleWare: ErrorRequestHandler = (err, _req, res, next) => {
	if (err instanceof z.ZodError) {
		res.status(400).send(`ZodMiddlewareError:${zodErrorToString(err)}`);
	}
	next();
};

export const okResponseHandler: RequestHandler = (_req, res) => {
	res.status(200).send('OK');
};
