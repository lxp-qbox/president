import React, { useState } from 'react';
import { Shield, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import { adminLogin } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, message } = await adminLogin(username, password);
      
      if (success) {
        setIsAuthenticated(true);
        toast.success(message);
        navigate('/admin');
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro ao realizar login. Por favor, tente novamente.');
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

      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Painel Administrativo</h2>
          
          <form onSubmit={handleSubmit}>
            <Input
              label="Usuário"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              helperText="Usuário: admin"
              required
            />
            
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              helperText="Senha: admin@123"
              required
            />
            
            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full"
              >
                Entrar
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Voltar para a página de cadastro
            </Link>
          </div>
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

export default Login;