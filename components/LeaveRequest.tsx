import React, { useState, useEffect } from 'react';
import { handleLeaveRequest, getLeaveRequests } from '@/actions';

const LeaveRequestPage: React.FC = () => {
    const [userId, setUserId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'REJECTED' | 'PENDING'>('ALL');

    useEffect(() => {
        const fetchLeaveRequests = async () => {
            const result = await getLeaveRequests();
            if (result.status === 'ok') {
                if (result.leaveRequests) {
                    setLeaveRequests(result.leaveRequests);
                    setFilteredRequests(result.leaveRequests); // Initialize with all leave requests
                }
            }
        };
        fetchLeaveRequests();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('reason', reason);

        const result = await handleLeaveRequest(formData);

        if (result.status === 'ok') {
            setMessage('Leave request submitted successfully');
            setStartDate('');
            setEndDate('');
            setReason('');
            // Re-fetch leave requests
            const res = await getLeaveRequests();
            if (res.status === 'ok' && res.leaveRequests) {
                setLeaveRequests(res.leaveRequests);
                applyFilter(filter, res.leaveRequests); // Apply current filter after fetching new requests
            }
        } else {
            setMessage(result.error || 'An error occurred');
        }
    };

    const applyFilter = (filter: 'ALL' | 'APPROVED' | 'REJECTED' | 'PENDING', requests: any[]) => {
        switch (filter) {
            case 'APPROVED':
                setFilteredRequests(requests.filter(request => request.status === 'APPROVED'));
                break;
            case 'REJECTED':
                setFilteredRequests(requests.filter(request => request.status === 'REJECTED'));
                break;
            case 'PENDING':
                setFilteredRequests(requests.filter(request => request.status === 'PENDING'));
                break;
            case 'ALL':
            default:
                setFilteredRequests(requests);
                break;
        }
    };

    const handleFilterChange = (newFilter: 'ALL' | 'APPROVED' | 'REJECTED' | 'PENDING') => {
        setFilter(newFilter);
        applyFilter(newFilter, leaveRequests); // Apply the selected filter
    };

    // Function to format Date objects to a readable string
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString();
    };

    return (
        <div
            style={{
                fontFamily: 'Arial, sans-serif',
                padding: '20px',
                backgroundColor: '#f4f4f4',
                height: '92vh',
                overflow: 'auto',
                textAlign: 'center',
            }}
        >
            <h1 style={{ fontSize: '2.5rem', color: '#333', marginBottom: '20px' }}>Leave Request</h1>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '20px',
                }}
            >
                <input
                    type="text"
                    placeholder="Name"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    style={{
                        padding: '10px',
                        margin: '10px',
                        width: '100%',
                        fontSize: '1rem',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                    }}
                />
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    style={{
                        padding: '10px',
                        margin: '10px',
                        width: '100%',
                        fontSize: '1rem',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                    }}
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    style={{
                        padding: '10px',
                        margin: '10px',
                        width: '100%',
                        fontSize: '1rem',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                    }}
                />
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Reason"
                    style={{
                        padding: '10px',
                        margin: '10px',
                        width: '100%',
                        fontSize: '1rem',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                        minHeight: '100px',
                    }}
                />
                <button
                    type="submit"
                    style={{
                        backgroundColor: '#4CAF50',
                        color: '#fff',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginTop: '10px',
                    }}
                >
                    Submit Request
                </button>
            </form>

            {message && (
                <div>
                    <p style={{ color: '#ff5733', fontWeight: 'bold' }}>{message}</p>
                </div>
            )}

            <h2 style={{ fontSize: '2rem', color: '#333', marginTop: '30px' }}>Your Leave Requests</h2>

            {/* Filter Buttons */}
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => handleFilterChange('ALL')}
                    style={{
                        backgroundColor: '#2196F3',
                        color: '#fff',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginRight: '10px',
                    }}
                >
                    All
                </button>
                <button
                    onClick={() => handleFilterChange('APPROVED')}
                    style={{
                        backgroundColor: '#4CAF50',
                        color: '#fff',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginRight: '10px',
                    }}
                >
                    Approved
                </button>
                <button
                    onClick={() => handleFilterChange('REJECTED')}
                    style={{
                        backgroundColor: '#f44336',
                        color: '#fff',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginRight: '10px',
                    }}
                >
                    Rejected
                </button>
                <button
                    onClick={() => handleFilterChange('PENDING')}
                    style={{
                        backgroundColor: '#FF9800',
                        color: '#fff',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Pending
                </button>
            </div>

            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {filteredRequests.map((request) => (
                    <li
                        key={request.id}
                        style={{
                            padding: '15px',
                            margin: '10px 0',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            backgroundColor: '#fff',
                        }}
                    >
                        <p style={{ fontSize: '1.1rem', color: '#555' }}>
                            <strong>Name:</strong> {request.userId} {/* Assuming userId is the name */}
                            <br />
                            <strong>Leave from:</strong> {formatDate(request.startDate)} to {formatDate(request.endDate)}
                            <br />
                            <strong>Status:</strong> {request.status}
                            <br />
                            <strong>Reason:</strong> {request.reason}
                        </p>
                    </li>
                ))}
            </ul>


        </div>
    );
};

export default LeaveRequestPage;
