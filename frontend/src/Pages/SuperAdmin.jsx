import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  FaUsers, 
  FaUserShield, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaBan, 
  FaCheck,
  FaChartLine,
  FaCalendarAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useToast } from '../hooks/useToast.jsx';

const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    adminPermissions: {
      canManageUsers: false,
      canManageEvents: false,
      canManageReports: false,
      canViewAnalytics: false,
      canModerateContent: false,
    },
  });
  const { success, error } = useToast();

  useEffect(() => {
    fetchAnalytics();
    fetchUsers();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('https://event-easy.onrender.com/Event-Easy/admin/analytics', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://event-easy.onrender.com/Event-Easy/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const allUsers = response.data.data.users;
      setUsers(allUsers.filter(user => ['attendee', 'organizer'].includes(user.role)));
      setAdmins(allUsers.filter(user => user.role === 'admin'));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async () => {
    try {
              await axios.post('https://event-easy.onrender.com/Event-Easy/admin/users/admin', newAdmin, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setShowCreateAdminModal(false);
      setNewAdmin({
        name: '',
        email: '',
        password: '',
        adminPermissions: {
          canManageUsers: false,
          canManageEvents: false,
          canManageReports: false,
          canViewAnalytics: false,
          canModerateContent: false,
        },
      });
      fetchUsers();
      success('Admin created successfully!');
    } catch (error) {
      console.error('Error creating admin:', error);
      error('Failed to create admin: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const updateAdminPermissions = async (adminId, permissions) => {
    try {
              await axios.put(`https://event-easy.onrender.com/Event-Easy/admin/users/${adminId}/permissions`, {
        adminPermissions: permissions,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchUsers();
      success('Admin permissions updated successfully!');
    } catch (err) {
      console.error('Error updating admin permissions:', err);
      error('Failed to update admin permissions');
    }
  };

  const toggleUserSuspension = async (userId, suspend, reason = '') => {
    try {
              await axios.put(`https://event-easy.onrender.com/Event-Easy/admin/users/${userId}/suspension`, {
        suspend,
        reason,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchUsers();
      success(`User ${suspend ? 'suspended' : 'unsuspended'} successfully!`);
    } catch (err) {
      console.error('Error toggling user suspension:', err);
      error('Failed to update user suspension status');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
              await axios.delete(`https://event-easy.onrender.com/Event-Easy/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchUsers();
      success('User deleted successfully!');
    } catch (err) {
      console.error('Error deleting user:', err);
      error('Failed to delete user');
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-blue-500"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
              <FaUsers className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {analytics.userStats?.reduce((sum, stat) => sum + stat.count, 0) || 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-green-500"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
              <FaCalendarAlt className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {analytics.eventStats?.reduce((sum, stat) => sum + stat.count, 0) || 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-purple-500"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mr-4">
              <FaUserShield className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{admins.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-orange-500"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 mr-4">
              <FaChartLine className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Events</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {analytics.eventStats?.find(stat => stat._id === 'approved')?.count || 0}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Users</h3>
          <div className="space-y-3">
            {analytics.recentUsers?.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Events</h3>
          <div className="space-y-3">
            {analytics.recentEvents?.map((event) => (
              <div key={event._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{event.eventName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">by {event.organizer?.name}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  event.status === 'approved' 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : event.status === 'pending'
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Management</h2>
        <button
          onClick={() => setShowCreateAdminModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus />
          Create Admin
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {admins.map((admin) => (
                <tr key={admin._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{admin.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(admin.adminPermissions || {}).map(([key, value]) => (
                        value && (
                          <span key={key} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                            {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        )
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedAdmin(admin)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteUser(admin._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.isSuspended
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    }`}>
                      {user.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => toggleUserSuspension(user._id, !user.isSuspended, 'Admin action')}
                      className={`mr-4 ${
                        user.isSuspended 
                          ? 'text-green-600 hover:text-green-900' 
                          : 'text-yellow-600 hover:text-yellow-900'
                      }`}
                    >
                      {user.isSuspended ? <FaCheck /> : <FaBan />}
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Super Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage the entire platform</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
            { id: 'admins', label: 'Admin Management', icon: FaUserShield },
            { id: 'users', label: 'User Management', icon: FaUsers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'admins' && renderAdminManagement()}
        {activeTab === 'users' && renderUserManagement()}

        {/* Create Admin Modal */}
        {showCreateAdminModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Create New Admin</h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
                
                <input
                  type="email"
                  placeholder="Email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
                
                <input
                  type="password"
                  placeholder="Password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Permissions:</label>
                  {Object.keys(newAdmin.adminPermissions).map((permission) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newAdmin.adminPermissions[permission]}
                        onChange={(e) => setNewAdmin({
                          ...newAdmin,
                          adminPermissions: {
                            ...newAdmin.adminPermissions,
                            [permission]: e.target.checked,
                          },
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowCreateAdminModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={createAdmin}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Admin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Admin Permissions Modal */}
        {selectedAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Edit Permissions for {selectedAdmin.name}
              </h3>
              
              <div className="space-y-2">
                {Object.keys(selectedAdmin.adminPermissions || {}).map((permission) => (
                  <label key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedAdmin.adminPermissions[permission]}
                      onChange={(e) => setSelectedAdmin({
                        ...selectedAdmin,
                        adminPermissions: {
                          ...selectedAdmin.adminPermissions,
                          [permission]: e.target.checked,
                        },
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setSelectedAdmin(null)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateAdminPermissions(selectedAdmin._id, selectedAdmin.adminPermissions);
                    setSelectedAdmin(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdmin;