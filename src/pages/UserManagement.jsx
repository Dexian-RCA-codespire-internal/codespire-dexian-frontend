import React, { useState, useEffect, useRef } from 'react';
import { 
  LuUser, 
  LuUserPlus, 
  LuPencil, 
  LuTrash2, 
  LuSearch,
  LuFilter,
  LuLock,
  LuCheck,
  LuEye,
  LuShield,
  LuUsers,
  LuUserCheck,
  LuUserX,
  LuActivity,
  LuMail,
  LuMailCheck,
  LuClock
} from 'react-icons/lu';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/card';
import useUserWebSocket from '../hooks/useUserWebSocket';
import { userService } from '../api/services/userService';

// Mock data
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-15 10:30:00',
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    role: 'User',
    status: 'Active',
    lastLogin: '2024-01-14 15:45:00',
    createdAt: '2024-01-02'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    role: 'User',
    status: 'Inactive',
    lastLogin: '2024-01-10 09:15:00',
    createdAt: '2024-01-03'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    role: 'Moderator',
    status: 'Active',
    lastLogin: '2024-01-15 14:20:00',
    createdAt: '2024-01-04'
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@company.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-16 08:45:00',
    createdAt: '2024-01-05'
  },
  {
    id: 6,
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    role: 'User',
    status: 'Active',
    lastLogin: '2024-01-15 16:30:00',
    createdAt: '2024-01-06'
  },
  {
    id: 7,
    name: 'Robert Miller',
    email: 'robert.miller@company.com',
    role: 'Moderator',
    status: 'Inactive',
    lastLogin: '2024-01-12 11:20:00',
    createdAt: '2024-01-07'
  },
  {
    id: 8,
    name: 'Lisa Garcia',
    email: 'lisa.garcia@company.com',
    role: 'User',
    status: 'Active',
    lastLogin: '2024-01-16 09:15:00',
    createdAt: '2024-01-08'
  },
  {
    id: 9,
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@company.com',
    role: 'User',
    status: 'Inactive',
    lastLogin: '2024-01-08 14:45:00',
    createdAt: '2024-01-09'
  },
  {
    id: 10,
    name: 'Jennifer Martinez',
    email: 'jennifer.martinez@company.com',
    role: 'Moderator',
    status: 'Active',
    lastLogin: '2024-01-15 13:30:00',
    createdAt: '2024-01-10'
  },
  {
    id: 11,
    name: 'Christopher Lee',
    email: 'christopher.lee@company.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-16 07:20:00',
    createdAt: '2024-01-11'
  },
  {
    id: 12,
    name: 'Amanda Taylor',
    email: 'amanda.taylor@company.com',
    role: 'User',
    status: 'Active',
    lastLogin: '2024-01-14 12:10:00',
    createdAt: '2024-01-12'
  }
];

// Permission modules configuration
const permissionModules = [
  { key: 'dashboard', name: 'Dashboard' },
  { key: 'tickets', name: 'Tickets' },
  { key: 'ai-rca', name: 'AI RCA Guidance' },
  { key: 'pattern-detector', name: 'Pattern Detector' },
  { key: 'playbook', name: 'Playbook Recommender' },
  { key: 'compliance', name: 'Compliance Audit' },
  { key: 'user-management', name: 'User Management' }
];

// Summary data - matching RCA Dashboard structure
const getSummaryData = (statistics) => {
  // Ensure statistics object exists and has default values
  const stats = statistics || {};
  const totalUsers = stats.totalUsers || 0;
  const activeUsers = stats.activeUsers || 0;
  const inactiveUsers = stats.inactiveUsers || 0;
  const recentUsers = stats.recentUsers || 0;

  console.log('📊 Statistics data:', stats); // Debug log

  return [
    {
      title: 'Total Users',
      value: totalUsers.toString(),
      subtitle: `${totalUsers} total users`,
      subtitleColor: 'text-green-600',
      icon: <LuUsers className="text-2xl text-green-600" />,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    },
    {
      title: 'Active Users',
      value: activeUsers.toString(),
      subtitle: 'Currently active',
      subtitleColor: 'text-blue-600',
      icon: <LuUserCheck className="text-2xl text-blue-600" />,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    },
    {
      title: 'Inactive Users',
      value: inactiveUsers.toString(),
      subtitle: 'Currently inactive',
      subtitleColor: 'text-red-600',
      icon: <LuUserX className="text-2xl text-red-600" />,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    },
    {
      title: 'New This Week',
      value: recentUsers.toString(),
      subtitle: 'Recently registered',
      subtitleColor: 'text-emerald-600',
      icon: <LuUserPlus className="text-2xl text-emerald-600" />,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    }
  ];
}

