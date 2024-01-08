// Auth.test.jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import Auth from './index';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

const apiUrl = import.meta.env.PROD
	? import.meta.env.VITE_API_PROD_URL
	: import.meta.env.VITE_API_URL;
// Mock axios
vi.mock('axios');

// Creating a spy for useNavigate
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

describe('Auth Component', () => {
	beforeEach(() => {
		window.localStorage.clear();
		mockedUseNavigate.mockClear();
		// axios.post.mockClear();
		axios.post.mockReset();
	});

	it('submits form and handles API response, then navigates to home after successful signup', async () => {
		axios.mockImplementation((config) => {
			if (config.method === 'post' && config.url === `${apiUrl}users`) {
				return Promise.resolve({ data: { message: 'Success' } });
			}
			return Promise.reject(new Error('not found'));
		});

		render(
			<MemoryRouter>
				<Auth />
			</MemoryRouter>
		);

		fireEvent.change(screen.getByLabelText('Name'), {
			target: { value: 'John Doe' },
		});
		fireEvent.change(screen.getByLabelText('Email'), {
			target: { value: 'johndoe@example.com' },
		});
		fireEvent.change(screen.getByLabelText('Password'), {
			target: { value: 'password123' },
		});
		fireEvent.change(screen.getByLabelText('Gender'), {
			target: { value: 'male' },
		});
		fireEvent.change(screen.getByLabelText('Age'), { target: { value: '30' } });

		const submitButton = screen.getByRole('button', { name: /sign up/i });
		fireEvent.click(submitButton);

		await waitFor(() =>
			expect(axios).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'post',
					url: `${apiUrl}users`,
				})
			)
		);
		await waitFor(() =>
			expect(
				screen.getByText('Account created successfully')
			).toBeInTheDocument()
		);
		await waitFor(() => expect(mockedUseNavigate).toHaveBeenCalledWith('/'));
	});
});
