import React, { useState, useEffect } from 'react';
import { Users, Plus, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import UserTable from './components/UserTable';
import CustomFieldsModal from './components/CustomFieldsModal';
import { getUsers, getCustomFields } from '../../services/supabase';
import type { User, CustomField } from '../../types/user';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'banned';

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFieldsModalOpen, setIsFieldsModalOpen] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedUsers, fetchedFields] = await Promise.all([
        getUsers(),
        getCustomFields()
      ]);
      
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
      setCustomFields(fetchedFields);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((user) => {
        return (
          user.profile.toLowerCase().includes(term) ||
          user.user_id.toLowerCase().includes(term) ||
          user.whatsapp.toLowerCase().includes(term) ||
          user.country.toLowerCase().includes(term) ||
          Object.entries(user.custom_fields || {}).some(
            ([key, value]) => 
              key.toLowerCase().includes(term) || 
              (value && String(value).toLowerCase().includes(term))
          )
        );
      });
    }

    setFilteredUsers(filtered);
  }, [searchTerm, users, statusFilter]);

  const handleUserUpdated = (updatedUser: User) => {
    const updatedUsers = users.map((user) => 
      user.id === updatedUser.id ? updatedUser : user
    );
    
    setUsers(updatedUsers);
    setFilteredUsers(
      filteredUsers.map((user) => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter((user) => user.id !== userId);
    setUsers(updatedUsers);
    setFilteredUsers(filteredUsers.filter((user) => user.id !== userId));
    toast.success('Usuário removido com sucesso!');
  };

  const handleCustomFieldsUpdated = async () => {
    try {
      const updatedFields = await getCustomFields();
      setCustomFields(updatedFields);
      setIsFieldsModalOpen(false);
      toast.success('Campos personalizados atualizados com sucesso!');
    } catch (error) {
      console.error('Error updating custom fields:', error);
      toast.error('Erro ao atualizar campos. Por favor, tente novamente.');
    }
  };

  const getStatusCount = (status: StatusFilter) => {
    if (status === 'all') return users.length;
    return users.filter(user => user.status === status).length;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <Users className="w-6 h-6 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">Usuários Cadastrados</h1>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsFieldsModalOpen(true)}
              >
                Gerenciar Campos
              </Button>
            </div>
          </div>
          
          <div className="mb-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Pesquisar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Todos ({getStatusCount('all')})
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pendentes ({getStatusCount('pending')})
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('approved')}
              >
                Aprovados ({getStatusCount('approved')})
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('rejected')}
              >
                Reprovados ({getStatusCount('rejected')})
              </Button>
              <Button
                variant={statusFilter === 'banned' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('banned')}
              >
                Banidos ({getStatusCount('banned')})
              </Button>
            </div>
          </div>
          
          <UserTable 
            users={filteredUsers}
            loading={loading}
            customFields={customFields}
            onDelete={handleDeleteUser}
            onUserUpdated={handleUserUpdated}
          />
        </div>
      </main>
      
      <Footer />
      
      <CustomFieldsModal
        isOpen={isFieldsModalOpen}
        onClose={() => setIsFieldsModalOpen(false)}
        customFields={customFields}
        onFieldsUpdated={handleCustomFieldsUpdated}
      />
    </div>
  );
};

export default Dashboard;