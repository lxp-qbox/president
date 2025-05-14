import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Link as LinkIcon, MessageCircle } from 'lucide-react';
import Button from '../../../components/UI/Button';
import StatusModal from './StatusModal';
import type { User, CustomField } from '../../../types/user';
import { updateUser, getUser } from '../../../services/supabase';
import { toast } from 'react-hot-toast';

interface UserTableProps {
  users: User[];
  loading: boolean;
  customFields: CustomField[];
  onDelete: (userId: string) => void;
  onUserUpdated: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  customFields,
  onDelete,
  onUserUpdated,
}) => {
  const [sortField, setSortField] = useState<keyof User>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  
  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleStatusChange = async (user: User, newStatus: User['status']) => {
    if (!user?.id) {
      toast.error('ID do usuário inválido.');
      return;
    }

    setLoadingStatus(user.id.toString());
    try {
      const updatedUser = await updateUser(user.id, { 
        status: newStatus,
        approval_date: newStatus === 'approved' ? new Date().toISOString() : null
      });
      
      if (updatedUser) {
        onUserUpdated(updatedUser);
        toast.success('Status atualizado com sucesso!');
        setIsStatusModalOpen(false);
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erro ao atualizar status. Tente novamente mais tarde.'
      );
    } finally {
      setLoadingStatus(null);
    }
  };

  const formatWhatsAppNumber = (number: string) => {
    return number.replace(/\D/g, '');
  };
  
  const openWhatsApp = (whatsapp: string) => {
    const formattedNumber = formatWhatsAppNumber(whatsapp);
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  };
  
  const sortedUsers = [...users].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'custom_fields' && customFields.length > 0) {
      const firstCustomField = customFields[0].name;
      aValue = a.custom_fields?.[firstCustomField] || '';
      bValue = b.custom_fields?.[firstCustomField] || '';
    }
    
    if (aValue === bValue) return 0;
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });
  
  const confirmDelete = (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      onDelete(userId);
    }
  };
  
  const renderSortIcon = (field: keyof User) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 inline-block ml-1" /> 
      : <ChevronDown className="w-4 h-4 inline-block ml-1" />;
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'banned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: User['status']) => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Reprovado';
      case 'banned':
        return 'Banido';
      default:
        return 'Pendente';
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow">
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-gray-500 mb-4">Nenhum usuário encontrado.</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('profile')}
              >
                <div className="flex items-center">
                  Perfil {renderSortIcon('profile')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('user_id')}
              >
                <div className="flex items-center">
                  ID {renderSortIcon('user_id')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('whatsapp')}
              >
                <div className="flex items-center">
                  WhatsApp {renderSortIcon('whatsapp')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('country')}
              >
                <div className="flex items-center">
                  País {renderSortIcon('country')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('url')}
              >
                <div className="flex items-center">
                  URL {renderSortIcon('url')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('is_admin')}
              >
                <div className="flex items-center">
                  Admin {renderSortIcon('is_admin')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status {renderSortIcon('status')}
                </div>
              </th>
              
              {customFields.map((field) => (
                <th 
                  key={field.id}
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {field.name}
                </th>
              ))}
              
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.profile}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{user.user_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => openWhatsApp(user.whatsapp)}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">{user.whatsapp}</span>
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{user.country}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.url ? (
                    <a
                      href={user.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <LinkIcon className="w-4 h-4 mr-1" />
                      <span className="text-sm">Link</span>
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.is_admin ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setIsStatusModalOpen(true);
                    }}
                    disabled={loadingStatus === user.id.toString()}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 ${getStatusColor(user.status)}`}
                  >
                    {loadingStatus === user.id.toString() ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Atualizando...
                      </span>
                    ) : (
                      getStatusText(user.status)
                    )}
                  </button>
                </td>
                
                {customFields.map((field) => (
                  <td key={field.id} className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {field.type === 'boolean' 
                        ? (user.custom_fields?.[field.name] ? 'Sim' : 'Não')
                        : (user.custom_fields?.[field.name] || '-')}
                    </div>
                  </td>
                ))}
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    onClick={() => confirmDelete(user.id.toString())}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <StatusModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          user={selectedUser}
          onStatusChange={(status) => handleStatusChange(selectedUser, status)}
        />
      )}
    </>
  );
};

export default UserTable;