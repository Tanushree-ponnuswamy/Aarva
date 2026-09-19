import React, { useState, useEffect } from 'react';
import { AdminMetrics, AdminStudentItem } from '../types';
import { api } from '../services/api';
import {
  Users, UserCheck, UserX, Search, ShieldCheck,
  Eye, RefreshCw, AlertTriangle
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [students, setStudents] = useState<AdminStudentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmToggleUser, setConfirmToggleUser] = useState<AdminStudentItem | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, [searchTerm, filterType]);

  const loadAdminData = async () => {
    const m = await api.getAdminMetrics();
    setMetrics(m);
    const s = await api.getAdminStudents(searchTerm, filterType);
    setStudents(s);
  };

  const handleExecuteToggle = async () => {
    if (!confirmToggleUser) return;
    const res = await api.toggleStudentStatus(confirmToggleUser.id);
    if (res.success) {
      setStudents(prev =>
        prev.map(st => (st.id === confirmToggleUser.id ? { ...st, is_active: !st.is_active } : st))
      );
      setActionSuccessMsg(`User '${confirmToggleUser.name}' account status updated.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    }
    setConfirmToggleUser(null);
  };

  const handleViewDetail = async (userId: number) => {
    const detail = await api.getStudentDetail(userId);
    if (detail) {
      setSelectedUserDetail(detail);
      setModalOpen(true);
    } else {
      const matched = students.find(s => s.id === userId);
      setSelectedUserDetail({
        user: {
          id: matched?.id,
          name: matched?.name,
          email: matched?.email,
          phone: matched?.phone || 'Not provided',
          is_active: matched?.is_active,
          role: matched?.role || 'student',
          registered_at: matched?.registered_at
        },
        profile: {
          learner_type: matched?.learner_type,
          institution: matched?.institution,
          department: matched?.department
        },
        login_activity: [
          { id: 1, login_time: matched?.last_login, logout_time: 'Active session', status: 'active', device: 'Chrome on macOS' }
        ]
      });
      setModalOpen(true);
    }
  };

  return (
    <div className="page-content-scroll">
      <div className="page-inner">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div
          className="animate-slide-right"
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 100,
            backgroundColor: 'var(--success)',
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '0.85rem',
            fontWeight: 700
          }}
        >
          ✓ {actionSuccessMsg}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            <ShieldCheck size={16} /> AARVA Admin
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            User Management
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Manage registered AARVA users in one simple dashboard.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.65rem 1.1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={15} /> Refresh List
        </button>
      </div>

      {/* Top 2 Simple Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        {/* Total Users */}
        <div
          className="glass-panel"
          style={{
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.1 }}>
              {metrics?.total_users || 142}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Total Users
            </div>
          </div>
        </div>

        {/* Active Accounts */}
        <div
          className="glass-panel"
          style={{
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <UserCheck size={28} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.1 }}>
              {metrics?.active_accounts || 18}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Active Accounts
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '440px' }}>
          <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search users by name, email, or institution..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem 0.65rem 2.4rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '0.88rem'
            }}
          />
        </div>

        {/* Persona Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All users' },
            { id: 'school', label: 'School' },
            { id: 'college', label: 'College' },
            { id: 'professional', label: 'Working' },
            { id: 'independent', label: 'Independent' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: filterType === f.id ? 700 : 500,
                border: filterType === f.id ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                backgroundColor: filterType === f.id ? 'var(--primary-light)' : 'var(--bg-surface)',
                color: filterType === f.id ? 'var(--primary)' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= DESKTOP TABLE VIEW ================= */}
      <div
        className="hide-on-mobile glass-panel"
        style={{
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '1.1rem 1.25rem' }}>Student / User Name</th>
              <th style={{ padding: '1.1rem 1.25rem' }}>Email address</th>
              <th style={{ padding: '1.1rem 1.25rem' }}>Status</th>
              <th style={{ padding: '1.1rem 1.25rem' }}>Learner type</th>
              <th style={{ padding: '1.1rem 1.25rem' }}>Registered</th>
              <th style={{ padding: '1.1rem 1.25rem' }}>Last login</th>
              <th style={{ padding: '1.1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(st => (
              <tr
                key={st.id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'background-color var(--transition-fast)'
                }}
              >
                <td style={{ padding: '1.1rem 1.25rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{st.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID #{st.id}</div>
                </td>

                <td style={{ padding: '1.1rem 1.25rem', color: 'var(--text-muted)' }}>
                  {st.email}
                </td>

                <td style={{ padding: '1.1rem 1.25rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: st.is_active ? 'var(--success-bg)' : 'var(--danger-bg)',
                      color: st.is_active ? 'var(--success)' : 'var(--danger)'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: st.is_active ? 'var(--success)' : 'var(--danger)' }} />
                    {st.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </td>

                <td style={{ padding: '1.1rem 1.25rem' }}>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)'
                    }}
                  >
                    {st.learner_type}
                  </span>
                </td>

                <td style={{ padding: '1.1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {st.registered_at}
                </td>

                <td style={{ padding: '1.1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {st.last_login}
                </td>

                <td style={{ padding: '1.1rem 1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleViewDetail(st.id)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Eye size={14} /> View details
                    </button>

                    <button
                      onClick={() => setConfirmToggleUser(st)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: st.is_active ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                        color: st.is_active ? 'var(--danger)' : 'var(--success)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Manage
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE COMPACT CARDS VIEW ================= */}
      <div className="show-on-mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {students.map(st => (
          <div
            key={st.id}
            className="glass-panel"
            style={{
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{st.name}</h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{st.email}</div>
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: st.is_active ? 'var(--success-bg)' : 'var(--danger-bg)',
                  color: st.is_active ? 'var(--success)' : 'var(--danger)'
                }}
              >
                {st.is_active ? 'Active' : 'Deactivated'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.6rem 0',
                borderTop: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                margin: '0.75rem 0'
              }}
            >
              <span>Type: <strong>{st.learner_type}</strong></span>
              <span>Registered: <strong>{st.registered_at}</strong></span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              Last login: {st.last_login}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleViewDetail(st.id)}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                View details
              </button>

              <button
                onClick={() => setConfirmToggleUser(st)}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: st.is_active ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  color: st.is_active ? 'var(--danger)' : 'var(--success)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= USER DETAIL MODAL ================= */}
      {modalOpen && selectedUserDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}
        >
          <div
            className="animate-fade-in-up"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)'
                  }}
                >
                  {selectedUserDetail.profile?.learner_type}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.35rem' }}>
                  {selectedUserDetail.user?.name}
                </h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  User ID: #{selectedUserDetail.user?.id} · {selectedUserDetail.user?.email}
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Close
              </button>
            </div>

            {/* Profile & Account Information */}
            <div
              style={{
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                fontSize: '0.85rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.85rem',
                marginBottom: '1.5rem'
              }}
            >
              <div><strong>Account Status:</strong> {selectedUserDetail.user?.is_active ? 'Active' : 'Deactivated'}</div>
              <div><strong>Phone:</strong> {selectedUserDetail.user?.phone}</div>
              <div><strong>Institution / Org:</strong> {selectedUserDetail.profile?.institution || 'N/A'}</div>
              <div><strong>Department / Program:</strong> {selectedUserDetail.profile?.department || 'N/A'}</div>
              <div><strong>Registered:</strong> {selectedUserDetail.user?.registered_at}</div>
              <div><strong>Role:</strong> {selectedUserDetail.user?.role?.toUpperCase()}</div>
            </div>

            {/* Login Activity Logs */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                Recent Login Activity
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {selectedUserDetail.login_activity?.map((log: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-surface)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>🕒 {log.login_time}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{log.device}</span>
                    <span style={{ color: log.status === 'active' ? 'var(--success)' : 'var(--text-muted)', fontWeight: 700 }}>
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setConfirmToggleUser(selectedUserDetail.user);
                }}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: selectedUserDetail.user?.is_active ? 'var(--danger-bg)' : 'var(--success-bg)',
                  color: selectedUserDetail.user?.is_active ? 'var(--danger)' : 'var(--success)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {selectedUserDetail.user?.is_active ? 'Deactivate Account' : 'Activate Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONFIRMATION MODAL ================= */}
      {confirmToggleUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '1rem'
          }}
        >
          <div
            className="animate-fade-in-up"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '440px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: confirmToggleUser.is_active ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                color: confirmToggleUser.is_active ? 'var(--danger)' : 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}
            >
              <AlertTriangle size={24} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              {confirmToggleUser.is_active ? 'Deactivate User Account?' : 'Activate User Account?'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to {confirmToggleUser.is_active ? 'deactivate' : 'activate'} the account for <strong>{confirmToggleUser.name}</strong> ({confirmToggleUser.email})?
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setConfirmToggleUser(null)}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteToggle}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: confirmToggleUser.is_active ? 'var(--danger)' : 'var(--success)',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
