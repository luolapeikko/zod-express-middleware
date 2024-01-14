import {ParamsDictionary} from 'express-serve-static-core';
import {RequestHandler} from 'express';
import {z} from 'zod';
import {ZodMiddlewareObject} from './validationTypes';

export type ValidateOptions = {
	/** Replace Request values with validated values */
	replace?: boolean;
};

/**
 * Validate schema for ExpressJS request
 * @example
 * const demoRequestSchema = {
 *   body: z.object({
 * 	   hello: z.string(),
 *   }),
 * } satisfies ZodMiddlewareObject;
 * type DemoRequestHandler = ZodInferRequestHandler<typeof demoRequestSchema>;
 *
 * const handleDemoRequest: DemoRequestHandler = (req, res) => {
 *   res.status(200).send(req.body.hello);
 * }
 * route.post('/', validateRequest(demoRequestSchema), handleDemoRequest);
 */
export function validateRequest(schema: ZodMiddlewareObject, {replace}: ValidateOptions = {replace: false}): RequestHandler {
	const validationObject = z.object({
		body: schema.body || z.any(),
		params: schema.params || z.any(),
		query: schema.query || z.any(),
	});
	return function (req, _res, next) {
		const status = validationObject.safeParse(req);
		if (!status.success) {
			next(status.error);
		} else {
			if (replace) {
				if (schema.body) {
					req.body = status.data.body;
				}
				if (schema.params) {
					req.params = status.data.params as ParamsDictionary;
				}
				if (schema.query) {
					req.query = status.data.query;
				}
			}
			next();
		}
	};
}
