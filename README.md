# @luolapeikko/zod-express-middleware

ExpressJS Zod Validation Middleware

This is a direct replacement for zod-express-middleware module.

- uses ExpressJS error middleware handling and passing ZodError instance to error middleware.
- ZodMiddlewareObject Object builder type for Request validation.
- ZodInferRequest and ZodInferRequestHandler types to build Request or RequestHandler types from type of ZodMiddlewareObject.
- Optionally can use TS satisfies to help build schema object.

## install

```bash
npm i @luolapeikko/zod-express-middleware
```

## usage

```typescript
const demoRequestSchema = {
	params: z.object({
		id: z.string(),
	}),
	query: z.object({
		filter: z.string().optional(),
	}),
	body: z.object({
		name: z.string().min(3).max(255),
		email: z.string().email(),
		password: z.string().min(8).max(255),
	}),
} satisfies ZodMiddlewareObject;

// build RequestHandler type
type DemoRequestHandler = ZodInferRequestHandler<typeof demoRequestSchema>;
// or just Request
type DemoRequest = ZodInferRequest<typeof demoRequestSchema>;

// in router
route.put('/:id', validateRequest(demoRequestSchema), handleDemo);

// in error middleware
export const errorMiddleWare: ErrorRequestHandler = (err, _req, res, next) => {
	if (err instanceof z.ZodError) {
		res.status(400).send(`Validation Error: ${zodErrorToString(err)}`);
	}
	//
};
```

## Extend Request and RequestHandler types with already customized Request type.

```typescript
// build Request type which uses CustomRequest and ZodMiddlewareObject
export type ZodCustomRequest<T extends ZodMiddlewareObject, ResBody = any, Locals extends Record<string, unknown> = Record<string, unknown>> = CustomRequest<
	ZodParamsType<T['params']>,
	ResBody,
	ZodBodyType<T['body']>,
	ZodQueryType<T['query']>,
	Locals
>;

// type DemoRequest = ZodCustomRequest<typeof demoRequestSchema>;

// build RequestHandler type which uses ZodCustomRequest
export type ZodCustomRequestHandler<T extends ZodMiddlewareObject, ResBody = any, Locals extends Record<string, unknown> = Record<string, unknown>> = (
	req: ZodCustomRequest<T, ResBody, Locals & LocalsTokenPayload>,
	res: Response<ResBody, Locals & LocalsTokenPayload>,
	next: NextFunction,
) => void;

// type DemoRequestHandler = ZodCustomRequestHandler<typeof demoRequestSchema>;
```
