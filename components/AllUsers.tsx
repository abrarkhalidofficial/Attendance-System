export default function AllUsers() {
    // Example users data
    const users = [
      { id: 1, email: 'email1@example.com', phone: '123456789', address: 'Address 1', name: 'User 1', role: 'Admin' },
      { id: 2, email: 'email2@example.com', phone: '987654321', address: 'Address 2', name: 'User 2', role: 'Editor' },
      { id: 3, email: 'email3@example.com', phone: '456789123', address: 'Address 3', name: 'User 3', role: 'Viewer' },
      { id: 4, email: 'email4@example.com', phone: '789123456', address: 'Address 4', name: 'User 4', role: 'Admin' },
      { id: 5, email: 'email5@example.com', phone: '321654987', address: 'Address 5', name: 'User 5', role: 'Editor' },
    ];
  
    return (
      <div style={{ padding: '20px', backgroundColor: '#f5e8ff', minHeight: '100vh' }}>
        {/* Add User Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button
            style={{
              backgroundColor: '#ffd700',
              color: '#000',
              padding: '10px 20px',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Add User
          </button>
        </div>
  
        {/* Users List */}
        <h1 style={{ marginBottom: '20px' }}>All Users</h1>
        <div>
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
                backgroundColor: '#ffd700',
                padding: '10px',
                borderRadius: '5px',
              }}
            >
              {/* User Info */}
              <div style={{ flexGrow: 1, color: '#000' }}>
                {user.email} - {user.phone} - {user.address} - {user.name} - {user.role}
              </div>
  
              {/* Edit Button */}
              <button
                style={{
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  padding: '8px 15px',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                  marginRight: '10px',
                }}
              >
                Edit
              </button>
  
              {/* Delete Button */}
              <button
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  padding: '8px 15px',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Delete User
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
  