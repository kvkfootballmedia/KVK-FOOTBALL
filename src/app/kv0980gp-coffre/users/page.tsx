'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabaseClient';
import { Profile, UserRole } from '@/types';
import { UserPlus, Shield, User, Edit2, Trash2, X, Copy } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function IdentityManagementPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { showNotification } = useNotification();
  const router = useRouter();

  // New User Form State
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    role: 'author' as UserRole,
  });

  // Edit User State
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Generated Password State
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Delete Confirmation State
  const [deleteData, setDeleteData] = useState<{ id: string; name: string } | null>(null);

  // Generate a random secure password
  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  useEffect(() => {
    const checkAuth = async () => {
      // ✅ FIX: Use Supabase session instead of localStorage
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/kv0980gp-coffre/login');
        return;
      }

      // Fetch profile to check role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        console.error('Profile error:', error);
        router.push('/kv0980gp-coffre/login');
        return;
      }

      if (profile.role !== 'admin') {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
        fetchUsers();
      }
    };
    checkAuth();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // ✅ FIX: manageUsers() gets the token internally, no need to pass it
      const response = await api.auth.manageUsers('list', {});
      // Fallback for mock if API not ready
      setUsers(response || [
        { id: '1', full_name: 'Admin Principal', email: 'admin@kvk.fr', role: 'admin' },
        { id: '2', full_name: 'Marc Terrain', email: 'marc@kvk.fr', role: 'editor' },
        { id: '3', full_name: 'Sophie Chiffre', email: 'sophie@kvk.fr', role: 'author' },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a random password
    const password = generatePassword();
    
    try {
      // Include password in the request
      await api.auth.manageUsers('create', {
        ...newUser,
        password
      });
      
      // Store password to show to admin
      setGeneratedPassword(password);
      setShowPasswordModal(true);
      setShowAddModal(false);
      showNotification('Nouveau profil créé avec succès !', 'success');
      
      // Reset form
      setNewUser({
        email: '',
        full_name: '',
        role: 'author' as UserRole,
      });
      
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      showNotification('Erreur lors de la création: ' + err.message, 'error');
    }
  };

  const handleEditUser = (user: Profile) => {
    setEditUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      // Update role in profiles table directly
      const { error } = await supabase
        .from('profiles')
        .update({ role: editUser.role, full_name: editUser.full_name })
        .eq('id', editUser.id);

      if (error) throw error;

      showNotification('Mise à jour effectuée.', 'success');
      setShowEditModal(false);
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      showNotification('Erreur lors de la mise à jour: ' + err.message, 'error');
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setDeleteData({ id: userId, name: userName });
  };

  const confirmDelete = async () => {
    if (!deleteData) return;

    try {
      // Delete from profiles table (cascade will handle related data)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deleteData.id);

      if (error) throw error;

      showNotification('Compte collaborateur supprimé.', 'success');
      setDeleteData(null);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      showNotification('Erreur lors de la suppression: ' + err.message, 'error');
    }
  };

  if (!isAdmin) {
    return (
      <div className="py-24 text-center">
        <Shield className="w-16 h-16 mx-auto mb-6 text-primary opacity-20" />
        <h1 className="text-3xl font-black uppercase tracking-tighter">Accès Restreint</h1>
        <p className="mt-4 text-gray-400 font-serif italic">Seuls les administrateurs peuvent gérer les identités.</p>
        <button onClick={() => router.push('/kv0980gp-coffre')} className="mt-8 text-xs font-black uppercase tracking-widest border-b-2 border-primary">Retour au Dashboard</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 border-b-4 border-gray-900 pb-8 gap-6">
        <div>
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary">Contrôle d'Accès</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">Gestion des Identités</h1>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto bg-gray-900 text-white px-6 md:px-8 py-4 md:py-4 font-black uppercase tracking-widest text-[10px] md:text-[11px] hover:bg-primary transition-all shadow-xl flex items-center justify-center gap-3"
        >
          <UserPlus className="w-4 h-4" /> Recruter un collaborateur
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-2xl rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px] md:min-w-0">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <th className="px-4 md:px-8 py-4 md:py-6">Profil</th>
                <th className="px-4 md:px-8 py-4 md:py-6">Rôle</th>
                <th className="px-4 md:px-8 py-4 md:py-6">Email</th>
                <th className="px-4 md:px-8 py-4 md:py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 md:px-8 py-4 md:py-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-black text-[10px] md:text-xs uppercase">
                        {(u.full_name || u.email || 'U').charAt(0)}
                      </div>
                      <span className="font-black text-sm md:text-lg tracking-tight uppercase italic truncate max-w-[120px] md:max-w-none">{u.full_name || u.email || 'Unknown User'}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-6">
                    <span className={`px-2.5 md:px-4 py-1.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 w-fit ${
                      u.role === 'admin' ? 'bg-black text-white' : 
                      u.role === 'editor' ? 'bg-primary text-white shadow-[0_4px_15px_rgba(196,18,46,0.3)]' : 
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {u.role === 'admin' && <Shield className="w-3 h-3" />}
                      {u.role === 'editor' && <Edit2 className="w-3 h-3" />}
                      {u.role === 'author' && <User className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-6 font-mono text-[10px] text-gray-400 truncate max-w-[120px] md:max-w-none">{u.email}</td>
                  <td className="px-4 md:px-8 py-4 md:py-6 text-right">
                    <div className="flex justify-end gap-1 md:gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditUser(u)}
                        className="p-2 text-gray-400 hover:text-gray-900 transition-colors border border-gray-50 md:border-transparent hover:border-gray-100 rounded-full"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.full_name || u.email || '')}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors border border-gray-50 md:border-transparent hover:border-red-100 rounded-full"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg shadow-2xl rounded-sm p-6 md:p-12 relative animate-in fade-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 md:top-8 md:right-8 text-gray-400 hover:text-black">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic mb-8 border-b-2 border-gray-900 pb-4">Nouveau Profil</h2>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nom Complet</label>
                <input required value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} className="w-full p-4 bg-gray-50 border-none outline-none focus:ring-2 ring-primary transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Professionnel</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full p-4 bg-gray-50 border-none outline-none focus:ring-2 ring-primary transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rôle Assigné</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full p-4 bg-gray-50 border-none outline-none focus:ring-2 ring-primary transition-all font-bold appearance-none">
                  <option value="author">Auteur (rédacteur)</option>
                  <option value="editor">Éditeur (responsable de rubrique)</option>
                  <option value="admin">Administrateur (contrôle total)</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 md:py-5 bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-primary transition-all shadow-xl mt-4">
                Enregistrer le collaborateur
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editUser && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg shadow-2xl rounded-sm p-6 md:p-12 relative animate-in fade-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <button onClick={() => { setShowEditModal(false); setEditUser(null); }} className="absolute top-6 right-6 md:top-8 md:right-8 text-gray-400 hover:text-black">
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-8 border-b-4 border-gray-900 pb-4 inline-block">
              Modifier
            </h2>

            <form onSubmit={handleUpdateUser} className="space-y-8 mt-10">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">
                  Email (non modifiable)
                </label>
                <input
                  type="email"
                  value={editUser.email || ''}
                  disabled
                  className="w-full px-6 py-4 bg-gray-100 border-2 border-transparent text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={editUser.full_name || ''}
                  onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-gray-900 transition-all outline-none font-bold"
                  placeholder="ex: Marc Terrain"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">
                  Rôle
                </label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value as UserRole })}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-gray-900 transition-all outline-none font-bold"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Éditeur</option>
                  <option value="author">Auteur</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 md:py-5 bg-gray-900 text-white font-black uppercase tracking-[0.3em] text-[10px] md:text-xs hover:bg-black transition-all shadow-xl"
              >
                Mettre à jour
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password Display Modal */}
      {showPasswordModal && generatedPassword && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg shadow-2xl rounded-sm p-12 relative animate-in fade-in zoom-in duration-300">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 border-b-4 border-green-600 pb-4 inline-block">
              ✅ Utilisateur Créé
            </h2>

            <div className="mt-8 space-y-6">
              <p className="text-gray-600 font-bold">
                Le collaborateur a été créé avec succès. Voici son mot de passe temporaire :
              </p>

              <div className="bg-gray-50 border-2 border-gray-900 p-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                  Mot de passe généré
                </label>
                <div className="flex items-center gap-4">
                  <code className="flex-1 text-2xl font-mono font-black text-gray-900 select-all">
                    {generatedPassword}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassword);
                      showNotification('Mot de passe copié !', 'info');
                    }}
                    className="px-6 py-3 bg-gray-900 text-white font-black uppercase text-xs hover:bg-black transition-all flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copier
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-400 p-4">
                <p className="text-xs font-bold text-yellow-800">
                  ⚠️ <strong>Important :</strong> Communiquez ce mot de passe au collaborateur de manière sécurisée. 
                  Il devra le changer lors de sa première connexion.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowPasswordModal(false);
                setGeneratedPassword(null);
              }}
              className="w-full mt-8 py-5 bg-gray-900 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-black transition-all shadow-xl"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Reusable Confirm Modal */}
      <ConfirmModal 
        isOpen={!!deleteData}
        title="Désactivation"
        message={`Voulez-vous vraiment retirer l'accès à ${deleteData?.name} ? Cette action est irréversible.`}
        confirmLabel="Révoquer l'accès"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteData(null)}
      />
    </div>
  );
}
