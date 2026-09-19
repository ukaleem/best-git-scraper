import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { UserProfile, VerificationStatus } from '../types';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Trash2,
  X,
  AlertTriangle,
  UserCheck,
  Building,
  Mail,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface AdminCRMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCAL_STORAGE_USERS_KEY = 'reporadar_registered_users_store';

export const AdminCRMModal: React.FC<AdminCRMModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Helper to sync local store
  const getStoredUsers = (): UserProfile[] => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveStoredUsers = (list: UserProfile[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!isOpen || !isAdmin) return;

    setLoading(true);
    let firestoreUsers: UserProfile[] = [];
    const localUsers = getStoredUsers();

    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        firestoreUsers = [];
        snapshot.forEach((docSnap) => {
          firestoreUsers.push(docSnap.data() as UserProfile);
        });

        // Merge firestore users with local users deduplicated by email
        const mergedMap = new Map<string, UserProfile>();
        localUsers.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));
        firestoreUsers.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));

        setUsers(Array.from(mergedMap.values()));
        setLoading(false);
      },
      (err) => {
        console.warn('Note reading users from Firestore:', err.message);
        // If firestore rules or offline, fallback to local registered users
        setUsers(localUsers);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, isAdmin]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (targetUid: string, status: VerificationStatus) => {
    setActionLoadingId(targetUid);
    try {
      const userRef = doc(db, 'users', targetUid);
      await updateDoc(userRef, {
        verificationStatus: status,
        isVerified: status === 'approved',
        updatedAt: new Date().toISOString(),
        approvedBy: userProfile?.email || 'admin'
      });
    } catch (err) {
      console.warn('Firestore update failed, updating local store:', err);
    }

    // Always update in state and local storage
    const updatedUsers = users.map((u) => {
      if (u.uid === targetUid || u.email === targetUid) {
        return {
          ...u,
          verificationStatus: status,
          isVerified: status === 'approved',
          updatedAt: new Date().toISOString(),
          approvedBy: userProfile?.email || 'admin'
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
    setActionLoadingId(null);
  };

  const handleToggleRole = async (targetUid: string, currentRole: string) => {
    setActionLoadingId(targetUid);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const userRef = doc(db, 'users', targetUid);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firestore update failed, updating local store:', err);
    }

    const updatedUsers = users.map((u) => {
      if (u.uid === targetUid || u.email === targetUid) {
        return {
          ...u,
          role: newRole as 'admin' | 'user',
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
    setActionLoadingId(null);
  };

  const handleDeleteUser = async (targetUid: string) => {
    if (!window.confirm('Are you sure you want to remove this user from the CRM registry?')) return;
    setActionLoadingId(targetUid);
    try {
      await deleteDoc(doc(db, 'users', targetUid));
    } catch (err) {
      console.warn('Firestore delete failed, removing locally:', err);
    }

    const updatedUsers = users.filter((u) => u.uid !== targetUid && u.email !== targetUid);
    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
    setActionLoadingId(null);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && u.verificationStatus === filterStatus;
  });

  const pendingCount = users.filter((u) => u.verificationStatus === 'pending').length;
  const approvedCount = users.filter((u) => u.verificationStatus === 'approved').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="admin-crm-modal"
        className="relative w-full max-w-5xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Bar Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100">Admin CRM & Verification Hub</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  CRM Live
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Manage registered users, review verification approvals, and grant repository permissions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 md:px-6 bg-neutral-950/30 border-b border-neutral-800/80 text-xs">
          <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl">
            <div className="text-neutral-400 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-neutral-400" />
              Total Registered
            </div>
            <div className="text-xl font-bold text-neutral-100">{users.length}</div>
          </div>

          <div className="p-3 bg-neutral-900/60 border border-amber-900/30 rounded-xl">
            <div className="text-amber-400 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Pending Verification
            </div>
            <div className="text-xl font-bold text-amber-300">{pendingCount}</div>
          </div>

          <div className="p-3 bg-neutral-900/60 border border-emerald-900/30 rounded-xl">
            <div className="text-emerald-400 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Users
            </div>
            <div className="text-xl font-bold text-emerald-300">{approvedCount}</div>
          </div>

          <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl">
            <div className="text-neutral-400 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Active Admin
            </div>
            <div className="text-sm font-semibold text-neutral-200 truncate" title={userProfile?.email}>
              {userProfile?.email || 'admin'}
            </div>
          </div>
        </div>

        {/* Controls: Search & Filters */}
        <div className="p-4 md:px-6 border-b border-neutral-800/80 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
            <input
              id="admin-search-users"
              type="text"
              placeholder="Search user by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap cursor-pointer ${
                  filterStatus === status
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* CRM User Table */}
        <div className="flex-1 overflow-y-auto p-4 md:px-6">
          {loading ? (
            <div className="py-16 text-center text-neutral-500 text-sm">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading registered CRM users from database...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <div className="text-sm font-medium text-neutral-300">No users match your criteria</div>
              <div className="text-xs text-neutral-500 mt-1">
                New user registrations will automatically synchronize in real time.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((u) => {
                const isActionLoading = actionLoadingId === u.uid;
                const isCurrentAccount = u.uid === userProfile?.uid || u.email === userProfile?.email;

                return (
                  <div
                    key={u.uid || u.email}
                    className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* User Details */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-300 shrink-0">
                        {(u.displayName || u.email || 'U')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-neutral-100 text-sm truncate">
                            {u.displayName || 'No Name Provided'}
                          </span>
                          {isCurrentAccount && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300 border border-neutral-700">
                              You
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              u.role === 'admin'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                            }`}
                          >
                            {u.role.toUpperCase()}
                          </span>

                          {/* Verification Badge */}
                          {u.verificationStatus === 'approved' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Verified
                            </span>
                          ) : u.verificationStatus === 'pending' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Pending Verification
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Rejected
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-neutral-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-neutral-300">
                            <Mail className="w-3 h-3 text-neutral-500" />
                            {u.email}
                          </span>
                          <span className="flex items-center gap-1 text-neutral-500">
                            <Calendar className="w-3 h-3" />
                            Registered: {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                          {u.approvedBy && (
                            <span className="text-[11px] text-neutral-500">
                              By: {u.approvedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Approve, Reject, Make Admin */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      {u.verificationStatus !== 'approved' && (
                        <button
                          disabled={isActionLoading}
                          onClick={() => handleUpdateStatus(u.uid, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Verify and approve this user"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verify & Approve
                        </button>
                      )}

                      {u.verificationStatus !== 'rejected' && (
                        <button
                          disabled={isActionLoading}
                          onClick={() => handleUpdateStatus(u.uid, 'rejected')}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-300 border border-neutral-700 hover:border-rose-800/60 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Reject user verification"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      )}

                      <button
                        disabled={isActionLoading || isCurrentAccount}
                        onClick={() => handleToggleRole(u.uid, u.role)}
                        className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium border border-neutral-700 transition-colors cursor-pointer"
                        title="Toggle Admin role"
                      >
                        {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </button>

                      {!isCurrentAccount && (
                        <button
                          disabled={isActionLoading}
                          onClick={() => handleDeleteUser(u.uid)}
                          className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                          title="Delete user record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3.5 px-6 border-t border-neutral-800/80 bg-neutral-950/80 text-[11px] text-neutral-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Admin CRM Real-time Sync Active</span>
          </div>
          <span className="text-neutral-500">
            Registered users appear automatically upon signing up.
          </span>
        </div>
      </div>
    </div>
  );
};
