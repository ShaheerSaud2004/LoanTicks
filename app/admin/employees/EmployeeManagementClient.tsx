'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  UserPlus,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Search,
  Filter,
  Download
} from 'lucide-react';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  averageProcessingTime: number;
}

interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalApplicationsProcessed: number;
  averageProcessingTime: number;
  topPerformer: Employee | null;
}

export default function EmployeeManagementClient() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);

  // Form state for creating new employee
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  });

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/admin/employees');
      const data = await response.json();
      
      if (response.ok) {
        setEmployees(data.employees || []);
        setStats(data.stats || null);
      } else {
        console.error('Failed to fetch employees:', data.error);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newEmployee.password !== newEmployee.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newEmployee.firstName,
          lastName: newEmployee.lastName,
          email: newEmployee.email,
          password: newEmployee.password,
          role: newEmployee.role
        }),
      });

      if (response.ok) {
        alert('Employee created successfully!');
        setShowCreateForm(false);
        setNewEmployee({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'employee'
        });
        fetchEmployees();
      } else {
        const errorData = await response.json();
        alert(`Failed to create employee: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      alert('Error creating employee');
    }
  };

  const handleToggleEmployeeStatus = async (employeeId: string, currentStatus: string) => {
    try {
      const response = await fetch('/api/admin/employees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          action: 'toggle_status',
          status: currentStatus === 'active' ? 'inactive' : 'active'
        }),
      });

      if (response.ok) {
        alert('Employee status updated successfully!');
        fetchEmployees();
      } else {
        const errorData = await response.json();
        alert(`Failed to update employee: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Error updating employee');
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/employees', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });

      if (response.ok) {
        alert('Employee deleted successfully!');
        fetchEmployees();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete employee: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Error deleting employee');
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getPerformanceBadge = (employee: Employee) => {
    const approvalRate = employee.totalApplications > 0 ? 
      (employee.approvedApplications / employee.totalApplications) * 100 : 0;
    
    if (approvalRate >= 80) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Top Performer</span>;
    } else if (approvalRate >= 60) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Good</span>;
    } else if (approvalRate >= 40) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">Average</span>;
    } else {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Needs Improvement</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600 mt-2">Manage employees and track their performance</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition"
          >
            <UserPlus className="w-5 h-5" />
            Add Employee
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeEmployees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applications Processed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalApplicationsProcessed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Processing Time</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageProcessingTime.toFixed(1)} days</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Performer */}
        {stats?.topPerformer && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Top Performer This Month
                </h3>
                <p className="text-yellow-800">
                  <strong>{stats.topPerformer.firstName} {stats.topPerformer.lastName}</strong> - 
                  {stats.topPerformer.approvedApplications} approved applications, 
                  {stats.topPerformer.averageProcessingTime.toFixed(1)} days avg. processing time
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.topPerformer.totalApplications > 0 ? 
                    ((stats.topPerformer.approvedApplications / stats.topPerformer.totalApplications) * 100).toFixed(0) : 0}%
                </div>
                <div className="text-sm text-yellow-700">Approval Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Employees ({filteredEmployees.length})</h2>
          </div>
          
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No employees found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Processing Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          employee.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPerformanceBadge(employee)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Total: {employee.totalApplications}</div>
                          <div className="text-green-600">Approved: {employee.approvedApplications}</div>
                          <div className="text-red-600">Rejected: {employee.rejectedApplications}</div>
                          <div className="text-yellow-600">Pending: {employee.pendingApplications}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.averageProcessingTime.toFixed(1)} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.lastLogin ? new Date(employee.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowEmployeeDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleToggleEmployeeStatus(employee._id, employee.status)}
                            className={`flex items-center gap-1 ${
                              employee.status === 'active' 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {employee.status === 'active' ? (
                              <>
                                <XCircle className="w-4 h-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Activate
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee._id)}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Employee Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Employee</h2>
            
            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                >
                  <option value="employee">Employee</option>
                  <option value="senior_employee">Senior Employee</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={newEmployee.confirmPassword}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  required
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                >
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {showEmployeeDetails && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </h2>
              <button
                onClick={() => setShowEmployeeDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Personal Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                    <p><span className="font-medium">Email:</span> {selectedEmployee.email}</p>
                    <p><span className="font-medium">Role:</span> {selectedEmployee.role}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedEmployee.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedEmployee.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Performance Metrics</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Total Applications:</span> {selectedEmployee.totalApplications}</p>
                    <p><span className="font-medium">Approved:</span> <span className="text-green-600">{selectedEmployee.approvedApplications}</span></p>
                    <p><span className="font-medium">Rejected:</span> <span className="text-red-600">{selectedEmployee.rejectedApplications}</span></p>
                    <p><span className="font-medium">Pending:</span> <span className="text-yellow-600">{selectedEmployee.pendingApplications}</span></p>
                    <p><span className="font-medium">Avg. Processing Time:</span> {selectedEmployee.averageProcessingTime.toFixed(1)} days</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Account Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Created:</span> {new Date(selectedEmployee.createdAt).toLocaleDateString()}</p>
                  <p><span className="font-medium">Last Login:</span> {selectedEmployee.lastLogin ? new Date(selectedEmployee.lastLogin).toLocaleDateString() : 'Never'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
