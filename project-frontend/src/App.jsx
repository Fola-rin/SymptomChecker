import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import {
	createBrowserRouter,
	RouterProvider,
	Route,
	Link,
} from 'react-router-dom';
import MainApp from './pages/MainApp';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Login from './pages/Auth/Login';

const router = createBrowserRouter([
	{
		path: '/',
		element: <MainApp />,
		children: [],
	},
	{
		path: 'profile',
		element: <Profile />,
	},
	{
		path: 'signup',
		element: <Auth />,
	},
	{
		path: 'login',
		element: <Login />,
	},
]);

function App() {
	return <RouterProvider router={router} />;
}
export default App;
