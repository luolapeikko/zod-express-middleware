/* eslint-disable @typescript-eslint/no-explicit-any */
import type {Request, RequestHandler} from 'express';
import type {ParamsDictionary} from 'express-serve-static-core';
import type {ParsedQs} from 'qs';
import {type z} from 'zod';

type ZodSchemaBodyType = z.ZodTypeAny;

type ParamsBaseType = z.ZodString | z.ZodEnum<[string, ...string[]]> | z.ZodNativeEnum<any>;
type ZodSchemaParamsType = z.ZodObject<Record<string, ParamsBaseType | z.ZodOptional<ParamsBaseType>>>;

type ValidQueryBaseType = z.ZodString | z.ZodEnum<[string, ...string[]]> | z.ZodNativeEnum<any>;
type ZodSchemaQueryType = z.ZodObject<Record<string, ValidQueryBaseType | z.ZodOptional<ValidQueryBaseType>>>;

export type ZodParamsType<T extends ZodSchemaParamsType | undefined> = T extends ZodSchemaParamsType ? z.infer<T> : ParamsDictionary;
export type ZodBodyType<T extends ZodSchemaBodyType | undefined> = T extends ZodSchemaBodyType ? z.infer<T> : unknown;
export type ZodQueryType<T extends ZodSchemaQueryType | undefined> = T extends ZodSchemaQueryType ? z.infer<T> : ParsedQs;

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
	body?: ZodSchemaBodyType;
	params?: ZodSchemaParamsType;
	query?: ZodSchemaQueryType;
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

/**
 * Express Resolvers for ZodMiddlewareObject
 */
export type ResolveZodParams<Z extends ZodMiddlewareObject> = Z['params'] extends ZodSchemaParamsType ? z.infer<Z['params']> : ParamsDictionary;
export type ResolveZodBody<Z extends ZodMiddlewareObject> = Z['body'] extends ZodSchemaBodyType ? z.infer<Z['body']> : unknown;
export type ResolveZodQuery<Z extends ZodMiddlewareObject> = Z['query'] extends ZodSchemaQueryType ? z.infer<Z['query']> : ParsedQs;
