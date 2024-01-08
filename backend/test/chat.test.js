import supertest from 'supertest';
import { expect } from 'chai';
import sinon from 'sinon';
import app from '../index.js';

describe('Chats', function () {
	describe('GET /api/chats/:sender_email', function () {
		it('should fetch chats for a given email', function (done) {
			supertest(app)
				.get('/api/chats/Test1@mail.com')
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.be.an('object');
					done();
				});
		});
		afterEach(() => {
			sinon.restore();
		});
	});

	describe('POST /api/chats/', function () {
		it('should create a new chat', function (done) {
			const newChat = {
				sender_email: 'Test1@mail.com',
				system: 'second',
			};
			supertest(app)
				.post('/api/chats')
				.send(newChat)
				.expect('Content-Type', /json/)
				.expect(201)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.be.an('object');
					done();
				});
		});
		afterEach(() => {
			sinon.restore();
		});
	});
});
