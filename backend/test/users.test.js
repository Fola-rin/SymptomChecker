import supertest from 'supertest';
import { expect } from 'chai';
import sinon from 'sinon';
import app from '../index.js';

describe('Users', function () {
	describe('POST /api/users/', function () {
		it('should create a new user', function (done) {
			const newUser = {
				userDetails: {
					username: 'Fola',
					email: 'fola@fola1.com',
					gender: 'male',
					age: '20',
					password: '1234',
				},
			};
			supertest(app)
				.post('/api/users')
				.send(newUser)
				.expect('Content-Type', /json/)
				.expect(201)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.be.an('object');
					done();
				});
		});
	});
	describe('POST /api/users/login', function () {
		it('should authenticate a user', function (done) {
			const userInfo = {
				userDetails: {
					email: 'fola@fola.com',
					password: '1234',
				},
			};
			supertest(app)
				.post('/api/users/login')
				.send(userInfo)
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
