import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Button from '../components/UI/Button';
import { createUser, getCustomFields, checkUserIdExists } from '../services/supabase';
import type { CustomField } from '../types/user';
import { countries } from '../utils/countries';

interface FormData {
  profile: string;
  user_id: string;
  whatsapp: string;
  country: string;
  [key: string]: string | boolean | number;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    profile: '',
    user_id: '',
    whatsapp: '+55 ',
    country: 'Brasil',
  });
  const [loading, setLoading] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [success, setSuccess] = useState(false);
  const [checkingId, setCheckingId] = useState(false);

  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        const fields = await getCustomFields();
        setCustomFields(fields);
      } catch (error) {
        console.error('Error fetching custom fields:', error);
      }
    };

    fetchCustomFields();
  }, []);

  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, '');
    
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 3) + ' (' + cleaned.slice(3);
      if (cleaned.length > 5) {
        formatted = formatted.slice(0, 7) + ') ' + formatted.slice(7);
        if (cleaned.length > 9) {
          formatted = formatted.slice(0, -4) + '-' + formatted.slice(-4);
        }
      }
    }
    
    return formatted;
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === 'whatsapp') {
      const formattedNumber = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formattedNumber }));
    } else if (name === 'user_id') {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      if (value.trim()) {
        setCheckingId(true);
        try {
          const exists = await checkUserIdExists(value);
          if (exists) {
            toast.error('Este ID já está em uso. Por favor, escolha outro ID.');
          }
        } catch (error) {
          console.error('Error checking user ID:', error);
        } finally {
          setCheckingId(false);
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }

    if (name === 'country') {
      const country = countries.find(c => c.name === value);
      if (country) {
        const currentPhone = formData.whatsapp;
        if (!currentPhone || currentPhone === '+') {
          setFormData(prev => ({
            ...prev,
            country: value,
            whatsapp: `+${country.phone} `
          }));
        }
      }
    }
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneNumber = parsePhoneNumberFromString(phone);
    return phoneNumber?.isValid() || false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.profile || !formData.user_id || !formData.whatsapp || !formData.country) {
        toast.error('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      const exists = await checkUserIdExists(formData.user_id);
      if (exists) {
        toast.error('Este ID já está em uso. Por favor, escolha outro ID.');
        return;
      }

      if (!validatePhoneNumber(formData.whatsapp)) {
        toast.error('Por favor, insira um número de WhatsApp válido com o código do país.');
        return;
      }

      const customFieldsData: Record<string, any> = {};
      customFields.forEach(field => {
        customFieldsData[field.name] = formData[field.name];
      });

      await createUser({
        profile: formData.profile,
        user_id: formData.user_id,
        whatsapp: formData.whatsapp,
        country: formData.country,
        is_admin: false,
        custom_fields: customFieldsData,
      });

      toast.success('Cadastro realizado com sucesso! Aguarde a aprovação do administrador.');
      setSuccess(true);
      
      setFormData({
        profile: '',
        user_id: '',
        whatsapp: '+55 ',
        country: 'Brasil',
      });
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao criar usuário. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 py-6 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <Shield className="w-10 h-10 text-white mr-3" />
          <h1 className="text-3xl font-bold text-white">The Presidential Agency</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6 mt-8">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Cadastro Enviado</h2>
              <p className="text-gray-600 mb-6">
                Seu cadastro foi enviado com sucesso e está aguardando aprovação do administrador.
                Você será notificado quando seu cadastro for aprovado.
              </p>
              <Button 
                variant="primary"
                onClick={() => setSuccess(false)}
              >
                Realizar novo cadastro
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Formulário de Cadastro</h2>
              
              <form onSubmit={handleSubmit}>
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
                  onChange={handleChange}
                  placeholder="Ex: 10.203.040"
                  required
                  disabled={checkingId}
                  helperText={checkingId ? 'Verificando disponibilidade...' : ''}
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
                  label="WHATSAPP"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="Digite o número com DDD"
                  required
                />
                
                {customFields.length > 0 && (
                  <div className="mt-6 mb-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Campos Adicionais</h3>
                    {customFields.map((field) => (
                      <div key={field.id} className="mb-4">
                        {field.type === 'boolean' ? (
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              name={field.name}
                              checked={!!formData[field.name]}
                              onChange={handleChange}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              required={field.required}
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">{field.name}</span>
                          </label>
                        ) : field.type === 'select' && field.options ? (
                          <Select
                            label={field.name}
                            name={field.name}
                            value={formData[field.name] as string}
                            onChange={handleChange}
                            options={field.options.map(opt => ({ value: opt, label: opt }))}
                            required={field.required}
                          />
                        ) : (
                          <Input
                            label={field.name}
                            name={field.name}
                            type={field.type}
                            value={formData[field.name] as string}
                            onChange={handleChange}
                            required={field.required}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                    className="w-full"
                  >
                    Cadastrar
                  </Button>
                </div>
              </form>
              
              <div className="mt-6 text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Acessar Painel Administrativo
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      
      <footer className="bg-gray-100 py-4 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} The Presidential Agency. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Register;