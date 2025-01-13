import React, { useState, useEffect } from 'react';
import { getLeaveRequests, updateLeaveRequest } from '@/actions';

const AdminLeaveRequestsPage: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'REJECTED' | 'PENDING'>('ALL');

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      const result = await getLeaveRequests();
      console.log(result);
      if (result.status === 'ok') {
        setLeaveRequests(result.leaveRequests || []);
        setFilteredRequests(result.leaveRequests || []);
      }
    };
    fetchLeaveRequests();
  }, []);

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('status', status);

    const result = await updateLeaveRequest(formData);
    if (result.status === 'ok') {
      setMessage('Leave request updated successfully');

      const res = await getLeaveRequests();
      if (res.status === 'ok') {
        setLeaveRequests(res.leaveRequests || []);
        applyFilter(filter, res.leaveRequests || []);
      }
    } else {
      setMessage(result.error || 'An error occurred');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'approved';
      case 'REJECTED':
        return 'rejected';
      default:
        return 'pending';
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
    applyFilter(newFilter, leaveRequests);
  };

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        margin: 0,
        padding: '20px',
        backgroundColor: '#f4f4f4',
        height: '98vh',
        overflow: 'auto',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', color: '#333', marginTop: '30px' }}>
        Admin Leave Requests
      </h1>

      <div>
        {message && <p style={{ color: '#ff5733', fontWeight: 'bold' }}>{message}</p>}
      </div>

      <h2 style={{ fontSize: '2rem', color: '#333', marginTop: '20px' }}>
        All Leave Requests
      </h2>

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
            className={getStatusClass(request.status)}
          >
            <p style={{ fontSize: '1.1rem', color: '#555' }}>
              <strong>{request.userId}</strong> requested leave from{' '}
              {formatDate(request.startDate)} to {formatDate(request.endDate)}.
              <br />
              Reason: {request.reason}
            </p>
            <p style={{ fontSize: '1rem', color: '#555' }}>Status: {request.status}</p>

            <div>
              {request.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleAction(request.id, 'APPROVED')}
                    style={{
                      backgroundColor: '#4CAF50',
                      color: '#fff',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginRight: '10px',
                    }}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleAction(request.id, 'REJECTED')}
                    style={{
                      backgroundColor: '#f44336',
                      color: '#fff',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    Decline
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default AdminLeaveRequestsPage;
