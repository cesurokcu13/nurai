import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { generateRandomColorNickname } from '../utils/nicknameGenerator';

export default function AuthModal({ isOpen, onClose, onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewNickname] = useState(() => generateRandomColorNickname());

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await onSignIn(email, password);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 relative shadow-2xl border border-slate-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <UserCheck className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isSignUp ? 'Anonim Kimlikle Katıl' : 'Giriş Yap'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Risale-i Nur günlük okumalarını grupça takip etmek için başla.
          </p>
        </div>

        {/* Privacy Highlight Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 mb-6 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-amber-400">Gizlilik Garantisi:</span> E-posta adresiniz kimseyle paylaşılmaz. Sistem size otomatik olarak <span className="text-emerald-400 font-semibold">{previewNickname.nickname}</span> gibi renkli bir takma ad atayacaktır.
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {isSignUp ? 'Kayıt Ol & Renk Kimliğini Al' : 'Giriş Yap'}
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400">
          {isSignUp ? 'Zaten hesabınız var mı?' : 'Hesabınız yok mu?'}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-1 text-emerald-400 hover:underline font-semibold"
          >
            {isSignUp ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </div>

      </div>
    </div>
  );
}
