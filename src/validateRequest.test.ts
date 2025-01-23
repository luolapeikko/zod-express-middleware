import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {z} from 'zod';
import {errorMiddleWare, okResponseHandler, startExpress, stopExpress} from './expressHelpers';
import {validateRequest, type ZodMiddlewareObject} from '.';

const headers = {'Content-Type': 'application/json'};
const url = 'http://localhost:8936';

enum NativeEnum {
	TRUE = 'true',
	FALSE = 'false',
}

const sub1ValueSchema = z.enum(['sub1_1', 'sub1_2']).brand('Sub1Brand');
const sub2ValueSchema = z.enum(['sub2_1', 'sub2_2']).brand('Sub2Brand');
const allSubValueSchema = z.union([sub1ValueSchema, sub2ValueSchema]);
const allSubValueBrandSchema = z.union([sub1ValueSchema, sub2ValueSchema]).brand('AllSubBrand');

export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export function isUUID(value: string): value is UUID {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export const uuidSchema = z.string().refine<UUID>(isUUID).brand('uuid');

const stringBody = {
	body: z.string(),
} satisfies ZodMiddlewareObject;

const objectBody = {
	body: z.object({
		data: z.string().brand('data'),
	}),
} satisfies ZodMiddlewareObject;

const queryParams = {
	query: z.object({
		id: z.string(),
		brand: z.string().brand('brand').optional(),
		enum: z.enum(['true', 'false']).optional(),
		nenum: z.nativeEnum(NativeEnum).optional(),
		refine: z
			.string()
			.refine<'true'>((v) => v === 'true')
			.optional(),
		uuidSchema: uuidSchema.optional(),
		sub1: sub1ValueSchema.optional(),
		union: allSubValueSchema.optional(),
		bunion: allSubValueBrandSchema.optional(),
		literal: z.literal('test').optional(),
		bliteral: z.literal('test').brand('test').optional(),
	}),
} satisfies ZodMiddlewareObject;

const paramParams = {
	params: z.object({
		id: z.string(),
		brand: z.string().brand('brand').optional(),
		enum: z.enum(['true', 'false']).optional(),
		nenum: z.nativeEnum(NativeEnum).optional(),
		refine: z
			.string()
			.refine<'true'>((v) => v === 'true')
			.optional(),
		uuidSchema: uuidSchema.optional(),
		sub1: sub1ValueSchema.optional(),
		union: allSubValueSchema.optional(),
		bunion: allSubValueBrandSchema.optional(),
		literal: z.literal('test').optional(),
		bliteral: z.literal('test').brand('test').optional(),
	}),
} satisfies ZodMiddlewareObject;

async function expectRes(path: string, init: RequestInit, status: number, text: string) {
	const res = await fetch(`${url}/${path}`, init);
	expect(await res.text()).toBe(text);
	expect(res.status).toBe(status);
}

describe('zodErrorToString', function () {
	beforeAll(async () => {
		const app = await startExpress(8936);
		app.post('/string', validateRequest(stringBody), okResponseHandler);
		app.post('/object', validateRequest(objectBody), okResponseHandler);
		app.post('/query', validateRequest(queryParams), okResponseHandler);
		app.post('/param', validateRequest(paramParams), okResponseHandler);
		app.post('/param/:id', validateRequest(paramParams), okResponseHandler);
		app.post('/param/:id', validateRequest(paramParams), okResponseHandler);
		app.use(errorMiddleWare);
	});
	describe('errors', function () {
		it('should have error from string validation', async function () {
			await expectRes('string', {method: 'POST', body: JSON.stringify({}), headers}, 400, `ZodMiddlewareError:path 'body' Expected string, received object`);
		});
		it('should build error from object validation', async function () {
			await expectRes('object', {method: 'POST', body: JSON.stringify({}), headers}, 400, `ZodMiddlewareError:path 'body.data' Required`);
		});
		it('should build error from query validation', async function () {
			await expectRes('query', {method: 'POST', body: JSON.stringify({}), headers}, 400, `ZodMiddlewareError:path 'query.id' Required`);
		});
		it('should build error from param validation', async function () {
			await expectRes('param', {method: 'POST', body: JSON.stringify({}), headers}, 400, `ZodMiddlewareError:path 'params.id' Required`);
		});
	});
	describe('validated', function () {
		it('should valid response for object', async function () {
			await expectRes('object', {method: 'POST', body: JSON.stringify({data: 'data'}), headers}, 200, `OK`);
		});
		it('should valid response for query', async function () {
			await expectRes('query?id=data', {method: 'POST', body: null, headers}, 200, `OK`);
		});
		it('should valid response for query', async function () {
			await expectRes('param/data', {method: 'POST', body: null, headers}, 200, `OK`);
		});
	});
	afterAll(async () => {
		await stopExpress();
	});
});
