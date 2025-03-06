import {type RequestHandler} from 'express';
import {z} from 'zod';
import {type ResolveZodBody, type ResolveZodParams, type ResolveZodQuery, type ZodMiddlewareObject} from './validationTypes';

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
export function validateRequest<Z extends ZodMiddlewareObject>(
	schema: Z,
	{replace}: ValidateOptions = {replace: false},
): RequestHandler<ResolveZodParams<Z>, any, ResolveZodBody<Z>, ResolveZodQuery<Z>> {
	const validationObject = z.object({
		body: schema.body ?? z.any(),
		params: schema.params ?? z.record(z.string(), z.any()),
		query: schema.query ?? z.record(z.string(), z.any()),
	});
	return function (req, _res, next) {
		const status = validationObject.safeParse(req);
		if (!status.success) {
			next(status.error);
		} else {
			if (replace) {
				if (schema.body) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					req.body = status.data.body;
				}
				if (schema.params) {
					req.params = status.data.params as ResolveZodParams<Z>;
				}
				if (schema.query) {
					req.query = status.data.query;
				}
			}
			next();
		}
	};
}
