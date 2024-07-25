/* eslint-disable sort-keys */
import 'jest';
import {describe, expect} from '@jest/globals';
import {errorMiddleWare, okResponseHandler, startExpress, stopExpress} from './expressHelpers';
import fetch from 'cross-fetch';
import {validateRequest} from './validateRequest';
import {z} from 'zod';
import {type ZodMiddlewareObject} from './validationTypes';

const headers = {'Content-Type': 'application/json'};
const url = 'http://localhost:8936';

enum NativeEnum {
	TRUE = 'true',
	FALSE = 'false',
}

const stringBody = {
	body: z.string(),
} satisfies ZodMiddlewareObject;

const objectBody = {
	body: z.object({
		data: z.string(),
	}),
} satisfies ZodMiddlewareObject;

const queryParams = {
	query: z.object({
		id: z.string(),
		enum: z.enum(['true', 'false']).optional(),
		nenum: z.nativeEnum(NativeEnum).optional(),
	}),
} satisfies ZodMiddlewareObject;

const paramParams = {
	params: z.object({
		id: z.string(),
		enum: z.enum(['true', 'false']).optional(),
		nenum: z.nativeEnum(NativeEnum).optional(),
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
