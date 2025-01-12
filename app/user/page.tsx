"use client";
import { useState } from 'react';
import UserAttendance from '../../components/UserAttendance';
import LeaveRequestPage from '@/components/LeaveRequest';

export default function Dashboard() {
  const [content, setContent] = useState<keyof typeof contentMap>('dashboard');

  // Content data for each section
  const contentMap = {
    dashboard: (
      <div>
        <UserAttendance />
      </div>
    ),
    user: (
      <div>
        <h1>User Management</h1>
        <img
          src="https://via.placeholder.com/600x300"
          alt="User Management"
          className="img"
        />
        <p>Manage users effectively by adding, editing, or removing users from your system.</p>
        <button className="sidebarBtn" >Add New User</button>
      </div>
    ),
    viewattendance: (
      <div>
        <h1>View Attendance</h1>
        <img
          src="https://via.placeholder.com/600x300"
          alt="Attendance"
          className="img"
        />
        <p>Keep track of attendance records for your employees or students.</p>
        <button className="sidebarBtn ">View Records</button>
      </div >
    ),
    leaves: (
      <div>
        <LeaveRequestPage />
      </div >
    ),
    changepassword: (
      <div>
        <h1>Change Password</h1>
        <img
          src="https://via.placeholder.com/600x300"
          alt="Change Password"
          className="img"
        />
        <p>Securely update your password to keep your account safe.</p>
        <button className="sidebarBtn">Change Password</button>
      </div >
    ),
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div className="sidebar">
        <h2>Sidebar</h2>
        <nav>
          <button onClick={() => setContent('dashboard')} className="sidebarBtn">
            Dashboard
          </button>
          <button onClick={() => setContent('user')} className="sidebarBtn">
            User
          </button>
          <button onClick={() => setContent('viewattendance')} className="sidebarBtn">
            View Attendance
          </button>
          <button onClick={() => setContent('leaves')} className="sidebarBtn">
            Leaves
          </button>
          <button onClick={() => setContent('changepassword')} className="sidebarBtn">
            Change Password
          </button>
        </nav >
      </div >

      {/* Main Content */}
      < main className="mainContent" style={{
        width: '98%',
        height: '100vh',
      }}>
        {contentMap[content]}
      </main >
    </div >
  );
}
