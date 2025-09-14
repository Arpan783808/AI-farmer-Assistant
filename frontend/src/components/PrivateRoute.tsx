import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

interface User {
  id: string; 
  username: string;
  primaryPhone: string;
  profilePicture: string;
  isPhoneVerified: boolean;
  farmAddress?: string;
  role: string; 
}

const PrivateRoute: React.FC = () => {

  let user: User | null = null;
  
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        user = JSON.parse(storedUser) as User;
      } catch (error) {
        console.error('Error parsing currentUser from localStorage:', error);
        user = null;
      }
    }
  
  return user? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
