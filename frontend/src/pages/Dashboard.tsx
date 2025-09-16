"use client";

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import { CreateAlert, ListAlerts, UpdateAlert } from '@/components/DashboardAlert';
import DashboardProfile from '@/components/DashboardProfile';
import useDocumentTitle from '@/hooks/UseDocumentTitle';

// Define interfaces for type safety


interface User {
  role: string;
}

// Placeholder Profile Component
const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch (error) {
        console.error('Error parsing currentUser from localStorage:', error);
        setUser(null);
      }
    }
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
      {user ? (
        <div>
          <p className="text-gray-700">Role: {user.role === 'admin' ? 'Admin' : 'User'}</p>
        </div>
      ) : (
        <p className="text-gray-500">No user data available.</p>
      )}
    </div>
  );
};

// Create Alert Component


// Update Alert Component


// List Alerts Component


// Dashboard NotFound Component
const DashboardNotFound: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-600">The requested page does not exist within the Alert Dashboard.</p>
      <Link to="/dashboard?tab=active-alerts" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
        Back to Alerts
      </Link>
    </div>
  );
};

// Escalated Issues Component (Placeholder)
const EscalatedIssues: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Escalated Issues</h2>
      <p className="text-gray-600">No escalated issues available at this time.</p>
    </div>
  );
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const location = useLocation();
  const [tab, setTab] = useState<string>('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
    console.log(tabFromUrl);
  }, [location.search]);

  useDocumentTitle('Alert Dashboard');

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-56">
        <DashboardSidebar />
      </div>
      <div className="flex-1">
        {tab === 'profile' && <DashboardProfile />}
        {tab === 'create-alert' && <CreateAlert />}
        {tab === 'active-alerts' && <ListAlerts />}
        {tab === 'update-alert' && <UpdateAlert />}
        {tab === 'escalated-issues' && <EscalatedIssues />}
        {tab === '*' && <DashboardNotFound />}
        {!tab && <DashboardProfile />}
      </div>
    </div>
  );
};

export default Dashboard;