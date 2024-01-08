import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
	const actualModule = await vi.importActual('react-router-dom');
	return {
		...actualModule,
		useNavigate: () => mockedUseNavigate, // Use the spy
	};
});
import { render, fireEvent, screen } from '@testing-library/react';
import Profile, { LogoutModal } from './index';

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

describe('Profile Component', () => {
	beforeEach(() => {
		window.localStorage.clear();
		vi.resetAllMocks();
	});

	it('redirects to /signup when no user data in localStorage', () => {
		window.localStorage.clear();

		render(
			<MemoryRouter initialEntries={['/profile']}>
				<Profile />
			</MemoryRouter>
		);
		expect(mockedUseNavigate).toHaveBeenCalledWith('/signup');
	});

	it('renders user data from localStorage', () => {
		window.localStorage.setItem(
			'userDetails',
			JSON.stringify({ username: 'John Doe', email: 'john@example.com' })
		);
		render(
			<MemoryRouter initialEntries={['/profile']}>
				<Profile />
			</MemoryRouter>
		);
		expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
		expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
	});
});
