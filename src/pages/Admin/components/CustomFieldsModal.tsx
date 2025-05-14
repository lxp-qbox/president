import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Modal from '../../../components/UI/Modal';
import Input from '../../../components/UI/Input';
import Button from '../../../components/UI/Button';
import Select from '../../../components/UI/Select';
import { createCustomField, updateCustomField, deleteCustomField } from '../../../services/supabase';
import type { CustomField } from '../../../types/user';

interface CustomFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customFields: CustomField[];
  onFieldsUpdated: () => void;
}

const CustomFieldsModal: React.FC<CustomFieldsModalProps> = ({
  isOpen,
  onClose,
  customFields,
  onFieldsUpdated,
}) => {
  const [fields, setFields] = useState<CustomField[]>(customFields);
  const [newField, setNewField] = useState<Omit<CustomField, 'id'>>({
    name: '',
    type: 'text',
    required: false,
    options: [],
  });
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [optionInput, setOptionInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const resetNewField = () => {
    setNewField({
      name: '',
      type: 'text',
      required: false,
      options: [],
    });
    setOptionInput('');
  };
  
  const handleAddOption = () => {
    if (!optionInput.trim()) return;
    
    if (editingField) {
      const updatedOptions = [...(editingField.options || []), optionInput.trim()];
      setEditingField({ ...editingField, options: updatedOptions });
    } else {
      const updatedOptions = [...(newField.options || []), optionInput.trim()];
      setNewField({ ...newField, options: updatedOptions });
    }
    
    setOptionInput('');
  };
  
  const handleRemoveOption = (option: string) => {
    if (editingField) {
      const updatedOptions = (editingField.options || []).filter(opt => opt !== option);
      setEditingField({ ...editingField, options: updatedOptions });
    } else {
      const updatedOptions = (newField.options || []).filter(opt => opt !== option);
      setNewField({ ...newField, options: updatedOptions });
    }
  };
  
  const handleAddField = async () => {
    if (!newField.name.trim()) {
      toast.error('Por favor, informe um nome para o campo.');
      return;
    }
    
    if (newField.type === 'select' && (!newField.options || newField.options.length === 0)) {
      toast.error('Campos do tipo lista precisam ter pelo menos uma opção.');
      return;
    }
    
    setLoading(true);
    
    try {
      const created = await createCustomField(newField);
      setFields([...fields, created]);
      resetNewField();
      toast.success('Campo adicionado com sucesso!');
    } catch (error) {
      console.error('Error creating field:', error);
      toast.error('Erro ao adicionar campo. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditField = (field: CustomField) => {
    setEditingField(field);
    setNewField({ 
      name: '', 
      type: 'text', 
      required: false, 
      options: [] 
    });
  };
  
  const handleUpdateField = async () => {
    if (!editingField) return;
    
    if (!editingField.name.trim()) {
      toast.error('Por favor, informe um nome para o campo.');
      return;
    }
    
    if (editingField.type === 'select' && (!editingField.options || editingField.options.length === 0)) {
      toast.error('Campos do tipo lista precisam ter pelo menos uma opção.');
      return;
    }
    
    setLoading(true);
    
    try {
      const updated = await updateCustomField(editingField.id, editingField);
      setFields(fields.map(field => field.id === updated.id ? updated : field));
      setEditingField(null);
      toast.success('Campo atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating field:', error);
      toast.error('Erro ao atualizar campo. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteField = async (fieldId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este campo?')) {
      setLoading(true);
      
      try {
        await deleteCustomField(fieldId);
        setFields(fields.filter(field => field.id !== fieldId));
        toast.success('Campo removido com sucesso!');
        
        if (editingField?.id === fieldId) {
          setEditingField(null);
        }
      } catch (error) {
        console.error('Error deleting field:', error);
        toast.error('Erro ao remover campo. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleSave = () => {
    onFieldsUpdated();
  };
  
  const modalFooter = (
    <div className="flex justify-end space-x-2">
      <Button
        variant="outline"
        onClick={onClose}
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        onClick={handleSave}
        isLoading={loading}
      >
        Salvar
      </Button>
    </div>
  );
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerenciar Campos Personalizados"
      footer={modalFooter}
      size="lg"
    >
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            {editingField ? 'Editar Campo' : 'Adicionar Novo Campo'}
          </h3>
          
          <div className="space-y-4">
            <Input
              label="Nome do Campo"
              value={editingField ? editingField.name : newField.name}
              onChange={(e) => editingField 
                ? setEditingField({ ...editingField, name: e.target.value })
                : setNewField({ ...newField, name: e.target.value })
              }
              placeholder="Ex: Departamento"
            />
            
            <Select
              label="Tipo do Campo"
              value={editingField ? editingField.type : newField.type}
              onChange={(e) => {
                const type = e.target.value as 'text' | 'number' | 'boolean' | 'select';
                if (editingField) {
                  setEditingField({ ...editingField, type });
                } else {
                  setNewField({ ...newField, type });
                }
              }}
              options={[
                { value: 'text', label: 'Texto' },
                { value: 'number', label: 'Número' },
                { value: 'boolean', label: 'Sim/Não' },
                { value: 'select', label: 'Lista de Opções' },
              ]}
            />
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="fieldRequired"
                checked={editingField ? editingField.required : newField.required}
                onChange={(e) => editingField
                  ? setEditingField({ ...editingField, required: e.target.checked })
                  : setNewField({ ...newField, required: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="fieldRequired"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Campo Obrigatório
              </label>
            </div>
            
            {/* Options for select type */}
            {(editingField?.type === 'select' || newField.type === 'select') && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Opções</h4>
                
                <div className="flex mb-2">
                  <Input
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    placeholder="Digite uma opção"
                    className="flex-1 mb-0"
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddOption}
                    className="ml-2 whitespace-nowrap"
                  >
                    Adicionar
                  </Button>
                </div>
                
                <div className="space-y-2 mt-2">
                  {(editingField?.options || newField.options || []).map((option, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-300"
                    >
                      <span>{option}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(option)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4">
              {editingField ? (
                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    onClick={handleUpdateField}
                    disabled={loading}
                  >
                    Atualizar Campo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingField(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={handleAddField}
                  disabled={loading}
                >
                  Adicionar Campo
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Campos Personalizados</h3>
          
          {fields.length === 0 ? (
            <p className="text-gray-500">Nenhum campo personalizado adicionado ainda.</p>
          ) : (
            <div className="space-y-2">
              {fields.map((field) => (
                <div 
                  key={field.id} 
                  className="flex items-center justify-between bg-white px-4 py-3 rounded border border-gray-200"
                >
                  <div>
                    <span className="font-medium">{field.name}</span>
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="mr-2">
                        Tipo: {
                          field.type === 'text' ? 'Texto' : 
                          field.type === 'number' ? 'Número' : 
                          field.type === 'boolean' ? 'Sim/Não' : 
                          'Lista de Opções'
                        }
                      </span>
                      <span>
                        {field.required ? 'Obrigatório' : 'Opcional'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditField(field)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteField(field.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CustomFieldsModal;