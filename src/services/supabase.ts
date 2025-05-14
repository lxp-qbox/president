import { createClient } from '@supabase/supabase-js';
import type { User, CustomField } from '../types/user';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not defined. Please connect to Supabase.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key',
);

// User related functions
export const checkUserIdExists = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users')
    .select('user_id')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return false; // User ID does not exist
    }
    throw error;
  }
  
  return !!data;
};

export const createUser = async (userData: Omit<User, 'id' | 'uuid' | 'created_at' | 'updated_at' | 'status'>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({ ...userData, status: 'pending' })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        throw new Error('Este ID já está em uso. Por favor, escolha outro ID.');
      }
      throw error;
    }
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro ao criar usuário');
  }
};

export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as User[];
};

export const getUser = async (id: string | number): Promise<User | null> => {
  try {
    // Convert id to bigint string if it's a number
    const queryId = typeof id === 'number' ? id.toString() : id;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', queryId)
      .maybeSingle();
    
    if (error) throw error;
    return data as User | null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const updateUser = async (id: string | number, userData: Partial<User>): Promise<User> => {
  try {
    // Convert id to bigint string if it's a number
    const queryId = typeof id === 'number' ? id.toString() : id;
    
    const existingUser = await getUser(queryId);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    const updateData = { ...userData };
    // Remove immutable fields
    delete updateData.id;
    delete updateData.uuid;
    delete updateData.created_at;
    delete updateData.updated_at;
    delete updateData.user_id;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', queryId)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Usuário não encontrado');
      }
      throw error;
    }
    
    if (!data) {
      throw new Error('Erro ao atualizar usuário');
    }
    
    return data as User;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro ao atualizar usuário');
  }
};

export const deleteUser = async (id: string) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro ao excluir usuário');
  }
};

// Custom fields related functions
export const getCustomFields = async () => {
  const { data, error } = await supabase
    .from('custom_fields')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data as CustomField[];
};

export const createCustomField = async (fieldData: Omit<CustomField, 'id'>) => {
  const { data, error } = await supabase
    .from('custom_fields')
    .insert(fieldData)
    .select()
    .single();
  
  if (error) throw error;
  return data as CustomField;
};

export const updateCustomField = async (id: string, fieldData: Partial<CustomField>) => {
  const { data, error } = await supabase
    .from('custom_fields')
    .update(fieldData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as CustomField;
};

export const deleteCustomField = async (id: string) => {
  const { error } = await supabase
    .from('custom_fields')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Authentication functions
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

interface LoginAttempt {
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const getLoginAttempts = (): LoginAttempt => {
  try {
    const stored = localStorage.getItem('loginAttempts');
    if (!stored) return { attempts: 0, lastAttempt: 0 };
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error getting login attempts:', error);
    return { attempts: 0, lastAttempt: 0 };
  }
};

const updateLoginAttempts = (attempts: LoginAttempt) => {
  try {
    localStorage.setItem('loginAttempts', JSON.stringify(attempts));
  } catch (error) {
    console.error('Error updating login attempts:', error);
  }
};

const clearLoginAttempts = () => {
  try {
    localStorage.removeItem('loginAttempts');
  } catch (error) {
    console.error('Error clearing login attempts:', error);
  }
};

export const adminLogin = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    const loginAttempts = getLoginAttempts();
    const now = Date.now();

    if (loginAttempts.lockedUntil && now < loginAttempts.lockedUntil) {
      const remainingTime = Math.ceil((loginAttempts.lockedUntil - now) / 1000 / 60);
      return {
        success: false,
        message: `Conta bloqueada. Tente novamente em ${remainingTime} minutos.`
      };
    }

    if (now - loginAttempts.lastAttempt > LOCKOUT_TIME) {
      clearLoginAttempts();
    }

    const isValid = username === 'admin' && password === 'admin@123';

    if (isValid) {
      clearLoginAttempts();
      localStorage.setItem('auth_token', 'admin_authenticated');
      localStorage.setItem('user_role', 'admin');
      return { success: true, message: 'Login realizado com sucesso!' };
    }

    loginAttempts.attempts += 1;
    loginAttempts.lastAttempt = now;

    if (loginAttempts.attempts >= MAX_LOGIN_ATTEMPTS) {
      loginAttempts.lockedUntil = now + LOCKOUT_TIME;
      updateLoginAttempts(loginAttempts);
      return {
        success: false,
        message: 'Muitas tentativas de login. Conta bloqueada por 15 minutos.'
      };
    }

    updateLoginAttempts(loginAttempts);
    return {
      success: false,
      message: `Credenciais inválidas. ${MAX_LOGIN_ATTEMPTS - loginAttempts.attempts} tentativas restantes.`
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Erro ao realizar login. Tente novamente.' };
  }
};

export const checkAdminAuth = (): boolean => {
  try {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    return token === 'admin_authenticated' && role === 'admin';
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

export const adminLogout = () => {
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    clearLoginAttempts();
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};