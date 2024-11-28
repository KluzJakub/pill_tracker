import React, { useState, useEffect } from 'react';
import PillList from './PillList';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
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

    const login = () => {
        fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.token) {
                    setToken(data.token);
                    setIsLoggedIn(true);
                    localStorage.setItem('authToken', data.token);
                    fetchPills(data.token);
                } else {
                    alert(data.message || 'Login failed');
                }
            });
    };

    const logout = () => {
        setToken('');
        setIsLoggedIn(false);
        setPills([]);
        localStorage.removeItem('authToken');
    };

    const fetchPills = (authToken) => {
        fetch('http://localhost:3001/pills', {
            headers: { Authorization: `Bearer ${authToken}` },
        })
            .then((response) => response.json())
            .then((data) => setPills(data));
    };

    const addPill = () => {
        if (!pillName || !pillTime) {
            setErrorMessage('Please enter both pill name and time.');
            return;
        }

        fetch('http://localhost:3001/pills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: pillName, time: pillTime }),
        })
            .then((response) => response.json())
            .then((newPill) => {
                setPills([...pills, newPill]);
                setAlertMessage('Pill added successfully!');
                setTimeout(() => setAlertMessage(''), 3000);
            });

        setPillName('');
        setPillTime('');
        setErrorMessage('');
    };

    const deletePill = (id) => {
        fetch(`http://localhost:3001/pills/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        }).then(() => {
            setPills(pills.filter((pill) => pill.id !== id));
            setAlertMessage('Pill deleted successfully!');
            setTimeout(() => setAlertMessage(''), 3000);
        });
    };

    if (!isLoggedIn) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="login-icon">
                        🔒
                    </div>
                    <h2 className="text-center mb-4">Login</h2>
                    <div className="form-group mb-3">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="form-control"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-control"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-orange w-100" onClick={login}>
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="main-container">
            <div className="tracker-title">
                <div className="title-icon">💊</div>
                <h1 className="tracker-name">Pill Tracker</h1>
                <p className="tracker-subtitle">Your Daily Pill Reminder</p>
            </div>
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="d-flex justify-content-end mb-4">
                        <button className="btn btn-outline-orange" onClick={logout}>
                            Logout
                        </button>
                    </div>
                    {alertMessage && (
                        <div className="alert alert-success text-center" role="alert">
                            {alertMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className="alert alert-danger text-center" role="alert">
                            {errorMessage}
                        </div>
                    )}
                    <div className="card shadow p-4 mb-4 form-card">
                        <h2 className="text-center mb-3">Add a New Pill</h2>
                        <div className="form-group mb-3">
                            <label htmlFor="pillName">Pill Name</label>
                            <input
                                id="pillName"
                                type="text"
                                className="form-control"
                                placeholder="Enter pill name"
                                value={pillName}
                                onChange={(e) => setPillName(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="pillTime">Time</label>
                            <input
                                id="pillTime"
                                type="time"
                                className="form-control"
                                value={pillTime}
                                onChange={(e) => setPillTime(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-orange w-100" onClick={addPill}>
                            Add Pill
                        </button>
                    </div>
                    <h3 className="text-center mb-3">Your Pills</h3>
                    <PillList pills={pills} onDelete={deletePill} />
                </div>
            </div>
        </div>
    );
}

export default App;