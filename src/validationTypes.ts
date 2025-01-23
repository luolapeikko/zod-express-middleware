import type {Request, RequestHandler} from 'express';
import type {ParamsDictionary} from 'express-serve-static-core';
import type {ParsedQs} from 'qs';
import {type z} from 'zod';

type ZodSchemaBodyType = z.ZodTypeAny;

type StrEnumLike = {
	[x: string]: string;
};

/**
 * used as "root" effect type on Params and Query types (effect need to produce string output).
 * @example
 * const test: ZodStringEffect = z.date().transform((date) => date.getTime()).transform((time) => time.toString());
 */
type ZodStringEffect<T extends string = string> = z.ZodEffects<z.ZodTypeAny, T, any>;

type AnyZodString<T extends string = string> = z.ZodString | z.ZodLiteral<T> | z.ZodBranded<AnyZodString<T>, any> | ZodStringEffect<T>;

type AnyEnum<T extends string> = z.ZodEnum<[T, ...T[]]> | z.ZodBranded<AnyEnum<T>, any>;

type ZodStringBased<T extends string | StrEnumLike> = T extends string ? AnyZodString<T> | AnyEnum<T> : never;

type AnyStringBasedUnion<T extends string> = z.ZodUnion<[ZodStringBased<T>, ...ZodStringBased<T>[]]> | z.ZodBranded<AnyStringBasedUnion<T>, any>;

type ZodNativeStrEnum<T extends string | StrEnumLike> = T extends StrEnumLike ? z.ZodType<T[keyof T], z.ZodNativeEnumDef<T>, T[keyof T]> : never;

type ParamsBaseType<T extends string | StrEnumLike = string | StrEnumLike> = T extends StrEnumLike
	? ZodStringBased<T> | ZodNativeStrEnum<T>
	: T extends string
		? ZodNativeStrEnum<T> | ZodStringBased<T> | AnyStringBasedUnion<T>
		: never;
type ZodSchemaParamsType<T extends string | StrEnumLike = string | StrEnumLike> = z.ZodObject<
	Record<string, ParamsBaseType<T> | z.ZodOptional<ParamsBaseType<T>>>
>;

type ValidQueryBaseType<T extends string | StrEnumLike = string | StrEnumLike> = T extends StrEnumLike
	? ZodNativeStrEnum<T>
	: T extends string
		? ZodStringBased<T> | AnyStringBasedUnion<T>
		: never;
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