// Utility functions
const getStatusColor = (status) => {
  return status === 'active' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
};

const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'text-purple-600 bg-purple-100';
    case 'moderator':
      return 'text-blue-600 bg-blue-100';
    case 'user':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getDefaultPermission = (userRole, moduleKey) => {
  switch (userRole) {
    case 'admin':
      return 'both';
    case 'moderator':
      if (['dashboard', 'tickets', 'ai-rca'].includes(moduleKey)) return 'both';
      if (['pattern-detector', 'playbook'].includes(moduleKey)) return 'read';
      return 'none';
    case 'user':
      if (['dashboard', 'tickets', 'ai-rca'].includes(moduleKey)) return 'read';
      return 'none';
    default:
      return 'none';
  }
};

// Header Component
const Header = () => (
  <div className="mb-8">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-lime-100 rounded-lg">
        <LuUser className="w-6 h-6 text-lime-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage system users and their permissions</p>
      </div>
    </div>
  </div>
);

// Filters Component
const Filters = ({ searchTerm, setSearchTerm, selectedRole, setSelectedRole, onAddUser }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>
        </div>
        <Button 
          onClick={onAddUser}
          className="flex items-center space-x-2 bg-lime-600 hover:bg-lime-700 text-white"
        >
          <LuUserPlus className="w-4 h-4" />
          <span>Add User</span>
        </Button>
      </div>
    </div>
  </div>
);

// Dropdown Menu Component
const ActionDropdown = ({ user, isOpen, onToggle, onAction }) => (
  <div className="relative dropdown-container">
    <button
      onClick={() => onToggle(user._id)}
      className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
      title="More actions"
    >
      <div className="flex flex-col space-y-1">
        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
      </div>
    </button>
    
    {isOpen && (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
        <div className="py-1">
          <button
            onClick={() => onAction('view', user)}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <LuEye className="w-4 h-4 mr-3" />
            View
          </button>
          <button
            onClick={() => onAction('toggle-status', user)}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            {user.status === 'Active' ? (
              <>
                <LuLock className="w-4 h-4 mr-3" />
                Deactivate
              </>
            ) : (
              <>
                <LuCheck className="w-4 h-4 mr-3" />
                Activate
              </>
            )}
          </button>
          <button
            onClick={() => onAction('permission', user)}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <LuShield className="w-4 h-4 mr-3" />
            Permission
          </button>
          <button
            onClick={() => onAction('delete', user)}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <LuTrash2 className="w-4 h-4 mr-3" />
            Delete
          </button>
        </div>
      </div>
    )}
  </div>
);

