import React from 'react';

function PillList({ pills, onDelete }) {
    return (
        <ul className="list-group">
            {pills.map((pill) => (
                <li
                    className="list-group-item d-flex justify-content-between align-items-center shadow-sm mb-2 rounded-pill"
                    key={pill.id}
                >
                    <div>
                        <h5 className="mb-1">{pill.name}</h5>
                        <small className="text-muted">Time: {pill.time}</small>
                    </div>
                    <button
                        className="btn btn-danger btn-sm shadow-sm"
                        onClick={() => onDelete(pill.id)}
                    >
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    );
}

export default PillList;