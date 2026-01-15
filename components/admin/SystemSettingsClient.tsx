'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Clock, 
  Lock, 
  Mail, 
  Database, 
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface SystemSettings {
  session: {
    timeoutMinutes: number;
    updateIntervalMinutes: number;
  };
  rateLimiting: {
    loginAttempts: number;
    loginWindowMinutes: number;
    applicationSubmissions: number;
    applicationWindowHours: number;
    documentUploads: number;
    documentWindowMinutes: number;
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSpecialChar: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    applicationSubmitted: boolean;
    applicationApproved: boolean;
    applicationRejected: boolean;
    statusChanged: boolean;
  };
  maintenance: {
    autoCleanupEnabled: boolean;
    cleanupIntervalDays: number;
  };
}

const defaultSettings: SystemSettings = {
  session: {
    timeoutMinutes: 30,
    updateIntervalMinutes: 5,
  },
  rateLimiting: {
    loginAttempts: 5,
    loginWindowMinutes: 15,
    applicationSubmissions: 5,
    applicationWindowHours: 1,
    documentUploads: 20,
    documentWindowMinutes: 1,
  },
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
  },
  notifications: {
    emailEnabled: true,
    applicationSubmitted: true,
    applicationApproved: true,
    applicationRejected: true,
    statusChanged: true,
  },
  maintenance: {
    autoCleanupEnabled: false,
    cleanupIntervalDays: 30,
  },
};

export default function SystemSettingsClient() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'session' | 'security' | 'notifications' | 'maintenance'>('session');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings({ ...defaultSettings, ...data.settings });
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveStatus('idle');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-indigo-600 rounded-xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8" />
          <h1 className="text-2xl md:text-3xl font-bold">System Settings</h1>
        </div>
        <p className="text-gray-100 text-sm md:text-base">
          Configure system preferences, security settings, and maintenance options
        </p>
      </div>

      {/* Save Status */}
      {saveStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800 font-medium">Settings saved successfully!</p>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800 font-medium">Failed to save settings. Please try again.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab('session')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'session'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Session Settings
              </div>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'security'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security & Rate Limiting
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'notifications'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Notifications
              </div>
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'maintenance'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Maintenance
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Session Settings */}
          {activeTab === 'session' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Management</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={settings.session.timeoutMinutes}
                      onChange={(e) => updateSetting('session', 'timeoutMinutes', parseInt(e.target.value) || 30)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Users will be automatically logged out after this period of inactivity (5-480 minutes)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Update Interval (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.session.updateIntervalMinutes}
                      onChange={(e) => updateSetting('session', 'updateIntervalMinutes', parseInt(e.target.value) || 5)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      How often to refresh the session token (1-30 minutes)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Limiting</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Login Attempts Limit
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="20"
                        value={settings.rateLimiting.loginAttempts}
                        onChange={(e) => updateSetting('rateLimiting', 'loginAttempts', parseInt(e.target.value) || 5)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Login Window (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={settings.rateLimiting.loginWindowMinutes}
                        onChange={(e) => updateSetting('rateLimiting', 'loginWindowMinutes', parseInt(e.target.value) || 15)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Submissions Limit
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={settings.rateLimiting.applicationSubmissions}
                        onChange={(e) => updateSetting('rateLimiting', 'applicationSubmissions', parseInt(e.target.value) || 5)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Window (hours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={settings.rateLimiting.applicationWindowHours}
                        onChange={(e) => updateSetting('rateLimiting', 'applicationWindowHours', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Uploads Limit
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={settings.rateLimiting.documentUploads}
                        onChange={(e) => updateSetting('rateLimiting', 'documentUploads', parseInt(e.target.value) || 20)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Window (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.rateLimiting.documentWindowMinutes}
                        onChange={(e) => updateSetting('rateLimiting', 'documentWindowMinutes', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Policy</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Password Length
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="32"
                      value={settings.password.minLength}
                      onChange={(e) => updateSetting('password', 'minLength', parseInt(e.target.value) || 12)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.password.requireUppercase}
                        onChange={(e) => updateSetting('password', 'requireUppercase', e.target.checked)}
                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-700">Require uppercase letter</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.password.requireLowercase}
                        onChange={(e) => updateSetting('password', 'requireLowercase', e.target.checked)}
                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-700">Require lowercase letter</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.password.requireNumber}
                        onChange={(e) => updateSetting('password', 'requireNumber', e.target.checked)}
                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-700">Require number</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.password.requireSpecialChar}
                        onChange={(e) => updateSetting('password', 'requireSpecialChar', e.target.checked)}
                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-700">Require special character</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailEnabled}
                      onChange={(e) => updateSetting('notifications', 'emailEnabled', e.target.checked)}
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable email notifications</span>
                  </label>
                  {settings.notifications.emailEnabled && (
                    <div className="ml-6 space-y-2 border-l-2 border-gray-200 pl-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.applicationSubmitted}
                          onChange={(e) => updateSetting('notifications', 'applicationSubmitted', e.target.checked)}
                          className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <span className="text-sm text-gray-700">Application submitted</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.applicationApproved}
                          onChange={(e) => updateSetting('notifications', 'applicationApproved', e.target.checked)}
                          className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <span className="text-sm text-gray-700">Application approved</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.applicationRejected}
                          onChange={(e) => updateSetting('notifications', 'applicationRejected', e.target.checked)}
                          className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <span className="text-sm text-gray-700">Application rejected</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.statusChanged}
                          onChange={(e) => updateSetting('notifications', 'statusChanged', e.target.checked)}
                          className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <span className="text-sm text-gray-700">Status changed</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Settings */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Maintenance</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.maintenance.autoCleanupEnabled}
                      onChange={(e) => updateSetting('maintenance', 'autoCleanupEnabled', e.target.checked)}
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable automatic cleanup</span>
                  </label>
                  {settings.maintenance.autoCleanupEnabled && (
                    <div className="ml-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cleanup Interval (days)
                      </label>
                      <input
                        type="number"
                        min="7"
                        max="365"
                        value={settings.maintenance.cleanupIntervalDays}
                        onChange={(e) => updateSetting('maintenance', 'cleanupIntervalDays', parseInt(e.target.value) || 30)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Automatically remove old test data and expired sessions (7-365 days)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
        >
          {saving ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