// User Table Component
const UserTable = ({ users, onDropdownToggle, onDropdownAction, openDropdown, isOTPSubmitting, handleSendOTP }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Verification
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Login
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-center text-xs  font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-lime-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-lime-600">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.roles?.[0] || 'user')}`}>
                  {user.roles?.[0] || 'user'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  {user.isEmailVerified ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      <LuMailCheck className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        <LuMail className="w-3 h-3 mr-1" />
                        Pending
                      </span>
                      <button
                        onClick={() => handleSendOTP(user)}
                        disabled={isOTPSubmitting}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        title="Send OTP for verification"
                      >
                        <LuClock className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-center">
                  <ActionDropdown
                    user={user}
                    isOpen={openDropdown === user._id}
                    onToggle={onDropdownToggle}
                    onAction={onDropdownAction}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ searchTerm, selectedRole, onClearFilters, onAddUser }) => (
  <div className="text-center py-12">
    <LuUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
    <p className="text-gray-600 mb-4">
      {searchTerm || selectedRole !== 'all' 
        ? 'Try adjusting your search or filter criteria.'
        : 'Get started by adding your first user.'
      }
    </p>
    {(searchTerm || selectedRole !== 'all') ? (
      <Button onClick={onClearFilters} variant="outline">
        Clear Filters
      </Button>
    ) : (
      <Button onClick={onAddUser} className="bg-lime-600 hover:bg-lime-700 text-white">
        <LuUserPlus className="w-4 h-4 mr-2" />
        Add User
      </Button>
    )}
  </div>
);

// Permission Module Component
const PermissionModule = ({ module, userRole, defaultPermission }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <h4 className="text-sm font-medium text-gray-900 mb-3">{module.name}</h4>
    <div className="flex items-center space-x-6">
      {['none', 'read', 'write', 'both'].map((permission) => (
        <label key={permission} className="flex items-center space-x-2">
          <input 
            type="radio" 
            name={module.key} 
            value={permission} 
            className="rounded border-gray-300 text-lime-600 focus:ring-lime-500" 
            defaultChecked={permission === defaultPermission}
          />
          <span className="text-sm text-gray-700 capitalize">{permission}</span>
        </label>
      ))}
    </div>
  </div>
);


const UserManagement = () => {
  // WebSocket hook for real-time user data
  const {
    users,
    loading,
    error,
    pagination,
    statistics,
    isConnected,
    notifications,
    requestUserData,
    requestUserStatistics,
    clearNotifications
  } = useUserWebSocket(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081');

  // Local state management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [managingUser, setManagingUser] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  
  // Form state for user creation
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open
  const searchTimeoutRef = useRef(null); // Ref for search debounce timeout

  // OTP verification state
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [verifyingUser, setVerifyingUser] = useState(null);
  const [otpData, setOtpData] = useState({
    email: '',
    otp: '',
    deviceId: null,
    preAuthSessionId: null
  });
  const [isOTPSubmitting, setIsOTPSubmitting] = useState(false);
  const [otpErrors, setOtpErrors] = useState({});

  // Load users data on component mount
  useEffect(() => {
    console.log('🚀 Component mounted, requesting data...');
    requestUserData({
      page: 1,
      limit: 10,
      query: searchTerm,
      role: selectedRole,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    requestUserStatistics();
  }, []);

  // Request statistics when connection is established
  useEffect(() => {
    if (isConnected) {
      console.log('🔌 WebSocket connected, requesting statistics...');
      requestUserStatistics();
    }
  }, [isConnected]);

  // Debounced search - prevents abrupt refreshes
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      if (isConnected) {
        requestUserData({
          page: 1,
          limit: pagination.limit,
          query: searchTerm,
          role: selectedRole,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
      }
    }, 500); // 500ms delay

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, selectedRole, isConnected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Event handlers
  const handleAddUser = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: ''
    });
    setFormErrors({});
    setEditingUser(null);
    setShowAddUserModal(true);
  };
  
  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowAddUserModal(true);
  };

  // Form handling functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await userService.createUser(formData);
      
      // Debug: Log the full result to see what we're getting
      console.log('User creation result:', result);
      console.log('OTP Data:', result.otpData);
      
      // Close modal and refresh data
      handleCloseModals();
      requestUserData(); // Refresh user list via WebSocket
      
      // Show success message
      if (result.otpData) {
        console.log('User created successfully and verification OTP sent');
        // You might want to show a toast notification here
        alert('User created successfully! A verification OTP has been sent to the user\'s email.');
      } else {
        console.log('User created successfully (verification OTP could not be sent)');
        alert('User created successfully, but verification OTP could not be sent. Please contact the user directly.');
      }
      
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Handle API errors
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('already exists')) {
          setFormErrors({ email: 'User with this email already exists' });
        } else {
          setFormErrors({ general: error.response.data.error });
        }
      } else {
        setFormErrors({ general: 'Failed to create user. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewUser = (user) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  const handleManagePermissions = (user) => {
    setManagingUser(user);
    setShowPermissionModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // TODO: Implement API call to delete user
      console.log('Delete user:', userId);
    }
  };

  const handleToggleUserStatus = (userId) => {
    // TODO: Implement API call to toggle user status
    console.log('Toggle user status:', userId);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
  };

  // OTP verification handlers
  const handleSendOTP = async (user) => {
    try {
      setIsOTPSubmitting(true);
      const result = await userService.sendUserOTP(user.email);
      
      if (result.success) {
        setOtpData({
          email: user.email,
          otp: '',
          deviceId: result.deviceId,
          preAuthSessionId: result.preAuthSessionId
        });
        setVerifyingUser(user);
        setShowOTPModal(true);
        alert('OTP sent successfully to user\'s email!');
      } else {
        alert(`Failed to send OTP: ${result.message}`);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Error sending OTP. Please try again.');
    } finally {
      setIsOTPSubmitting(false);
    }
  };

  const handleOTPInputChange = (e) => {
    const { name, value } = e.target;
    setOtpData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (otpErrors[name]) {
      setOtpErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateOTPForm = () => {
    const errors = {};
    
    if (!otpData.otp || otpData.otp.length !== 6) {
      errors.otp = 'OTP must be 6 digits';
    }
    
    if (!/^\d{6}$/.test(otpData.otp)) {
      errors.otp = 'OTP must contain only numbers';
    }
    
    setOtpErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!validateOTPForm()) {
      return;
    }
    
    try {
      setIsOTPSubmitting(true);
      const result = await userService.verifyUserOTP(
        otpData.email,
        otpData.otp,
        otpData.deviceId,
        otpData.preAuthSessionId
      );
      
      if (result.success) {
        alert('User email verified successfully!');
        setShowOTPModal(false);
        setOtpData({ email: '', otp: '', deviceId: null, preAuthSessionId: null });
        setVerifyingUser(null);
        requestUserData(); // Refresh user list
      } else {
        alert(`Verification failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Error verifying OTP. Please try again.');
    } finally {
      setIsOTPSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsOTPSubmitting(true);
      const result = await userService.resendUserOTP(
        otpData.email,
        otpData.deviceId,
        otpData.preAuthSessionId
      );
      
      if (result.success) {
        setOtpData(prev => ({
          ...prev,
          deviceId: result.deviceId,
          preAuthSessionId: result.preAuthSessionId
        }));
        alert('OTP resent successfully!');
      } else {
        alert(`Failed to resend OTP: ${result.message}`);
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      alert('Error resending OTP. Please try again.');
    } finally {
      setIsOTPSubmitting(false);
    }
  };

  const handleCloseOTPModal = () => {
    setShowOTPModal(false);
    setOtpData({ email: '', otp: '', deviceId: null, preAuthSessionId: null });
    setVerifyingUser(null);
    setOtpErrors({});
  };

  // Pagination handlers - matching RCA Dashboard
  const handlePageChange = (newPage) => {
    requestUserData({
      page: newPage,
      limit: pagination.limit,
      query: searchTerm,
      role: selectedRole,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const handleLimitChange = (newLimit) => {
    requestUserData({
      page: 1,
      limit: newLimit,
      query: searchTerm,
      role: selectedRole,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const handleCloseModals = () => {
    setShowAddUserModal(false);
    setShowViewModal(false);
    setShowPermissionModal(false);
    setShowOTPModal(false);
    setEditingUser(null);
    setViewingUser(null);
    setManagingUser(null);
    setVerifyingUser(null);
    setOpenDropdown(null);
    setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '' });
    setFormErrors({});
    setOtpData({ email: '', otp: '', deviceId: null, preAuthSessionId: null });
    setOtpErrors({});
  };

  // Dropdown handlers
  const handleDropdownToggle = (userId) => {
    setOpenDropdown(openDropdown === userId ? null : userId);
  };

  const handleDropdownAction = (action, user) => {
    setOpenDropdown(null);
    switch (action) {
      case 'view':
        handleViewUser(user);
        break;
      case 'toggle-status':
        handleToggleUserStatus(user._id);
        break;
      case 'delete':
        handleDeleteUser(user._id);
        break;
      case 'permission':
        handleManagePermissions(user);
        break;
      default:
        break;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Header />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading && statistics.totalUsers === 0 ? (
            // Show loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            getSummaryData(statistics).map((item, index) => {
              console.log('📊 Rendering summary card:', item.title, item.value); // Debug log
              return (
              <Card key={index} className={`${item.bgColor} ${item.borderColor} shadow-sm hover:shadow-md transition-shadow duration-200`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">{item.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{item.value}</p>
                      <p className={`text-sm font-medium ${item.subtitleColor}`}>{item.subtitle}</p>
                    </div>
                    <div className="opacity-80">{item.icon}</div>
                  </div>
                </CardContent>
              </Card>
              );
            })
          )}
        </div>
      
      <Filters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        onAddUser={handleAddUser}
      />

      {/* Connection Status */}
      {!isConnected && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-red-700">Disconnected from server. Attempting to reconnect...</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-yellow-700">{error}</span>
          </div>
        </div>
      )}

      {users.length > 0 ? (
        <>
          <UserTable 
            users={users}
            onDropdownToggle={handleDropdownToggle}
            onDropdownAction={handleDropdownAction}
            openDropdown={openDropdown}
            isOTPSubmitting={isOTPSubmitting}
            handleSendOTP={handleSendOTP}
          />
          
          {/* Pagination Controls - matching RCA Dashboard */}
          {users.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Show:</span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    disabled={loading}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} results
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev || loading}
                  className="flex items-center gap-1"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i
                    if (pageNum > pagination.totalPages) return null
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext || loading}
                  className="flex items-center gap-1"
                >
                  Next
                  <FiChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState 
          searchTerm={searchTerm}
          selectedRole={selectedRole}
          onClearFilters={handleClearFilters}
          onAddUser={handleAddUser}
        />
      )}

      {/* Add/Edit User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            
            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{formErrors.general}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className={formErrors.email ? 'border-red-500' : ''}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password (min 6 characters)"
                  className={formErrors.password ? 'border-red-500' : ''}
                />
                {formErrors.password && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModals}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-lime-600 hover:bg-lime-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Add User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {viewingUser.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {viewingUser.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(viewingUser.role)}`}>
                    {viewingUser.role}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingUser.status)}`}>
                    {viewingUser.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Login
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {viewingUser.lastLogin}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created Date
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {viewingUser.createdAt}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingUser(null);
                }}
              >
                Close
              </Button>
              <Button 
                type="button" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingUser(null);
                  handleEditUser(viewingUser);
                }}
              >
                Edit User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Management Modal */}
      {showPermissionModal && managingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-bold mb-4">Manage Permissions - {managingUser.name}</h2>
            
            {/* User Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-lime-100 flex items-center justify-center">
                  <span className="text-lg font-medium text-lime-600">
                    {managingUser.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{managingUser.name}</h3>
                  <p className="text-sm text-gray-600">{managingUser.email}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(managingUser.role)}`}>
                    {managingUser.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Module Permissions</h3>
              {permissionModules.map((module) => (
                <PermissionModule
                  key={module.key}
                  module={module}
                  userRole={managingUser.role}
                  defaultPermission={getDefaultPermission(managingUser.role, module.key)}
                />
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModals}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleCloseModals}
              >
                Save Permissions
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <LuMail className="w-5 h-5 mr-2 text-blue-600" />
              Email Verification
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                An OTP has been sent to <strong>{verifyingUser?.email}</strong>
              </p>
              <p className="text-xs text-gray-500">
                Please enter the 6-digit code to verify the user's email address.
              </p>
            </div>

            <form onSubmit={handleVerifyOTP}>
              <div className="mb-4">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <Input
                  type="text"
                  id="otp"
                  name="otp"
                  value={otpData.otp}
                  onChange={handleOTPInputChange}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className={`w-full ${otpErrors.otp ? 'border-red-500' : ''}`}
                  disabled={isOTPSubmitting}
                />
                {otpErrors.otp && (
                  <p className="mt-1 text-sm text-red-600">{otpErrors.otp}</p>
                )}
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseOTPModal}
                  disabled={isOTPSubmitting}
                >
                  Cancel
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOTP}
                    disabled={isOTPSubmitting}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    {isOTPSubmitting ? 'Sending...' : 'Resend OTP'}
                  </Button>
                  
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isOTPSubmitting || !otpData.otp || otpData.otp.length !== 6}
                  >
                    {isOTPSubmitting ? 'Verifying...' : 'Verify Email'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;