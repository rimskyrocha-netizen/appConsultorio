import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { API_BASE_URL } from '../config';

interface LoginProps {
  onLogin: (user: User) => void;
  appName: string;
  appIcon: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, appName, appIcon }) => {
  const [email, setEmail] = useState('roberto@odontoflow.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data);
      } else {
        setError(data.message || 'Erro ao realizar login.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Erro de login:', err);
      setError('Erro de conexão com o servidor.');
      setIsLoading(false);
    }
  };

  const renderIcon = () => {
    if (appIcon.startsWith('data:image')) {
      return <img src={appIcon} className="w-full h-full object-contain rounded-xl" alt="App Icon" />;
    }
    return <i className={`fas ${appIcon}`}></i>;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500 rounded-2xl shadow-xl shadow-sky-200 mb-4 text-white text-3xl overflow-hidden p-2">
            {renderIcon()}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight px-4">{appName}</h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">Sistema de Gestão Odontológica</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800">Seja bem-vindo de volta!</h2>
              <p className="text-sm text-slate-500">Entre com suas credenciais para acessar o painel.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-sm animate-shake">
                  <i className="fas fa-exclamation-circle"></i>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-mail Corporativo</label>
                <div className="relative">
                  <i className="far fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type="email" 
                    required
                    autoFocus
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition-all text-sm"
                    placeholder="ex: roberto@clínica.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Senha de Acesso</label>
                  <a href="#" className="text-[10px] font-bold text-sky-600 hover:text-sky-700 uppercase tracking-wider">Esqueceu a senha?</a>
                </div>
                <div className="relative">
                  <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition-all text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500" />
                <label htmlFor="remember" className="text-xs font-medium text-slate-600 cursor-pointer">Lembrar acesso neste dispositivo</label>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-sky-500 text-white rounded-2xl font-bold shadow-lg shadow-sky-100 hover:bg-sky-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    Validando acesso...
                  </>
                ) : (
                  <>
                    Entrar no Sistema
                    <i className="fas fa-arrow-right text-xs opacity-60"></i>
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Ainda não tem conta? <a href="#" className="text-sky-600 font-bold hover:underline">Entre em contato</a> para credenciamento.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] space-y-2">
          <p>© 2023 {appName} • Gestão Digital Inteligente</p>
          <p className="flex items-center justify-center gap-4">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacidade</a>
            <span className="opacity-30">•</span>
            <a href="#" className="hover:text-slate-600 transition-colors">Termos de Uso</a>
            <span className="opacity-30">•</span>
            <a href="#" className="hover:text-slate-600 transition-colors">Suporte</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;