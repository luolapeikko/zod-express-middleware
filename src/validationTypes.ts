import type {StandardSchemaV1} from '@standard-schema/spec';
import type {Request, RequestHandler} from 'express';
import type {ParamsDictionary, Query} from 'express-serve-static-core';

/** Base type for Standard Schema Body */
type StandardSchemaBodyType<T = unknown> = StandardSchemaV1<unknown, T>;

/** Base type for Standard Schema Params */
type StandardSchemaParamsType<T extends ParamsDictionary = ParamsDictionary> = StandardSchemaV1<ParamsDictionary, T>;

/** Base type for Standard Schema Query params */
type StandardSchemaQueryType<T extends Query = Query> = StandardSchemaV1<Query, T>;

/** Infer output type from StandardSchemaV1 */
type StandardOutputInfer<T> = T extends StandardSchemaV1<infer _, infer U> ? U : never;

/**
 * Infer Params type from ZodMiddlewareObject.
 */
export type InferZodParams<Z extends ZodMiddlewareObject> = Z['params'] extends StandardSchemaParamsType ? StandardOutputInfer<Z['params']> : ParamsDictionary;
/**
 * Infer Body type from ZodMiddlewareObject.
 */
export type InferZodBody<Z extends ZodMiddlewareObject> = Z['body'] extends StandardSchemaBodyType ? StandardOutputInfer<Z['body']> : unknown;
/**
 * Infer Query type from ZodMiddlewareObject.
 */
export type InferZodQuery<Z extends ZodMiddlewareObject> = Z['query'] extends StandardSchemaQueryType ? StandardOutputInfer<Z['query']> : Query;

export type ZodParamsType<T extends StandardSchemaParamsType | undefined> = T extends StandardSchemaParamsType ? StandardOutputInfer<T> : ParamsDictionary;
export type ZodBodyType<T extends StandardSchemaBodyType | undefined> = T extends StandardSchemaBodyType ? StandardOutputInfer<T> : unknown;
export type ZodQueryType<T extends StandardSchemaQueryType | undefined> = T extends StandardSchemaQueryType ? StandardOutputInfer<T> : Query;

/**
 * Validate schema for ExpressJS request
 * @example
 * export const validateSchema = {
 * 	body: z.object({
 * 		name: z.string().min(1),
 * 	}),
 * } satisfies ZodMiddlewareObject;
 */
export type ZodMiddlewareObject = {
	body?: StandardSchemaBodyType;
	params?: StandardSchemaParamsType;
	query?: StandardSchemaQueryType;
};

/**
 * This is a type that can be used to infer the type of the ExpressJS Request handler.
 * @template T - The ZodMiddlewareObject
 * @template ResBody - Optional type of the response body, defaults to any
 * @template Locals - Optional type of the response locals, defaults to Record<string, any>
 * @example
 * export const validateSchema = {
 * 	body: z.object({
 * 		name: z.string().min(1),
 * 	}),
 * } satisfies ZodMiddlewareObject;
 *
 * export type ValidateRequestHandler = ZodInferRequestHandler<typeof validateSchema>;
 * // type ValidateRequestHandler = RequestHandler<ParamsDictionary, any, {name: string;}, ParsedQs, Record<string, any>>
 */
export type ZodInferRequestHandler<T extends ZodMiddlewareObject, ResBody = any, Locals extends Record<string, any> = Record<string, any>> = RequestHandler<
	ZodParamsType<T['params']>,
	ResBody,
	ZodBodyType<T['body']>,
	ZodQueryType<T['query']>,
	Locals
>;

/**
 * This is a type that can be used to infer the type of the ExpressJS Request
 * @template T - The ZodMiddlewareObject
 * @template ResBody - Optional type of the response body, defaults to any
 * @template Locals - Optional type of the response locals, defaults to Record<string, any>
 * @example
 * export const validateSchema = {
 * 	body: z.object({
 * 		name: z.string().min(1),
 * 	}),
 * } satisfies ZodMiddlewareObject;
 *
 * export type ValidateRequest = ZodInferRequest<typeof validateSchema>;
 * // type ValidateRequest = Request<ParamsDictionary, any, {name: string;}, ParsedQs, Record<string, any>>
 */
export type ZodInferRequest<T extends ZodMiddlewareObject, ResBody = any, Locals extends Record<string, any> = Record<string, any>> = Request<
	ZodParamsType<T['params']>,
	ResBody,
	ZodBodyType<T['body']>,
	ZodQueryType<T['query']>,
	Locals
>;
