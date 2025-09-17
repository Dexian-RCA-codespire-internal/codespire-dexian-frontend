import React, { useState, useEffect } from 'react';
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
  LuActivity
} from 'react-icons/lu';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/card';

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
const getSummaryData = (users, pagination, paginatedUsers) => [
  {
    title: 'Total Users',
    value: pagination.total.toString(),
    subtitle: `${paginatedUsers.length} on current page`,
    subtitleColor: 'text-green-600',
    icon: <LuUsers className="text-2xl text-green-600" />,
    bgColor: 'bg-white',
    borderColor: 'border-gray-200'
  },
  {
    title: 'Active Users',
    value: users.filter(user => user.status === 'Active').length.toString(),
    subtitle: 'Currently active',
    subtitleColor: 'text-blue-600',
    icon: <LuUserCheck className="text-2xl text-blue-600" />,
    bgColor: 'bg-white',
    borderColor: 'border-gray-200'
  },
  {
    title: 'Inactive Users',
    value: users.filter(user => user.status === 'Inactive').length.toString(),
    subtitle: 'Currently inactive',
    subtitleColor: 'text-red-600',
    icon: <LuUserX className="text-2xl text-red-600" />,
    bgColor: 'bg-white',
    borderColor: 'border-gray-200'
  },
  {
    title: 'New This Week',
    value: users.filter(user => {
      const userDate = new Date(user.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return userDate >= weekAgo;
    }).length.toString(),
    subtitle: 'Recently registered',
    subtitleColor: 'text-emerald-600',
    icon: <LuUserPlus className="text-2xl text-emerald-600" />,
    bgColor: 'bg-white',
    borderColor: 'border-gray-200'
  }
]

// Utility functions
const getStatusColor = (status) => {
  return status === 'Active' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
};

const getRoleColor = (role) => {
  switch (role) {
    case 'Admin':
      return 'text-purple-600 bg-purple-100';
    case 'Moderator':
      return 'text-blue-600 bg-blue-100';
    case 'User':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getDefaultPermission = (userRole, moduleKey) => {
  switch (userRole) {
    case 'Admin':
      return 'both';
    case 'Moderator':
      if (['dashboard', 'tickets', 'ai-rca'].includes(moduleKey)) return 'both';
      if (['pattern-detector', 'playbook'].includes(moduleKey)) return 'read';
      return 'none';
    case 'User':
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
      onClick={() => onToggle(user.id)}
      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
      title="More actions"
    >
      <div className="flex flex-col space-y-1">
        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
      </div>
    </button>
    
    {isOpen && (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
        <div className="py-1">
          <button
            onClick={() => onAction('view', user)}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LuEye className="w-4 h-4 mr-3" />
            View
          </button>
          <button
            onClick={() => onAction('toggle-status', user)}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LuShield className="w-4 h-4 mr-3" />
            Permission
          </button>
          <button
            onClick={() => onAction('delete', user)}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
const UserTable = ({ users, onDropdownToggle, onDropdownAction, openDropdown }) => (
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
            <tr key={user.id} className="hover:bg-gray-50">
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
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.lastLogin}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.createdAt}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-center">
                  <ActionDropdown
                    user={user}
                    isOpen={openDropdown === user.id}
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
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [managingUser, setManagingUser] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open
  
  // Pagination state - matching RCA Dashboard structure
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Load users data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      // Update pagination state to match RCA Dashboard
      setPagination({
        page: 1,
        limit: 10,
        total: mockUsers.length,
        totalPages: Math.ceil(mockUsers.length / 10),
        hasNext: mockUsers.length > 10,
        hasPrev: false
      });
      setLoading(false);
    }, 1000);
  }, []);

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role.toLowerCase() === selectedRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  // Update pagination when filters change
  useEffect(() => {
    const totalPages = Math.ceil(filteredUsers.length / pagination.limit);
    setPagination(prev => ({
      ...prev,
      page: 1, // Reset to first page when filters change
      total: filteredUsers.length,
      totalPages: totalPages,
      hasNext: totalPages > 1,
      hasPrev: false
    }));
  }, [searchTerm, selectedRole, filteredUsers.length, pagination.limit]);

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

  // Pagination calculations
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Event handlers
  const handleAddUser = () => setShowAddUserModal(true);
  
  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowAddUserModal(true);
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
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleToggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
        : user
    ));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
  };

  // Pagination handlers - matching RCA Dashboard
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage,
      hasNext: newPage < prev.totalPages,
      hasPrev: newPage > 1
    }));
  };

  const handleLimitChange = (newLimit) => {
    const totalPages = Math.ceil(filteredUsers.length / newLimit);
    setPagination(prev => ({
      ...prev,
      page: 1,
      limit: newLimit,
      totalPages: totalPages,
      hasNext: totalPages > 1,
      hasPrev: false
    }));
  };

  const handleCloseModals = () => {
    setShowAddUserModal(false);
    setShowViewModal(false);
    setShowPermissionModal(false);
    setEditingUser(null);
    setViewingUser(null);
    setManagingUser(null);
    setOpenDropdown(null);
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
        handleToggleUserStatus(user.id);
        break;
      case 'delete':
        handleDeleteUser(user.id);
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
          {getSummaryData(users, pagination, paginatedUsers).map((item, index) => (
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
          ))}
        </div>
      
      <Filters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        onAddUser={handleAddUser}
      />

      {filteredUsers.length > 0 ? (
        <>
          <UserTable 
            users={paginatedUsers}
            onDropdownToggle={handleDropdownToggle}
            onDropdownAction={handleDropdownAction}
            openDropdown={openDropdown}
          />
          
          {/* Pagination Controls - matching RCA Dashboard */}
          {paginatedUsers.length > 0 && (
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
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
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
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  defaultValue={editingUser?.name || ''}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  defaultValue={editingUser?.email || ''}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500">
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-lime-600 hover:bg-lime-700 text-white">
                  {editingUser ? 'Update User' : 'Add User'}
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
    </div>
  );
};

export default UserManagement;