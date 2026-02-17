'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Loader2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function DemoShowcasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [setupStatus, setSetupStatus] = useState<string | null>(null);

  const handleQuickLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        alert('Login failed. Please run demo setup first.');
        setLoading(false);
        return;
      }
      // Redirect by role so each button leads to the right dashboard
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      if (session?.user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (session?.user?.role === 'employee') {
        router.push('/employee/dashboard');
      } else if (session?.user?.role === 'customer') {
        router.push('/customer/dashboard');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupDemo = async () => {
    setLoading(true);
    setSetupStatus('Setting up demo accounts...');
    
    try {
      const response = await fetch('/api/setup-demo-accounts');
      const data = await response.json();
      
      if (data.success) {
        setSetupStatus(`✅ Success! Created ${data.results.summary.users} users and ${data.results.summary.applications} applications`);
        setTimeout(() => setSetupStatus(null), 5000);
      } else {
        setSetupStatus('❌ Setup failed. Check console for details.');
      }
    } catch (error) {
      console.error('Setup error:', error);
      setSetupStatus('❌ Error setting up demo');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    {
      role: 'Admin',
      icon: Shield,
      color: 'from-purple-600 to-indigo-600',
      accounts: [
        {
          name: 'Admin Demo',
          email: 'admin.demo@loanticks.com',
          password: 'demo123',
          features: [
            'View all loan applications',
            'Manage employees',
            'System statistics dashboard',
            'Full administrative access',
            'Employee management tools'
          ]
        }
      ]
    },
    {
      role: 'Employee',
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
      accounts: [
        {
          name: 'John Smith',
          email: 'john.employee@loanticks.com',
          password: 'demo123',
          badge: 'Has Assigned Cases',
          features: [
            'Review assigned applications',
            'Approve/reject loan requests',
            'View customer credit scores',
            'Add decision notes',
            'Track application history'
          ]
        },
        {
          name: 'Lisa Anderson',
          email: 'lisa.employee@loanticks.com',
          password: 'demo123',
          badge: 'Senior Employee',
          features: [
            'Multiple assigned cases',
            'Approved applications history',
            'High-value loan processing',
            'Complete workflow examples',
            'Performance tracking'
          ]
        }
      ]
    },
    {
      role: 'Customer',
      icon: TrendingUp,
      color: 'from-green-600 to-emerald-600',
      accounts: [
        {
          name: 'Sarah Johnson',
          email: 'sarah.customer@loanticks.com',
          password: 'demo123',
          badge: 'New Customer',
          badgeIcon: Sparkles,
          features: [
            'Clean dashboard (no applications)',
            'Start new loan application',
            'Experience 15-step URLA form',
            'See credit score field',
            'Submit complete application'
          ]
        },
        {
          name: 'Michael Chen',
          email: 'michael.customer@loanticks.com',
          password: 'demo123',
          badge: 'Pending Application',
          badgeIcon: Clock,
          features: [
            'Active pending application',
            'Track application status',
            'View progress timeline',
            'Check submission details',
            'Credit Score: 740 (Very Good)'
          ]
        },
        {
          name: 'Emily Rodriguez',
          email: 'emily.customer@loanticks.com',
          password: 'demo123',
          badge: 'APPROVED ✨',
          badgeIcon: CheckCircle,
          features: [
            'Successfully approved loan!',
            'High credit score (780)',
            'See approval notes',
            'Complete success workflow',
            '$680,000 loan approved'
          ]
        },
        {
          name: 'David Thompson',
          email: 'david.customer@loanticks.com',
          password: 'demo123',
          badge: 'Rejected',
          badgeIcon: XCircle,
          features: [
            'Rejected application example',
            'View rejection reasons',
            'See decision notes',
            'Lower credit scenario (620)',
            'High DTI ratio example'
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
      {/* Hero Section */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl shadow-lg relative overflow-hidden bg-white">
                <Image src="/logo.jpg" alt="LOANATICKS" fill className="object-contain" priority />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">LOANATICKS Demo Showcase</h1>
                <p className="text-white/80 mt-1">Explore all features with pre-configured demo accounts</p>
              </div>
            </div>
            <button
              onClick={handleSetupDemo}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Setting Up...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Setup Demo Data
                </>
              )}
            </button>
          </div>
          
          {setupStatus && (
            <div className="mt-4 p-4 bg-white/20 backdrop-blur-md rounded-xl text-white font-medium">
              {setupStatus}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-purple-600" />
            Quick Start Guide
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="font-bold text-purple-900 mb-2">1. Setup Demo Data</div>
              <p className="text-purple-700">Click &quot;Setup Demo Data&quot; button above to create accounts and sample applications</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="font-bold text-blue-900 mb-2">2. Choose Account</div>
              <p className="text-blue-700">Select any demo account below to instantly login and explore features</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="font-bold text-green-900 mb-2">3. Explore Features</div>
              <p className="text-green-700">Each account showcases different features and workflows</p>
            </div>
          </div>
        </div>

        {/* Demo Accounts by Role */}
        {demoAccounts.map((section) => (
          <div key={section.role} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className={`bg-gradient-to-r ${section.color} p-6 text-white`}>
              <div className="flex items-center gap-3">
                <section.icon className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">{section.role} Accounts</h2>
                  <p className="text-white/90 text-sm">{section.accounts.length} demo {section.accounts.length === 1 ? 'account' : 'accounts'} available</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {section.accounts.map((account) => (
                <div 
                  key={account.email}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{account.email}</p>
                      {account.badge && (
                        <div className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                          account.badge.includes('APPROVED') ? 'bg-green-100 text-green-700' :
                          account.badge.includes('Rejected') ? 'bg-red-100 text-red-700' :
                          account.badge.includes('Pending') ? 'bg-orange-100 text-orange-700' :
                          account.badge.includes('Senior') ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {account.badgeIcon && <account.badgeIcon className="h-3 w-3" />}
                          {account.badge}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleQuickLogin(account.email, account.password)}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                      ) : (
                        <>
                          Login
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="font-semibold text-gray-700 text-sm mb-2">Features to Explore:</div>
                    {account.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Email:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded">{account.email}</code>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Password:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded">{account.password}</code>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Additional Info */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Pro Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <div className="bg-purple-100 text-purple-600 rounded-full p-1 mt-0.5">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold mb-1">Try All Workflows</div>
                <p className="text-gray-600">Each customer account shows a different application status</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-0.5">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold mb-1">Employee Experience</div>
                <p className="text-gray-600">Login as employee to review and approve applications</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold mb-1">Admin Powers</div>
                <p className="text-gray-600">Admin account has full access to all system features</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-orange-100 text-orange-600 rounded-full p-1 mt-0.5">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold mb-1">Create New Application</div>
                <p className="text-gray-600">Use Sarah Johnson&apos;s account to start from scratch</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

