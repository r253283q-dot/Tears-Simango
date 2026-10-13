import React, { useState } from 'react';
import { storage } from './services/storage';
import { Company, UserProfile, FeedbackItem, AuditLogItem } from './types';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, CustomerPage, AdminPage } from './components/layout/Sidebar';
import { Toast, ToastMessage } from './components/common/Toast';
import { WelcomeGateway } from './components/auth/WelcomeGateway';
import { EmptyState } from './components/common/EmptyState';

// Customer Section Components
import { RegistrationSection } from './components/customer/RegistrationSection';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { AnalyseSection } from './components/customer/AnalyseSection';
import { InsightsSection } from './components/customer/InsightsSection';
import { TrendsSection } from './components/customer/TrendsSection';
import { ReportsSection } from './components/customer/ReportsSection';
import { AccountSection } from './components/customer/AccountSection';

// Admin Section Components
import { AdminCompaniesSection } from './components/admin/AdminCompaniesSection';
import { AdminUsersSection } from './components/admin/AdminUsersSection';
import { AdminSystemOverview } from './components/admin/AdminSystemOverview';

export default function App() {
  // Persistence and entity states
  const [companies, setCompanies] = useState<Company[]>(() => storage.getCompanies());
  const [activeCompany, setActiveCompany] = useState<Company | null>(() => storage.getActiveCompany());
  const [users, setUsers] = useState<UserProfile[]>(() => storage.getUsers());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => storage.getCurrentUser());
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(() => 
    activeCompany ? storage.getFeedbackByCompany(activeCompany.id) : []
  );
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>(() => storage.getAllFeedback());
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => storage.getAuditLogs());

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => storage.isUserAuthenticated());

  // Portal and navigation state
  const [currentPortal, setCurrentPortal] = useState<'customer' | 'admin'>(() => storage.getCurrentPortal());
  const [customerPage, setCustomerPage] = useState<CustomerPage>('Dashboard');
  const [adminPage, setAdminPage] = useState<AdminPage>('Companies');

  // Toast notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: `toast-${Date.now()}`,
      type,
      text
    });
  };

  const refreshData = () => {
    const updatedCompanies = storage.getCompanies();
    setCompanies(updatedCompanies);
    const currentActiveComp = storage.getActiveCompany();
    setActiveCompany(currentActiveComp);
    setFeedbackList(currentActiveComp ? storage.getFeedbackByCompany(currentActiveComp.id) : []);
    setAllFeedback(storage.getAllFeedback());
    setUsers(storage.getUsers());
    setCurrentUser(storage.getCurrentUser());
    setAuditLogs(storage.getAuditLogs());
    setIsAuthenticated(storage.isUserAuthenticated());
  };

  const handlePortalChange = (portal: 'customer' | 'admin') => {
    if (portal === 'admin' && currentUser?.role !== 'Admin') {
      showToast('Admin Portal is restricted to platform administrators.', 'error');
      return;
    }
    storage.setCurrentPortal(portal);
    setCurrentPortal(portal);
  };

  // Gateway Company Login handler -> directs to company Dashboard
  const handleCompanyLogin = (identifier: string, pass: string) => {
    const res = storage.login(identifier, pass);
    if (res.success) {
      refreshData();
      setIsAuthenticated(true);
      if (res.user?.role === 'Admin') {
        setCurrentPortal('admin');
        setAdminPage('Companies');
      } else {
        setCurrentPortal('customer');
        setCustomerPage('Dashboard');
      }
    }
    return res;
  };

  // Gateway Company Register handler -> registers, signs in, directs to Dashboard
  const handleCompanyRegister = (data: {
    name: string;
    sector: string;
    email: string;
    username: string;
    password: string;
    phone: string;
    city: string;
    adminName: string;
  }) => {
    storage.registerCompanyAndAdmin(data);
    refreshData();
    setIsAuthenticated(true);
    setCurrentPortal('customer');
    setCustomerPage('Dashboard');
  };

  // Gateway Admin Login handler -> directs to Admin Section (Companies & System Overview)
  const handleAdminLogin = (username: string, pass: string) => {
    const res = storage.login(username, pass);
    if (res.success && res.user?.role === 'Admin') {
      refreshData();
      setIsAuthenticated(true);
      setCurrentPortal('admin');
      setAdminPage('Companies');
      return { success: true };
    } else if (res.success && res.user?.role !== 'Admin') {
      return { success: false, error: 'Access restricted: account does not have administrator privileges.' };
    }
    return res;
  };

  // Logout handler -> returns to Welcome / Gateway page
  const handleLogout = () => {
    storage.logout();
    refreshData();
    setIsAuthenticated(false);
    setCurrentPortal('customer');
    setCustomerPage('Dashboard');
    showToast('Signed out successfully.', 'info');
  };

  // Admin and Portal Deletions
  const handleDeleteCompany = (id: string) => {
    storage.deleteCompany(id);
    refreshData();
  };

  const handleDeleteUser = (id: string) => {
    storage.deleteUser(id);
    refreshData();
  };

  // Feedback mutations
  const handleAddSingleFeedback = (text: string, channel: any, customerIdentifier?: string) => {
    if (!activeCompany) return;
    storage.addFeedbackItem(activeCompany.id, text, channel, customerIdentifier);
    refreshData();
  };

  const handleAddBatchFeedback = (items: any[]) => {
    if (!activeCompany) return;
    storage.addBatchFeedback(activeCompany.id, items);
    refreshData();
  };

  const handleDeleteFeedback = (id: string) => {
    storage.deleteFeedbackItem(id);
    refreshData();
  };

  const handleUpdateFeedbackStatus = (id: string, status: any) => {
    storage.updateFeedbackStatus(id, status);
    refreshData();
  };

  const handleAddCompany = (comp: any) => {
    storage.addCompany(comp);
    refreshData();
  };

  const handleUpdateCompany = (comp: Company) => {
    storage.updateCompany(comp);
    refreshData();
  };

  const handleAddUser = (user: any) => {
    storage.addUser(user);
    refreshData();
  };

  const isCompanyAuthenticated = isAuthenticated && activeCompany !== null;
  const isAdminAuthenticated = isAuthenticated && currentUser?.role === 'Admin';
  const unreadCount = feedbackList.filter(f => f.responseRequired && f.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Navbar
        currentPortal={currentPortal}
        onPortalChange={handlePortalChange}
        activeCompany={activeCompany}
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onNavigateToAuth={handleLogout}
      />

      {/* Main Container */}
      {!isAuthenticated ? (
        /* FIRST PAGE: Welcome User, Ask if Admin or Registered Company / Register */
        <div className="flex-1 flex flex-col justify-center py-6">
          <WelcomeGateway
            initialStage="select"
            onCompanyLogin={handleCompanyLogin}
            onCompanyRegister={handleCompanyRegister}
            onAdminLogin={handleAdminLogin}
            onShowToast={showToast}
          />
        </div>
      ) : (
        /* AUTHENTICATED WORKSPACE */
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Sidebar Navigation */}
          <Sidebar
            currentPortal={currentPortal}
            customerPage={customerPage}
            adminPage={adminPage}
            onCustomerPageChange={setCustomerPage}
            onAdminPageChange={setAdminPage}
            unreadCount={unreadCount}
            isAuthenticated={isCompanyAuthenticated}
            isAdminAuthenticated={isAdminAuthenticated}
          />

          {/* Dynamic Main Workspace Body */}
          <main className="flex-1 p-6 lg:p-8 min-w-0 overflow-y-auto">
            {currentPortal === 'customer' ? (
              <>
                {/* 1. Registration */}
                {customerPage === 'Registration' && (
                  <RegistrationSection
                    onRegisterCompany={(data) => {
                      handleCompanyRegister(data);
                    }}
                    onNavigateToDashboard={() => setCustomerPage('Dashboard')}
                    onShowToast={showToast}
                  />
                )}

                {/* 2. Dashboard with Graphs */}
                {customerPage === 'Dashboard' && (
                  <CustomerDashboard
                    company={activeCompany}
                    feedbackList={feedbackList}
                    onNavigateToAnalyse={() => setCustomerPage('Analyse')}
                    onNavigateToRegistration={() => setCustomerPage('Registration')}
                    onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
                  />
                )}

                {/* 2. Analyse */}
                {customerPage === 'Analyse' && (
                  activeCompany ? (
                    <AnalyseSection
                      company={activeCompany}
                      feedbackList={feedbackList}
                      onAddSingleFeedback={handleAddSingleFeedback}
                      onAddBatchFeedback={handleAddBatchFeedback}
                      onDeleteFeedback={handleDeleteFeedback}
                      onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
                      onShowToast={showToast}
                    />
                  ) : (
                    <div className="py-8">
                      <EmptyState
                        title="No Company Workspace Selected"
                        description="Please register your business entity to begin analysing customer feedback."
                        actionLabel="Register Business"
                        onAction={() => setCustomerPage('Registration')}
                      />
                    </div>
                  )
                )}

                {/* 3. Insights (No graphs on Insights) */}
                {customerPage === 'Insights' && (
                  activeCompany ? (
                    <InsightsSection
                      company={activeCompany}
                      feedbackList={feedbackList}
                      onNavigateToAnalyse={() => setCustomerPage('Analyse')}
                      onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
                      onShowToast={showToast}
                    />
                  ) : (
                    <div className="py-8">
                      <EmptyState
                        title="No Company Workspace Selected"
                        description="Please register your business entity to view sentiment insights."
                        actionLabel="Register Business"
                        onAction={() => setCustomerPage('Registration')}
                      />
                    </div>
                  )
                )}

                {/* 4. Trends */}
                {customerPage === 'Trends' && (
                  activeCompany ? (
                    <TrendsSection
                      company={activeCompany}
                      feedbackList={feedbackList}
                      onNavigateToAnalyse={() => setCustomerPage('Analyse')}
                    />
                  ) : (
                    <div className="py-8">
                      <EmptyState
                        title="No Company Workspace Selected"
                        description="Please register your business entity to view trends."
                        actionLabel="Register Business"
                        onAction={() => setCustomerPage('Registration')}
                      />
                    </div>
                  )
                )}

                {/* 5. Reports */}
                {customerPage === 'Reports' && (
                  activeCompany ? (
                    <ReportsSection
                      company={activeCompany}
                      feedbackList={feedbackList}
                      onNavigateToAnalyse={() => setCustomerPage('Analyse')}
                      onShowToast={showToast}
                    />
                  ) : (
                    <div className="py-8">
                      <EmptyState
                        title="No Company Workspace Selected"
                        description="Please register your business entity to generate reports."
                        actionLabel="Register Business"
                        onAction={() => setCustomerPage('Registration')}
                      />
                    </div>
                  )
                )}

                {/* 6. Account */}
                {customerPage === 'Account' && (
                  activeCompany ? (
                    <AccountSection
                      company={activeCompany}
                      users={users}
                      onUpdateCompany={handleUpdateCompany}
                      onShowToast={showToast}
                    />
                  ) : (
                    <div className="py-8">
                      <EmptyState
                        title="No Company Workspace Selected"
                        description="Please register your business entity to view account settings."
                        actionLabel="Register Business"
                        onAction={() => setCustomerPage('Registration')}
                      />
                    </div>
                  )
                )}
              </>
            ) : (
              <>
                {/* Admin Section: Companies with View Dashboard & Delete */}
                {adminPage === 'Companies' && (
                  <AdminCompaniesSection
                    companies={companies}
                    allFeedback={allFeedback}
                    onDeleteCompany={handleDeleteCompany}
                    onAddCompany={handleAddCompany}
                    onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
                    onShowToast={showToast}
                  />
                )}

                {/* Admin Section: User Accounts with Delete */}
                {adminPage === 'User Accounts' && (
                  <AdminUsersSection
                    users={users}
                    companies={companies}
                    onDeleteUser={handleDeleteUser}
                    onAddUser={handleAddUser}
                    onShowToast={showToast}
                  />
                )}

                {/* Admin Section: System Overview */}
                {adminPage === 'System Overview' && (
                  <AdminSystemOverview
                    companies={companies}
                    users={users}
                    allFeedback={allFeedback}
                    auditLogs={auditLogs}
                  />
                )}
              </>
            )}
          </main>
        </div>
      )}

      {/* Global Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
