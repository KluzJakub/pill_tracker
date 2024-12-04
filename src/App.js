import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from './firebase';
import './App.css';
import { FaPills, FaPlusCircle, FaTrash, FaSignOutAlt, FaUser } from "react-icons/fa";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pills, setPills] = useState([]);
    const [pillName, setPillName] = useState('');
    const [pillTime, setPillTime] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isLoggedIn) fetchPills();
    }, [isLoggedIn]);

    const login = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setIsLoggedIn(true);
            setAlertMessage('Successfully logged in!');
        } catch (error) {
            setErrorMessage('Login failed. Please try again.');
        }
    };

    const logout = () => {
        setIsLoggedIn(false);
        setPills([]);
        setAlertMessage('Logged out successfully.');
    };

    const fetchPills = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "pills"));
            const pillsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPills(pillsArray);
        } catch (error) {
            setErrorMessage('Failed to fetch pills.');
        }
    };

    const addPill = async () => {
        if (!pillName || !pillTime) {
            setErrorMessage('Please enter both pill name and time.');
            return;
        }

        try {
            const docRef = await addDoc(collection(db, "pills"), { name: pillName, time: pillTime });
            setPills([...pills, { id: docRef.id, name: pillName, time: pillTime }]);
            setPillName('');
            setPillTime('');
            setAlertMessage('Pill added successfully!');
        } catch (error) {
            setErrorMessage('Failed to add pill.');
        }
    };

    const deletePill = async (id) => {
        try {
            await deleteDoc(doc(db, "pills", id));
            setPills(pills.filter((pill) => pill.id !== id));
            setAlertMessage('Pill deleted successfully!');
        } catch (error) {
            setErrorMessage('Failed to delete pill.');
        }
    };

    return (
        <div className="main-container">
            {!isLoggedIn ? (
                <div className="login-container">
                    <h2><FaUser className="icon" />Login</h2>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={login}>Login</button>
                    {errorMessage && <p className="error">{errorMessage}</p>}
                </div>
            ) : (
                <div>
                    <h1><FaPills className="icon" />Pill Tracker</h1>
                    <button className="btn btn-danger" onClick={logout}>
                        <FaSignOutAlt className="icon" /> Logout
                    </button>
                    <div className="pill-form">
                        <h2>Add New Pill</h2>
                        <input type="text" placeholder="Pill Name" value={pillName} onChange={(e) => setPillName(e.target.value)} />
                        <input type="time" value={pillTime} onChange={(e) => setPillTime(e.target.value)} />
                        <button onClick={addPill}>
                            <FaPlusCircle className="icon" /> Add Pill
                        </button>
                    </div>
                    <div className="pill-list">
                        <h2>Your Pills</h2>
                        {pills.map((pill) => (
                            <div key={pill.id} className="pill-item">
                                <span>{pill.name} - {pill.time}</span>
                                <button onClick={() => deletePill(pill.id)}>
                                    <FaTrash className="icon" /> Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {alertMessage && <p className="success">{alertMessage}</p>}
            {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
    );
}

export default App;