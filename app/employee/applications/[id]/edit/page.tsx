'use client';

// Force dynamic rendering to prevent static generation issues with useSession
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Home, 
  Briefcase, 
  DollarSign, 
  AlertTriangle
} from 'lucide-react';

interface Application {
  _id: string;
  userId: string;
  status: string;
  borrowerInfo: Record<string, unknown>;
  currentAddress: Record<string, unknown>;
  employment: Record<string, unknown>;
  financialInfo: Record<string, unknown>;
  propertyInfo: Record<string, unknown>;
  declarations: Record<string, unknown>;
  documents: Record<string, unknown>[];
  statusHistory: Record<string, unknown>[];
  assignedTo?: string;
  reviewedBy?: string;
  submittedAt: string;
  createdAt: string;
}

export default function EditApplication({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [notes, setNotes] = useState('');

  const fetchApplication = useCallback(async () => {
    try {
      const response = await fetch(`/api/loan-application?id=${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setApplication(data.application);
        setFormData(data.application);
      } else {
        console.error('Failed to fetch application:', data.error);
        router.push('/employee/dashboard');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      router.push('/employee/dashboard');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'employee') {
      router.push('/login');
      return;
    }

    fetchApplication();
  }, [session, status, router, fetchApplication]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/loan-application', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: params.id,
          ...formData,
          notes: notes || 'Application updated by employee',
          updatedBy: session?.user?.id
        })
      });

      if (response.ok) {
        alert('Application updated successfully!');
        router.push(`/employee/applications/${params.id}`);
      } else {
        alert('Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Error updating application');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <DashboardLayout
        userName={session.user.name || 'Employee'}
        userRole={session.user.role}
        userEmail={session.user.email || ''}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h2>
            <button
              onClick={() => router.push('/employee/dashboard')}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userName={session.user.name || 'Employee'}
      userRole={session.user.role}
      userEmail={session.user.email || ''}
    >
      <div className="space-y-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/employee/applications/${params.id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Application
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Edit Application #{application._id.slice(-8)}
              </h1>
              <p className="text-gray-600">
                Update application information and details
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Save className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Borrower Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Borrower Information</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.borrowerInfo?.firstName || ''}
                    onChange={(e) => handleInputChange('borrowerInfo', 'firstName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.borrowerInfo?.lastName || ''}
                    onChange={(e) => handleInputChange('borrowerInfo', 'lastName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.borrowerInfo?.email || ''}
                    onChange={(e) => handleInputChange('borrowerInfo', 'email', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.borrowerInfo?.phone || ''}
                    onChange={(e) => handleInputChange('borrowerInfo', 'phone', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Marital Status
                  </label>
                  <select
                    value={formData.borrowerInfo?.maritalStatus || ''}
                    onChange={(e) => handleInputChange('borrowerInfo', 'maritalStatus', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dependents
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.borrowerInfo?.dependents || 0}
                    onChange={(e) => handleInputChange('borrowerInfo', 'dependents', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Current Address */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Home className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Current Address</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.currentAddress?.street || ''}
                    onChange={(e) => handleInputChange('currentAddress', 'street', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.currentAddress?.city || ''}
                    onChange={(e) => handleInputChange('currentAddress', 'city', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.currentAddress?.state || ''}
                    onChange={(e) => handleInputChange('currentAddress', 'state', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.currentAddress?.zipCode || ''}
                    onChange={(e) => handleInputChange('currentAddress', 'zipCode', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years at Address
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentAddress?.yearsAtAddress || 0}
                    onChange={(e) => handleInputChange('currentAddress', 'yearsAtAddress', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Employment */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Employment Information</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Employer Name
                  </label>
                  <input
                    type="text"
                    value={formData.employment?.employerName || ''}
                    onChange={(e) => handleInputChange('employment', 'employerName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    value={formData.employment?.position || ''}
                    onChange={(e) => handleInputChange('employment', 'position', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years Employed
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.employment?.yearsEmployed || 0}
                    onChange={(e) => handleInputChange('employment', 'yearsEmployed', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Income
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.employment?.monthlyIncome || 0}
                    onChange={(e) => handleInputChange('employment', 'monthlyIncome', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Financial Information</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gross Monthly Income
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.financialInfo?.grossMonthlyIncome || 0}
                    onChange={(e) => handleInputChange('financialInfo', 'grossMonthlyIncome', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Assets
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.financialInfo?.totalAssets || 0}
                    onChange={(e) => handleInputChange('financialInfo', 'totalAssets', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Liabilities
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.financialInfo?.totalLiabilities || 0}
                    onChange={(e) => handleInputChange('financialInfo', 'totalLiabilities', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Checking Account Balance
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.financialInfo?.checkingAccountBalance || 0}
                    onChange={(e) => handleInputChange('financialInfo', 'checkingAccountBalance', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Home className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Property & Loan Information</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Address
                  </label>
                  <input
                    type="text"
                    value={formData.propertyInfo?.propertyAddress || ''}
                    onChange={(e) => handleInputChange('propertyInfo', 'propertyAddress', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.propertyInfo?.propertyValue || 0}
                    onChange={(e) => handleInputChange('propertyInfo', 'propertyValue', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loan Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.propertyInfo?.loanAmount || 0}
                    onChange={(e) => handleInputChange('propertyInfo', 'loanAmount', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loan Purpose
                  </label>
                  <select
                    value={formData.propertyInfo?.loanPurpose || ''}
                    onChange={(e) => handleInputChange('propertyInfo', 'loanPurpose', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  >
                    <option value="">Select Purpose</option>
                    <option value="purchase">Purchase</option>
                    <option value="refinance">Refinance</option>
                    <option value="cash_out">Cash Out</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Down Payment Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.propertyInfo?.downPaymentAmount || 0}
                    onChange={(e) => handleInputChange('propertyInfo', 'downPaymentAmount', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Update Notes */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about the changes made..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition resize-none"
              />
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Editing Guidelines
              </h4>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>• Verify all information is accurate</li>
                <li>• Document any changes made</li>
                <li>• Ensure compliance with regulations</li>
                <li>• Update related fields when necessary</li>
                <li>• Save changes regularly</li>
              </ul>
            </div>

            {/* Status History */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Changes</h3>
              <div className="space-y-3">
                {application.statusHistory?.slice(-3).map((entry, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{entry.status as string}</p>
                      <p className="text-xs text-gray-500">{new Date(entry.changedAt as string).toLocaleString()}</p>
                      {entry.notes ? <p className="text-xs text-gray-600 mt-1">{String(entry.notes)}</p> : null}
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-sm">No recent changes</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
