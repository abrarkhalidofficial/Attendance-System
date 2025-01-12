"use client";
import { useState } from 'react';
import UserAttendance from '../../components/UserAttendance';
import LeaveRequestPage from '@/components/LeaveRequest';
import ChangePassword from '@/components/ChangePassword';
import Logout from '@/components/Logout';

export default function Dashboard() {
  const [content, setContent] = useState<keyof typeof contentMap>('viewattendance');

  const contentMap = {

    viewattendance: (
      <div>
        <UserAttendance userId="someUserId" />
      </div >
    ),
    leaves: (
      <div>
        <LeaveRequestPage />
      </div >
    ),
    changepassword: (
      <div>
        <ChangePassword />
      </div >
    ),
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div className="sidebar">
        <h2>Sidebar</h2>
        <nav>

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
        width: '98%',
        height: '100vh',
      }}>
        {contentMap[content]}
      </main >
    </div >
  );
}
