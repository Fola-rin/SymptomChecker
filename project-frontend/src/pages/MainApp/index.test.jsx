// MainApp.test.jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import MainApp from './index';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

const apiUrl = import.meta.env.PROD
	? import.meta.env.VITE_API_PROD_URL
	: import.meta.env.VITE_API_URL;

vi.mock('axios');
const mockedUseNavigate = vi.fn();

// Mock react-router-dom and its useNavigate hook
vi.mock('react-router-dom', async () => {
	const actualModule = await vi.importActual('react-router-dom');
	return {
		...actualModule,
		useNavigate: () => mockedUseNavigate,
	};
});

// Mock localStorage
const localStorageMock = (function () {
	let store = {};
	return {
		getItem(key) {
			return store[key] || null;
		},
		setItem(key, value) {
			store[key] = value.toString();
		},
		clear() {
			store = {};
		},
	};
})();
Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
});

describe('MainApp Component', () => {
	beforeEach(() => {
		window.localStorage.clear();
		mockedUseNavigate.mockClear();
		axios.post.mockReset();
		axios.get.mockReset();
	});

	it('fetches and displays chats on successful API response', async () => {
		axios.mockImplementation((config) => {
			if (
				config.method === 'get' &&
				config.url === `${apiUrl}chats/john@example.com`
			) {
				return Promise.resolve({
					data: {
						response: [{ diagnosis: null, chat_name: 'Test Chat', system: '' }],
					},
				});
			}
			return Promise.reject(new Error('not found'));
		});

		// Set localStorage data
		localStorage.setItem(
			'userDetails',
			JSON.stringify({ username: 'John Doe', email: 'john@example.com' })
		);

		render(
			<MemoryRouter>
				<MainApp />
			</MemoryRouter>
		);
		await waitFor(() =>
			expect(axios).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'get',
					url: `${apiUrl}chats/john@example.com`,
				})
			)
		);
		await waitFor(() =>
			expect(screen.getByText('Test Chat (second system)')).toBeInTheDocument()
		);
	});

	it('sends a message and displays bot response', async () => {
		// Mock Axios for message sending and response

		axios.mockImplementation((config) => {
			if (config.method === 'post' && config.url === `${apiUrl}messages`) {
				return Promise.resolve({
					data: {
						response: {
							role: 'assistant',
							content: '{"message": "Hello, how can I help you?"}',
						},
					},
				});
			} else if (
				config.method === 'get' &&
				config.url === `${apiUrl}chats/john@example.com`
			) {
				return Promise.resolve({
					data: {
						response: [
							{
								diagnosis: null,
								chat_name: 'Test Chat',
								system: '',
								chat_id: 'chat1',
							},
						],
					},
				});
			}
			// return Promise.reject(new Error('not found'));
		});

		// Set localStorage data
		localStorage.setItem(
			'userDetails',
			JSON.stringify({ username: 'John Doe', email: 'john@example.com' })
		);

		render(
			<MemoryRouter>
				<MainApp />
			</MemoryRouter>
		);

		await waitFor(() =>
			expect(axios).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'get',
					url: `${apiUrl}chats/john@example.com`,
				})
			)
		);

		// Wait for chat list to be loaded
		await waitFor(() => screen.getByText('Test Chat (second system)'));

		// Simulate selecting a chat
		fireEvent.click(screen.getByText('Test Chat (second system)'));

		fireEvent.change(screen.getByPlaceholderText('Type your message'), {
			target: { value: 'Hello' },
		});
		fireEvent.click(screen.getByText('send'));

		await waitFor(() =>
			expect(axios).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'post',
					url: `${apiUrl}messages`,
				})
			)
		);
		await waitFor(() =>
			expect(screen.getByText('Hello, how can I help you?')).toBeInTheDocument()
		);
	});
});
