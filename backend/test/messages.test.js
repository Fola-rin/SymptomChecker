import supertest from 'supertest';
import { expect } from 'chai';
import app from '../index.js';

describe('Messages', function () {
	describe('GET /api/messages/:chat_id', function () {
		it('should fetch messages for a given chat identifier', function (done) {
			supertest(app)
				.get('/api/messages/66')
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.be.an('object');
					done();
				});
		});
	});

	describe('POST /api/messages/', function () {
		it('should create a new message', function (done) {
			const newChat = {
				chats: [
					{
						role: 'user',
						content: '\n"""Hello"""',
					},
					{
						role: 'assistant',
						content:
							'{\n  "message": "Hello lol! Please describe your main symptoms in your own words.",\n  "diagnosis": []\n}',
					},
					{
						role: 'user',
						content: '\n"""I have a cough"""',
					},
				],
				chatID: 66,
				system: 'second',
				userInfo: {
					name: 'lol',
					age: '30',
					gender: 'female',
				},
			};

			supertest(app)
				.post('/api/messages')
				.send(newChat)
				.expect('Content-Type', /json/)
				.expect(201)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.be.an('object');
					done();
				});
		});
	});
});
