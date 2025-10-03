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
  LuClock,
  LuX,
  LuLoader
} from 'react-icons/lu';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/card';
import useUserWebSocket from '../hooks/useUserWebSocket';
import { userService } from '../api/services/userService';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';


// Available roles configuration
const availableRoles = [
  // Broad roles
  { value: 'admin', label: 'Admin', description: 'Full system access', category: 'Broad Roles' },
  { value: 'manager', label: 'Manager', description: 'Broad access without delete permissions', category: 'Broad Roles' },
  { value: 'support_agent', label: 'Support Agent', description: 'Frontline operations access', category: 'Broad Roles' },
  { value: 'user', label: 'User', description: 'Standard user access', category: 'Broad Roles' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access everywhere', category: 'Broad Roles' },
  
  // Dashboard roles
  { value: 'dashboard_reader', label: 'Dashboard Reader', description: 'Read dashboard data', category: 'Dashboard' },
  { value: 'dashboard_editor', label: 'Dashboard Editor', description: 'Read and write dashboard data', category: 'Dashboard' },
  { value: 'dashboard_owner', label: 'Dashboard Owner', description: 'Full dashboard control', category: 'Dashboard' },
  
  // Tickets roles
  { value: 'tickets_reader', label: 'Tickets Reader', description: 'Read ticket data', category: 'Tickets' },
  { value: 'tickets_editor', label: 'Tickets Editor', description: 'Read and write ticket data', category: 'Tickets' },
  { value: 'tickets_owner', label: 'Tickets Owner', description: 'Full ticket control', category: 'Tickets' },
  
  // SLA roles
  { value: 'sla_reader', label: 'SLA Reader', description: 'Read SLA data', category: 'SLA' },
  { value: 'sla_editor', label: 'SLA Editor', description: 'Read and write SLA data', category: 'SLA' },
  { value: 'sla_owner', label: 'SLA Owner', description: 'Full SLA control', category: 'SLA' },
  
  // Playbooks roles
  { value: 'playbooks_reader', label: 'Playbooks Reader', description: 'Read playbook data', category: 'Playbooks' },
  { value: 'playbooks_editor', label: 'Playbooks Editor', description: 'Read and write playbook data', category: 'Playbooks' },
  { value: 'playbooks_owner', label: 'Playbooks Owner', description: 'Full playbook control', category: 'Playbooks' },
  
  // AI RCA roles
  { value: 'aiRca_reader', label: 'AI RCA Reader', description: 'Read AI RCA data', category: 'AI RCA' },
  { value: 'aiRca_editor', label: 'AI RCA Editor', description: 'Read and write AI RCA data', category: 'AI RCA' },
  { value: 'aiRca_owner', label: 'AI RCA Owner', description: 'Full AI RCA control', category: 'AI RCA' },
  
  // Pattern Detector roles
  { value: 'patternDetector_reader', label: 'Pattern Reader', description: 'Read pattern data', category: 'Pattern Detector' },
  { value: 'patternDetector_editor', label: 'Pattern Editor', description: 'Read and write pattern data', category: 'Pattern Detector' },
  { value: 'patternDetector_owner', label: 'Pattern Owner', description: 'Full pattern control', category: 'Pattern Detector' },
  
  // Playbook Recommender roles
  { value: 'playbookRecommender_reader', label: 'Recommender Reader', description: 'Read recommendation data', category: 'Playbook Recommender' },
  { value: 'playbookRecommender_editor', label: 'Recommender Editor', description: 'Read and write recommendation data', category: 'Playbook Recommender' },
  { value: 'playbookRecommender_owner', label: 'Recommender Owner', description: 'Full recommendation control', category: 'Playbook Recommender' },
  
  // Customer RCA Summary roles
  { value: 'customerRcaSummary_reader', label: 'Customer RCA Reader', description: 'Read customer RCA data', category: 'Customer RCA' },
  { value: 'customerRcaSummary_editor', label: 'Customer RCA Editor', description: 'Read and write customer RCA data', category: 'Customer RCA' },
  { value: 'customerRcaSummary_owner', label: 'Customer RCA Owner', description: 'Full customer RCA control', category: 'Customer RCA' },
  
  // Alert Correlation roles
  { value: 'alertCorrelation_reader', label: 'Correlation Reader', description: 'Read correlation data', category: 'Alert Correlation' },
  { value: 'alertCorrelation_editor', label: 'Correlation Editor', description: 'Read and write correlation data', category: 'Alert Correlation' },
  { value: 'alertCorrelation_owner', label: 'Correlation Owner', description: 'Full correlation control', category: 'Alert Correlation' },
  
  // Compliance & Audit roles
  { value: 'complianceAudit_reader', label: 'Compliance Reader', description: 'Read compliance data', category: 'Compliance & Audit' },
  { value: 'complianceAudit_editor', label: 'Compliance Editor', description: 'Read and write compliance data', category: 'Compliance & Audit' },
  { value: 'complianceAudit_owner', label: 'Compliance Owner', description: 'Full compliance control', category: 'Compliance & Audit' },
  
  // Chatbot roles
  { value: 'chatbot_reader', label: 'Chatbot Reader', description: 'Read chatbot data', category: 'Chatbot' },
  { value: 'chatbot_editor', label: 'Chatbot Editor', description: 'Read and write chatbot data', category: 'Chatbot' },
  { value: 'chatbot_owner', label: 'Chatbot Owner', description: 'Full chatbot control', category: 'Chatbot' },
  
  // User Management roles
  { value: 'userManagement_reader', label: 'User Mgmt Reader', description: 'Read user management data', category: 'User Management' },
  { value: 'userManagement_editor', label: 'User Mgmt Editor', description: 'Read and write user management data', category: 'User Management' },
  { value: 'userManagement_owner', label: 'User Mgmt Owner', description: 'Full user management control', category: 'User Management' }
];

// Summary data - matching RCA Dashboard structure
const getSummaryData = (statistics) => {
  // Ensure statistics object exists and has default values
  const stats = statistics || {};
  const totalUsers = stats.totalUsers || 0;
  const activeUsers = stats.activeUsers || 0;
  const inactiveUsers = stats.inactiveUsers || 0;
  const recentUsers = stats.recentUsers || 0;


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
const Filters = ({ searchTerm, setSearchTerm, onClearFilters, onAddUser }) => {
  const hasFilters = searchTerm.trim() !== '';
  
  return (
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
          {hasFilters && (
            <Button 
              onClick={onClearFilters}
              variant="outline"
              className="flex items-center space-x-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <LuX className="w-4 h-4" />
              <span>Clear Filters</span>
            </Button>
          )}
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
};

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
            {user.status === 'active' ? (
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
            Roles
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
                  {user.status === 'active' ? 'Active' : 'Inactive'}
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
const EmptyState = ({ searchTerm, onClearFilters, onAddUser }) => (
  <div className="text-center py-12">
    <LuUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
    <p className="text-gray-600 mb-4">
      {searchTerm 
        ? 'Try adjusting your search criteria.'
        : 'Get started by adding your first user.'
      }
    </p>
    {searchTerm ? (
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



const UserManagement = () => {
  const { success, error: showError, warning, info } = useToast();
  
  // Confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // WebSocket hook for real-time user data
  const {
    users,
    loading,
    isInitialLoad,
    error,
    pagination,
    statistics,
    isConnected,
    notifications,
    requestUserData,
    requestUserStatistics,
    clearNotifications
  } = useUserWebSocket(import.meta.env.VITE_BACKEND_URL);

  // Local state management
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [managingUser, setManagingUser] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isUpdatingRoles, setIsUpdatingRoles] = useState(false);
  
  // Form state for user creation
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    roles: ['viewer'] // Default to viewer role
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open
  const searchTimeoutRef = useRef(null); // Ref for search debounce timeout
  const lastQueryRef = useRef(null); // Track last query to prevent duplicate requests
  const initialLoadDoneRef = useRef(false); // Track if initial load is complete

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

  // Ensure formData.roles is always initialized
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles || ['viewer']
    }));
  }, []);

  // Load users data on component mount - only once
  useEffect(() => {
    if (!initialLoadDoneRef.current && isConnected && isInitialLoad) {
      const initialQuery = {
      page: 1,
      limit: 10,
        query: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
      };
      lastQueryRef.current = JSON.stringify(initialQuery);
      requestUserData(initialQuery);
    requestUserStatistics();
      initialLoadDoneRef.current = true;
    }
  }, [isConnected, isInitialLoad]); // Removed requestUserData and requestUserStatistics from dependencies

  // Request statistics when connection is re-established (not on initial connection)
  useEffect(() => {
    if (isConnected && initialLoadDoneRef.current) {
      requestUserStatistics();
    }
  }, [isConnected]); // Removed requestUserStatistics from dependencies

  // Debounced search - prevents abrupt refreshes
  useEffect(() => {
    // Skip if initial load hasn't completed
    if (!initialLoadDoneRef.current || isInitialLoad) {
      return;
    }

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search (only triggers when searchTerm changes, not on connection changes)
    searchTimeoutRef.current = setTimeout(() => {
      if (isConnected) {
        const newQuery = {
          page: 1,
          limit: pagination.limit,
          query: searchTerm,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        };
        
        // Only fetch if query actually changed
        const queryString = JSON.stringify(newQuery);
        if (queryString !== lastQueryRef.current) {
          lastQueryRef.current = queryString;
          requestUserData(newQuery);
        }
      }
    }, 500); // 500ms delay

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, isConnected, isInitialLoad, pagination.limit]); // Removed requestUserData from dependencies

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
      phone: '',
      roles: ['viewer'] // Always set viewer role for new users
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

  // Role change handler removed - users will automatically get 'viewer' role

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
    
    // Role validation removed - users automatically get 'viewer' role
    
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
      
      
      // Close modal and refresh data
      handleCloseModals();
      // Refresh with current query parameters
      const refreshQuery = {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        query: searchTerm,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      lastQueryRef.current = JSON.stringify(refreshQuery);
      requestUserData(refreshQuery);
      
      // Handle OTP verification
      if (result.otpData) {
        
        // Set up OTP verification modal with the created user
        setOtpData({
          email: result.data.email,
          otp: '',
          deviceId: result.otpData.deviceId,
          preAuthSessionId: result.otpData.preAuthSessionId
        });
        setVerifyingUser(result.data);
        setShowOTPModal(true);
        
      } else {
        warning('User created successfully, but verification OTP could not be sent. Please contact the user directly.');
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
    setUserRoles(user.roles || []);
    setSelectedRoles(user.roles || []);
    setShowPermissionModal(true);
  };

  const handleRoleToggle = (roleValue) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleValue)) {
        return prev.filter(role => role !== roleValue);
      } else {
        return [...prev, roleValue];
      }
    });
  };

  const handleSaveRoles = async () => {
    if (!managingUser) return;
    
    setIsUpdatingRoles(true);
    try {
      
      // Ensure we're using the MongoDB ObjectId, not SuperTokens ID
      const userId = managingUser._id;
      if (!userId) {
        throw new Error('User ID not found in user object');
      }
      
      // Validate that we have a MongoDB ObjectId (24 character hex string)
      if (typeof userId !== 'string' || userId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(userId)) {
        console.error('❌ Invalid MongoDB ObjectId:', userId);
        throw new Error('Invalid user ID format. Expected MongoDB ObjectId.');
      }
      
      // Determine roles to add and remove
      const rolesToAdd = selectedRoles.filter(role => !userRoles.includes(role));
      const rolesToRemove = userRoles.filter(role => !selectedRoles.includes(role));
      
      // Remove roles first
      if (rolesToRemove.length > 0) {
        const currentRoles = selectedRoles.filter(role => !rolesToRemove.includes(role));
        await userService.updateUserRoles(userId, currentRoles);
      }
      
      // Add new roles
      if (rolesToAdd.length > 0) {
        await userService.addUserRoles(userId, rolesToAdd);
      }
      
      // Refresh user data
      const refreshQuery = {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        query: searchTerm,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      lastQueryRef.current = JSON.stringify(refreshQuery);
      requestUserData(refreshQuery);
      
      // Close modal
      handleCloseModals();
      
      success('User roles updated successfully!');
    } catch (error) {
      console.error('Error updating user roles:', error);
      showError(`Failed to update user roles: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsUpdatingRoles(false);
    }
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u._id === userId);
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await userService.deleteUser(userToDelete._id);
      
      if (result.success) {
        // Show success toast
        success(`User "${userToDelete.name || userToDelete.email}" deleted successfully!`);
        
        // Refresh user list with current filters
        const refreshQuery = {
          page: pagination.page || 1,
          limit: pagination.limit || 10,
          query: searchTerm,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        };
        lastQueryRef.current = JSON.stringify(refreshQuery);
        requestUserData(refreshQuery);
        
        // Close modal
        setShowDeleteModal(false);
        setUserToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showError(`Failed to delete user: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setIsDeleting(false);
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      
      // Find the user to get current status
      const user = users.find(u => u._id === userId);
      if (!user) {
        console.error(' User not found in frontend users array:', userId);
        showError('User not found');
        return;
      }
      
      const currentStatus = user.status;
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      
      // Show loading state
      setIsSubmitting(true);
      
      // Call API to update status
      const result = await userService.updateUserStatus(userId, newStatus);
      
      
      if (result.success) {
        success(`User status updated to ${newStatus}`);
        
        // Refresh user data to show updated status
        const refreshQuery = {
          page: pagination.page || 1,
          limit: pagination.limit || 10,
          query: searchTerm,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        };
        lastQueryRef.current = JSON.stringify(refreshQuery);
        requestUserData(refreshQuery);
      } else {
        console.error(' Frontend: Failed to update user status:', result.error);
        showError(`Failed to update user status: ${result.error}`);
      }
    } catch (error) {
      console.error(' Frontend: Error toggling user status:');
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
      console.error('   Full error:', error);
      showError('Error updating user status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    // Fetch users with cleared filters
    const newQuery = {
      page: 1,
      limit: pagination.limit,
      query: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    lastQueryRef.current = JSON.stringify(newQuery);
    requestUserData(newQuery);
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
        success('OTP sent successfully to user\'s email!');
      } else {
        showError(`Failed to send OTP: ${result.message}`);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      showError('Error sending OTP. Please try again.');
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
        success(`User email verified successfully! ${verifyingUser?.name ? `${verifyingUser.name}'s` : 'The user\'s'} email is now verified.`);
        setShowOTPModal(false);
        setOtpData({ email: '', otp: '', deviceId: null, preAuthSessionId: null });
        setVerifyingUser(null);
        // Refresh with current query parameters
        const refreshQuery = {
          page: pagination.page || 1,
          limit: pagination.limit || 10,
          query: searchTerm,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        };
        lastQueryRef.current = JSON.stringify(refreshQuery);
        requestUserData(refreshQuery);
      } else {
        showError(`Verification failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      showError('Error verifying OTP. Please try again.');
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
        success('OTP resent successfully!');
      } else {
        showError(`Failed to resend OTP: ${result.message}`);
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      showError('Error resending OTP. Please try again.');
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
    const newQuery = {
      page: newPage,
      limit: pagination.limit,
      query: searchTerm,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    lastQueryRef.current = JSON.stringify(newQuery);
    requestUserData(newQuery);
  };

  const handleLimitChange = (newLimit) => {
    const newQuery = {
      page: 1,
      limit: newLimit,
      query: searchTerm,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    lastQueryRef.current = JSON.stringify(newQuery);
    requestUserData(newQuery);
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
    setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', roles: ['viewer'] });
    setFormErrors({});
    setOtpData({ email: '', otp: '', deviceId: null, preAuthSessionId: null });
    setOtpErrors({});
    setUserRoles([]);
    setSelectedRoles([]);
    setIsUpdatingRoles(false);
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
          {isInitialLoad && statistics.totalUsers === 0 ? (
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
        onClearFilters={handleClearFilters}
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

      {isInitialLoad ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <LuLoader className="text-4xl mx-auto animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading users...</h3>
          <p className="text-gray-500">Fetching data from the server</p>
        </div>
      ) : users.length > 0 ? (
        <>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden relative">
            {/* Subtle loading overlay for background refreshes */}
            {loading && !isInitialLoad && (
              <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg shadow-sm">
                  <LuLoader className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </div>
              </div>
            )}
            
          <UserTable 
            users={users}
            onDropdownToggle={handleDropdownToggle}
            onDropdownAction={handleDropdownAction}
            openDropdown={openDropdown}
            isOTPSubmitting={isOTPSubmitting}
            handleSendOTP={handleSendOTP}
          />
          </div>
          
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
                    disabled={loading && !isInitialLoad}
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
                  disabled={!pagination.hasPrev || (loading && !isInitialLoad)}
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
                        disabled={loading && !isInitialLoad}
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
                  disabled={!pagination.hasNext || (loading && !isInitialLoad)}
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
              
              {/* Role selection removed - users automatically get 'viewer' role */}
              
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
                  Status
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingUser.status)}`}>
                    {viewingUser.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Login
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {viewingUser.lastLoginAt ? new Date(viewingUser.lastLoginAt).toLocaleString() : 'Never'}
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

      {/* Role Management Modal */}
      {showPermissionModal && managingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Manage Roles - {managingUser.name}</h2>
            
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
                  <div className="flex flex-wrap gap-1 mt-2">
                    {userRoles.map(role => (
                      <span key={role} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {availableRoles.find(r => r.value === role)?.label || role}
                  </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Assign Roles</h3>
              
              {/* Group roles by category */}
              {Object.entries(
                availableRoles.reduce((acc, role) => {
                  if (!acc[role.category]) acc[role.category] = [];
                  acc[role.category].push(role);
                  return acc;
                }, {})
              ).map(([category, roles]) => (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-800 mb-3">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {roles.map((role) => (
                      <label key={role.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.value)}
                          onChange={() => handleRoleToggle(role.value)}
                          className="mt-1 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{role.label}</div>
                          <div className="text-xs text-gray-500 mt-1">{role.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModals}
                disabled={isUpdatingRoles}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                className="bg-lime-600 hover:bg-lime-700 text-white"
                onClick={handleSaveRoles}
                disabled={isUpdatingRoles}
              >
                {isUpdatingRoles ? 'Updating...' : 'Save Roles'}
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
                {verifyingUser?.name ? 
                  `Please enter the 6-digit code to verify ${verifyingUser.name}'s email address.` :
                  'Please enter the 6-digit code to verify the user\'s email address.'
                }
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

      {/* Confirmation Modal for User Deletion */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteUser}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete "${userToDelete?.name || userToDelete?.email}"? This action cannot be undone.`}
        confirmText="Delete User"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UserManagement;