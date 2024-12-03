import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebase';
import PillList from './PillList';
import './App.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [pills, setPills] = useState([]);
    const [pillName, setPillName] = useState('');
    const [pillTime, setPillTime] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const savedToken = localStorage.getItem('authToken');
        if (savedToken) {
            setToken(savedToken);
            setIsLoggedIn(true);
            fetchPills(savedToken);
        }
    }, []);

    const login = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            setToken(idToken);
            setIsLoggedIn(true);
            localStorage.setItem('authToken', idToken);
            fetchPills(idToken);
        } catch (error) {
            switch (error.code) {
                case 'auth/user-not-found':
                    setErrorMessage('No user found with this email.');
                    break;
                case 'auth/wrong-password':
                    setErrorMessage('Incorrect password.');
                    break;
                case 'auth/invalid-email':
                    setErrorMessage('Invalid email address.');
                    break;
                default:
                    setErrorMessage('Login failed. Please try again.');
            }
        }
    };

    const logout = () => {
        setToken('');
        setIsLoggedIn(false);
        setPills([]);
        localStorage.removeItem('authToken');
    };

    const fetchPills = async (authToken) => {
        try {
            const response = await fetch('http://localhost:3001/api/pills', {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const data = await response.json();
            setPills(data.pills || []);
        } catch {
            setErrorMessage('Failed to fetch pills.');
        }
    };

    const addPill = async () => {
        if (!pillName || !pillTime) {
            setErrorMessage('Please enter both pill name and time.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/pills', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: pillName, time: pillTime }),
            });
            const newPill = await response.json();
            setPills([...pills, newPill]);
            setAlertMessage('Pill added successfully!');
            setTimeout(() => setAlertMessage(''), 3000);
        } catch {
            setErrorMessage('Failed to add pill.');
        }

        setPillName('');
        setPillTime('');
        setErrorMessage('');
    };

    const deletePill = async (id) => {
        try {
            await fetch(`http://localhost:3001/api/pills/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            setPills(pills.filter((pill) => pill.id !== id));
            setAlertMessage('Pill deleted successfully!');
            setTimeout(() => setAlertMessage(''), 3000);
        } catch {
            setErrorMessage('Failed to delete pill.');
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="login-icon">🔒</div>
                    <h2>Login</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-control"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control"
                    />
                    <button onClick={login} className="btn btn-orange w-100">
                        Login
                    </button>
                    {errorMessage && <p className="error">{errorMessage}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="main-container">
            <div className="title-icon">💊</div>
            <h1>Pill Tracker</h1>
            <button onClick={logout} className="btn btn-outline-orange">Logout</button>
            {alertMessage && <div className="alert alert-success">{alertMessage}</div>}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

            <div className="pill-form">
                <h2>Add New Pill</h2>
                <input
                    type="text"
                    placeholder="Pill Name"
                    value={pillName}
                    onChange={(e) => setPillName(e.target.value)}
                    className="form-control"
                />
                <input
                    type="time"
                    value={pillTime}
                    onChange={(e) => setPillTime(e.target.value)}
                    className="form-control"
                />
                <button onClick={addPill} className="btn btn-orange">
                    Add Pill
                </button>
            </div>

            <div className="pill-list">
                <h2>Your Pills</h2>
                <PillList pills={pills} onDelete={deletePill} />
            </div>
        </div>
    );
}

export default App;