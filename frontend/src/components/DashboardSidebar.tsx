// "use client";

// import React, { useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from 'flowbite-react';
// import { HiArrowSmRight, HiUser, HiPlusCircle, HiExclamationCircle, HiBell } from 'react-icons/hi';
// import { Link } from 'react-router-dom';

// interface User {
//   role: string;
// }

// const DashboardSidebar: React.FC = () => {
//   const location = useLocation();
//   const [tab, setTab] = useState<string>('');
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     const storedUser = localStorage.getItem('currentUser');
//     if (storedUser) {
//       try {
//         setUser(JSON.parse(storedUser) as User);
//       } catch (error) {
//         console.error('Error parsing currentUser from localStorage:', error);
//         setUser(null);
//       }
//     }

//     const urlParams = new URLSearchParams(location.search);
//     const tabFromUrl = urlParams.get('tab');
//     if (tabFromUrl) {
//       setTab(tabFromUrl);
//     }
//     console.log(tabFromUrl);
//   }, [location.search]);

//   const getRole = (): string => {
//     return user?.role == 'admin' ? 'Admin' : 'User';
//   };

//   const handleSignOut = async () => {
//     try {
//       const res = await fetch('/api/user/signout', {
//         method: 'POST',
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         console.log(data.message);
//       } else {
//         localStorage.removeItem('currentUser');
//         setUser(null);
//       }
//     } catch (error) {
//       console.error(error.message);
//     }
//   };

//   return (
//     <div className="h-full overflow-y-auto bg-gray-100">
//       <Sidebar aria-label="Dashboard sidebar" className="w-full md:w-56">
//         <SidebarItems>
//           <SidebarItemGroup>
//             <Link to="/dashboard?tab=profile">
//               <SidebarItem active={tab === 'profile'} icon={HiUser} label={getRole()} labelColor="dark">
//                 Profile
//               </SidebarItem>
//             </Link>
//             {user?.role === 'admin' && (
//               <>
//                 <Link to="/dashboard?tab=create-alert">
//                   <SidebarItem
//                     active={tab === 'create-alert'}
//                     icon={HiPlusCircle}
//                     className="w-full mt-5 bg-amber-400 !text-black font-semibold hover:!bg-amber-500 p-2 rounded-lg"
//                   >
//                     <div className="flex items-center gap-2">
//                       <span>
//                         <HiPlusCircle className="w-4 h-4" />
//                       </span>
//                       <span>Create Alert</span>
//                     </div>
//                   </SidebarItem>
//                 </Link>
//                 <Link to="/dashboard?tab=active-alerts">
//                   <SidebarItem active={tab === 'active-alerts'} icon={HiBell}>
//                     Active Alerts
//                   </SidebarItem>
//                 </Link>
//                 <Link to="/dashboard?tab=escalated-issues">
//                   <SidebarItem active={tab === 'escalated-issues'} icon={HiExclamationCircle}>
//                     Escalated Issues
//                   </SidebarItem>
//                 </Link>
//               </>
//             )}
//             <SidebarItem
//               active={tab === 'sign-out'}
//               icon={HiArrowSmRight}
//               className="cursor-pointer bg-red-600 text-white hover:!bg-red-700"
//               onClick={handleSignOut}
//             >
//               Sign Out
//             </SidebarItem>
//           </SidebarItemGroup>
//         </SidebarItems>
//       </Sidebar>
//     </div>
//   );
// };

// export default DashboardSidebar;

"use client";

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from 'flowbite-react';
import { HiArrowSmRight, HiUser, HiPlusCircle, HiExclamationCircle, HiBell, HiHome } from 'react-icons/hi';
import { TbWheat } from "react-icons/tb";
import { Link } from 'react-router-dom';
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
interface User {
  role: string;
}

const DashboardSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const API_BASE =
    (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:10000";
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

    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
    console.log(tabFromUrl);
  }, [location.search]);

  const getRole = (): string => {
    return user?.role == 'admin' ? 'Admin' : 'User';
  };

  const handleSignOut = async () => {
    try {
      const logoutResponse = await fetch(`${API_BASE}/api/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      await signOut(auth);
      setIsLoggedIn(false);
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userName");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-100">
      <Sidebar aria-label="Dashboard sidebar" className="w-full md:w-56">
        <div className="p-4">
          <button
            onClick={handleHome}
            className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 font-medium rounded-lg px-4 py-2 transition-colors duration-200"
          >
            <HiHome className="w-5 h-5" />
            <span>Home</span>
          </button>
        </div>
        <SidebarItems>
          <SidebarItemGroup>
            <Link to="/dashboard?tab=profile">
              <SidebarItem active={tab === 'profile'} icon={HiUser} label={getRole()} labelColor="dark">
                Profile
              </SidebarItem>
            </Link>
            {user?.role === 'admin' && (
              <>
                <Link to="/dashboard?tab=create-alert">
                  <SidebarItem
                    active={tab === 'create-alert'}
                    icon={HiPlusCircle}
                    className="w-full mt-5 bg-amber-400 !text-black font-semibold hover:!bg-amber-500 p-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span>
                        <HiPlusCircle className="w-4 h-4" />
                      </span>
                      <span>Create Alert</span>
                    </div>
                  </SidebarItem>
                </Link>
                <Link to="/dashboard?tab=active-alerts">
                  <SidebarItem active={tab === 'active-alerts'} icon={HiBell}>
                    Active Alerts
                  </SidebarItem>
                </Link>
                <Link to="/dashboard?tab=escalated-issues">
                  <SidebarItem active={tab === 'escalated-issues'} icon={HiExclamationCircle}>
                    Escalated Issues
                  </SidebarItem>
                </Link>
                <Link to="/dashboard?tab=crop-management">
                  <SidebarItem active={tab === 'crop-management'} icon={TbWheat}>
                    Crops
                  </SidebarItem>
                </Link>
              </>
            )}
            <SidebarItem
              active={tab === 'sign-out'}
              icon={HiArrowSmRight}
              className="cursor-pointer bg-red-600 text-white hover:!bg-red-700"
              onClick={handleSignOut}
            >
              Sign Out
            </SidebarItem>
          </SidebarItemGroup>
        </SidebarItems>
      </Sidebar>
    </div>
  );
};

export default DashboardSidebar;