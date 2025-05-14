import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '../../../components/UI/Modal';
import Input from '../../../components/UI/Input';
import Button from '../../../components/UI/Button';
import Select from '../../../components/UI/Select';
import { updateUser, deleteUser, getUser } from '../../../services/supabase';
import type { User, CustomField } from '../../../types/user';
import { countries } from '../../../utils/countries';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  customFields: CustomField[];
  onUserUpdated: (user: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  customFields,
  onUserUpdated,
}) => {
  const [formData, setFormData] = useState<User>({
    ...user,
    custom_fields: user.custom_fields || {},
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === 'is_admin') {
      setFormData({
        ...formData,
        is_admin: (e.target as HTMLInputElement).checked,
      });
    } else if (customFields.some(field => field.name === name)) {
      setFormData({
        ...formData,
        custom_fields: {
          ...formData.custom_fields,
          [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (!formData.profile || !formData.whatsapp || !formData.country) {
        toast.error('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }

      if (formData.url && !validateUrl(formData.url)) {
        toast.error('Por favor, insira uma URL válida.');
        setLoading(false);
        return;
      }

      // Verify if user still exists before updating
      try {
        await getUser(user.id);
      } catch (error) {
        toast.error('Usuário não encontrado. A página será atualizada.');
        onClose();
        window.location.reload();
        return;
      }

      const updateData = { ...formData };
      delete updateData.user_id;

      const updatedUser = await updateUser(user.id, updateData);
      
      if (!updatedUser) {
        throw new Error('Não foi possível atualizar o usuário. Por favor, tente novamente.');
      }

      onUserUpdated(updatedUser);
      toast.success('Usuário atualizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar usuário. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setLoading(true);
      try {
        await deleteUser(user.id);
        onClose();
        toast.success('Usuário removido com sucesso!');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Erro ao remover usuário. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const modalFooter = (
    <div className="flex justify-between">
      <Button
        variant="danger"
        onClick={handleDelete}
        disabled={loading}
      >
        Excluir Usuário
      </Button>
      <div className="space-x-2">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={loading}
        >
          Salvar
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Usuário"
      footer={modalFooter}
      size="lg"
    >
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="PERFIL"
            name="profile"
            value={formData.profile}
            onChange={handleChange}
            placeholder="Nome ou apelido do usuário"
            required
          />
          
          <Input
            label="ID"
            name="user_id"
            value={formData.user_id}
            disabled
            className="bg-gray-100"
            required
          />
          
          <Input
            label="WHATSAPP"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="Ex: +55 (19) 99999-9999"
            required
          />
          
          <Select
            label="PAÍS"
            name="country"
            value={formData.country}
            onChange={handleChange}
            options={countries.map(country => ({
              value: country.name,
              label: `${country.emoji} ${country.name}`
            }))}
            required
          />

          <Input
            label="URL"
            name="url"
            type="url"
            value={formData.url || ''}
            onChange={handleChange}
            placeholder="Ex: https://exemplo.com"
            className="sm:col-span-2"
          />
          
          <div className="sm:col-span-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_admin"
                checked={formData.is_admin}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">ADMIN</span>
            </label>
          </div>
        </div>
        
        {customFields.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Campos Adicionais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customFields.map((field) => (
                <div key={field.id}>
                  {field.type === 'boolean' ? (
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name={field.name}
                        checked={!!formData.custom_fields?.[field.name]}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">{field.name}</span>
                    </label>
                  ) : field.type === 'select' && field.options ? (
                    <Select
                      label={field.name}
                      name={field.name}
                      value={formData.custom_fields?.[field.name] as string || ''}
                      onChange={handleChange}
                      options={field.options.map(opt => ({ value: opt, label: opt }))}
                    />
                  ) : (
                    <Input
                      label={field.name}
                      name={field.name}
                      type={field.type}
                      value={formData.custom_fields?.[field.name] as string || ''}
                      onChange={handleChange}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default EditUserModal;