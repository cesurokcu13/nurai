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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="paper-card w-full max-w-md rounded-3xl p-6 sm:p-8 relative shadow-xl border border-stone-200 bg-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-100 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-sage-50 text-sage-700 border border-sage-200 mb-3 shadow-2xs">
            <UserCheck className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-stone-900">
            {isSignUp ? 'Anonim Kimlikle Katıl' : 'Giriş Yap'}
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Risale-i Nur günlük okumalarını grupça takip etmek için başla.
          </p>
        </div>

        {/* Privacy Highlight Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 mb-6 flex items-start gap-3 shadow-2xs">
          <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-stone-700">
            <span className="font-semibold text-amber-900">Gizlilik Garantisi:</span> E-posta adresiniz kimseyle paylaşılmaz. Sistem size otomatik olarak <span className="text-sage-800 font-semibold">{previewNickname.nickname}</span> gibi renkli bir takma ad atayacaktır.
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-stone-300 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-sage-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-stone-300 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-sage-600 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-sage-700 hover:bg-sage-800 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
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

        <div className="mt-5 text-center text-xs text-stone-500">
          {isSignUp ? 'Zaten hesabınız var mı?' : 'Hesabınız yok mu?'}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-1 text-sage-800 hover:underline font-semibold"
          >
            {isSignUp ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </div>

      </div>
    </div>
  );
}
