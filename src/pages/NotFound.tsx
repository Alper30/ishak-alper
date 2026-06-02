import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <SEO 
        title="Sayfa Bulunamadı | İshak Alper"
        description="Aradığınız sayfa bulunamadı veya taşınmış olabilir."
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        <div className="relative w-32 h-32 mx-auto mb-8 text-zinc-800">
          <Search className="w-full h-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-serif text-zinc-500 font-bold">
            404
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-serif text-white mb-4">
          Gerçeği ararken kayboldunuz galiba?
        </h1>
        
        <p className="text-zinc-400 mb-8 leading-relaxed">
          Ulaşmaya çalıştığınız sayfa burada değil. Ya silinmiş, ya adı değiştirilmiş, ya da geçici olarak kullanılamıyor. Neyse ki hala kendi yolunuzu bulabilirsiniz.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center px-8 py-3 text-sm tracking-widest uppercase font-semibold text-black bg-brand-500 hover:bg-brand-400 transition-colors rounded-full"
        >
          <Home className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Link>
      </motion.div>
    </div>
  );
}
