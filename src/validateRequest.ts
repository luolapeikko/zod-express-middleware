import type {RequestHandler} from 'express';
import {z} from 'zod';
import type {InferZodBody, InferZodParams, InferZodQuery, ZodMiddlewareObject} from './validationTypes';

export type ValidateOptions = {
	/** Replace Request values with validated values */
	replace?: boolean;
};

/**
 * Validate schema for ExpressJS request
 * @example
 * const demoRequestSchema = {
 *   body: z.object({
 *     hello: z.string(),
 *   }),
 * } satisfies ZodMiddlewareObject;
 * type DemoRequestHandler = ZodInferRequestHandler<typeof demoRequestSchema>;
 *
 * const handleDemoRequest: DemoRequestHandler = (req, res) => {
 *   res.status(200).send(req.body.hello);
 * }
 * route.post('/', validateRequest(demoRequestSchema), handleDemoRequest);
 */
export function validateRequest<Z extends ZodMiddlewareObject>(
	schema: Z,
	{replace}: ValidateOptions = {replace: false},
): RequestHandler<InferZodParams<Z>, any, InferZodBody<Z>, InferZodQuery<Z>> {
	const validationObject = z.object({
		body: schema.body ?? z.any(),
		params: schema.params ?? z.record(z.string(), z.any()),
		query: schema.query ?? z.record(z.string(), z.any()),
	});
	return function (req, _res, next) {
		const status = validationObject.safeParse(req);
		if (replace && status.success) {
			if (schema.body) {
				req.body = status.data.body as InferZodBody<Z>;
			}
			if (schema.params) {
				req.params = status.data.params as InferZodParams<Z>;
			}
			if (schema.query) {
				// patch values to current query object (instance)
				Object.assign(req.query, status.data.query as InferZodQuery<Z>);
			}
		}
		next(status.error);
	};
}
