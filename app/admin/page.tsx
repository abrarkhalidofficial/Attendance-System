"use client";
import { useState } from 'react';
import AllUsers from '@/components/AllUsers';
import UserList from '@/components/UserList';
import Logout from '@/components/Logout';
import AdminLeaveRequestsPage from '@/components/Adminleave';
import AdminAttendance from '@/components/AdminAttendance';
import ChangePassword from '@/components/ChangePassword';

export default function Dashboard() {
  const [content, setContent] = useState<keyof typeof contentMap>('dashboard');

  const contentMap = {
    dashboard: (
      <div>
        <AllUsers />


      </div>
    ),
    user: (
      <UserList />
    ),
    viewattendance: (
      <div>
        <AdminAttendance />
      </div >
    ),
    leaves: (
      <div>
        <AdminLeaveRequestsPage />
      </div >
    ),
    changepassword: (
      <>
        <ChangePassword />
      </>
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
          <Logout />
        </nav >
      </div >

      {/* Main Content */}
      < main className="mainContent" style={{
        width: '100%',
      }}>
        {contentMap[content]}
      </main >
    </div >
  );
}
