import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, ShoppingCart, Brain, Star, Users } from 'lucide-react';
import { doc, onSnapshot, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ContentFeed from '../components/ContentFeed';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

import VideoPlayer from '../components/VideoPlayer';

export default function Home() {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState({
    profilePictureUrl: 'https://ui-avatars.com/api/?name=Ishak+Alper&background=27272a&color=ECCC7B&size=512',
    heroTitle: 'Çıplak Gösteren Gözlükler',
    heroSubtitle: 'Rahatlatıcı yalanları mı tercih edersin, yoksa can yakan ama seni özgürleştirecek gerçeği mi? Bu kitap, yüzleşmekten kaçtığın her şeyi sana gösterecek.',
    instagramUrl: '#',
    twitterUrl: '#',
    linkedinUrl: '#',
    consultancyTitle: '',
    consultancySubtitle: '',
    contentFeedTitle: 'Yüzleşme Notları'
  });

  // Visitor Tracking
  useEffect(() => {
    const trackVisitor = async () => {
      const isVisited = sessionStorage.getItem('site_visited');
      if (!isVisited) {
        try {
          const statsRef = doc(db, 'settings', 'stats');
          await updateDoc(statsRef, {
            totalVisitors: increment(1)
          });
          sessionStorage.setItem('site_visited', 'true');
        } catch (error) {
          try {
            await setDoc(doc(db, 'settings', 'stats'), { totalVisitors: 1 }, { merge: true });
            sessionStorage.setItem('site_visited', 'true');
          } catch (e) {
            console.error("Tracking error", e);
          }
        }
      }
    };
    trackVisitor();
  }, []);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'general');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings(prev => ({ ...prev, ...data }));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/general');
    });
    
    return () => unsubscribe();
  }, []);

  const isTr = i18n.language === 'TR' || i18n.language === 'tr';

  const knownOldSubtitles = [
    'Rahatlatıcı yalanları mı tercih edersin, yoksa can yakan ama seni özgürleştirecek gerçeği mi? Kendi karanlığınla yüzleşip düşünce netliği kazanman için bir başucu kitabı ve psikolojik rehberlik.',
    'İnsanları, ilişkileri ve hayatın görünmeyen taraflarını anlamak isteyenler için.',
    'Rahatlatıcı yalanları mı tercih edersin, yoksa can yakan ama seni özgürleştirecek gerçeği mi? Bu kitap, yüzleşmekten kaçtığın her şeyi sana gösterecek.',
    'Etrafındaki maskeleri düşürmeye ve sarsıcı gerçekliğinle yüzleşmeye hazır mısın? Yıllarca sana satılan süslü yalanları bir kenara bırak. Bu eser, ilişkilerini, zihinsel sınırlarını ve hayatı algılayış biçimini kökünden değiştirecek bir psikolojik uyanış manifestosu.',
    'Herkesin sahte maskelerle dolaştığı bir dünyada, gerçeği görmek mi istersin, yoksa rahatlatıcı yalanlarla uyumaya devam etmek mi? Bu kitap, sana duymak istediklerini değil, yüzleşmekten kaçtığın \'çıplak\' gerçekleri sunuyor. İlişkilerini rehin alan gizli niyetleri, zihnindeki görünmez prangaları ve hayatın süslenmemiş halini kendi gözlerinle görmeye hazırlan. Seçim senin: Gözlükleri tak ve illüzyonu parçala!',
    'Gerçeğe tahammül edemeyenler için yazılmadı. Hayatın boyunca sana dayatılan \'rahatlatıcı yalanları\' bir kenara bırak. Bu eser; güvendiğin ilişkilerdeki gizli niyetleri, zihnindeki görünmez prangaları ve sana oynanan manipülasyonları deşifre eden bir kırmızı haptır. Acıtan ama seni sonsuza dek özgür kılacak \'çıplak\' gerçeği görmeye hazır mısın? Seçim senin: Ya uykuna geri dön, ya da gözlükleri tak ve illüzyonu parçala!',
    'Neden \'çıplak\'? Çünkü insan doğasının üzerindeki tüm o nezaket maskelerini, sosyal rolleri ve sahte savunma mekanizmalarını soyduğumuzda geriye sadece yüzleşilmesi zor, yalın bir gerçek kalır. \'Çıplak Gösteren Gözlükler\'; ilişkilerde, toplumsal kabullerde ve insanın kendi iç dünyasında sakladığı görünmez dinamikleri açığa çıkaran derinlikli bir psikolojik mercektir. Konforlu yalanlarla vedalaşıp, hayatı ve insan zihnini en filtresiz, en \'çıplak\' haliyle okumaya hazır mısınız?'
  ];

  const displayHeroTitle = (!isTr ? t('home.heroTitle') : settings.heroTitle) || t('home.heroTitle');
  
  let currentSubtitle = (!isTr ? t('home.heroSubtitle') : settings.heroSubtitle) || t('home.heroSubtitle');
  if (isTr && knownOldSubtitles.some(old => settings.heroSubtitle?.includes(old.substring(0, 50)))) {
    currentSubtitle = 'Tatlı yalanlarla uyumak mı, sarsıcı gerçeklere uyanmak mı? Sosyal maskeleri yıkan, ilişkilerdeki gizli niyetleri ve insan doğasını tüm \'çıplaklığıyla\' deşifre eden sarsıcı bir başucu eseri. Görünmeyeni görmek ve hayatın kontrolünü eline almak için; gözlükleri takma zamanı.';
  }
  const displayHeroSubtitle = currentSubtitle;

  const displayContentFeedTitle = (!isTr ? t('home.thoughtsAndAnalysis') : settings.contentFeedTitle) || t('home.thoughtsAndAnalysis');
  const displayContentFeedSubtitle = (!isTr ? t('home.thoughtsSubtitle') : (settings as any).contentFeedSubtitle) || t('home.thoughtsSubtitle');

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="İshak Alper | Kitap, Yazılar ve Birebir Danışmanlık"
        description="İnsan davranışları, ilişkiler ve zihinsel kalıplar üzerine. Yazılar, kitap ve birebir danışmanlık ile düşünce netliği kazanmanıza yardımcı oluyorum."
      />
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden border-b border-brand-500/10 bg-black">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/40 via-black to-black" />
          <img
            src="https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1920&auto=format&fit=crop"
            alt=""
            role="presentation"
            className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
          <div className="flex flex-col items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-48 sm:w-60 md:w-72 lg:w-80 aspect-[2/3] mb-12 sm:mb-16 group mx-auto"
              style={{ perspective: '1000px' }}
            >
              <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-1000"></div>
              <div className="relative w-full h-full rounded-r-2xl rounded-l-md overflow-hidden shadow-[20px_20px_40px_rgba(0,0,0,0.8),_inset_2px_0_4px_rgba(255,255,255,0.4)] border-y border-r border-white/10 border-l-[3px] border-l-zinc-800 transform-gpu transition-all duration-700 group-hover:rotate-y-[-5deg] group-hover:rotate-x-[2deg] group-hover:scale-105 group-hover:translate-x-2 bg-zinc-900" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-white/10 z-10 pointer-events-none"></div>
                {/* Book Spine Simulation */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-zinc-800 to-zinc-950 z-20 opacity-90 border-r border-white/10 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.5)]"></div>
                <img
                  src={settings.profilePictureUrl && settings.profilePictureUrl !== "https://ui-avatars.com/api/?name=Ishak+Alper&background=000&color=ECCC7B&size=512" ? settings.profilePictureUrl : "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=800&auto=format&fit=crop"}
                  alt="Çıplak Gösteren Gözlükler - Kitap Kapağı"
                  className="w-full h-full object-cover transition-all duration-1000 grayscale-[10%] group-hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                {/* Fallback Text if we just use a generic dark background */}
                {(!settings.profilePictureUrl || settings.profilePictureUrl === "https://ui-avatars.com/api/?name=Ishak+Alper&background=000&color=ECCC7B&size=512") && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-15">
                    <Star className="w-8 h-8 text-brand-500 mb-6 opacity-80 drop-shadow-xl" />
                    <h2 className="text-2xl md:text-3xl font-serif text-white uppercase tracking-widest leading-tight drop-shadow-2xl">Çıplak<br/>Gösteren<br/><span className="text-brand-400">Gözlükler</span></h2>
                    <div className="w-16 h-px bg-brand-500/50 my-6 shadow-xl"></div>
                    <p className="text-sm text-zinc-400 tracking-[0.3em] uppercase drop-shadow-md">İshak Alper</p>
                  </div>
                )}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              className="flex flex-col items-center mb-8"
            >
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 sm:px-6 py-2.5 rounded-2xl border border-brand-500/30 bg-black/50 text-brand-400 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-10 shadow-2xl backdrop-blur-md max-w-full">
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-brand-400 flex-shrink-0" aria-hidden="true" />
                  {(isTr ? (settings as any).newReleaseBadge : null) || t('home.newRelease')}
                </span>
                <div className="hidden sm:block w-[1px] h-4 bg-brand-500/30" aria-hidden="true" />
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  {(isTr ? (settings as any).readersCount : null) || t('home.readers')}
                </span>
                <div className="hidden sm:block w-[1px] h-4 bg-brand-500/30" aria-hidden="true" />
                <span className="flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  {(isTr ? (settings as any).ordersCount : null) || t('home.orders')}
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-serif font-medium text-white leading-[1.05] tracking-tight mb-8 px-2 drop-shadow-2xl">
                {displayHeroTitle.split(' ').map((word: string, i: number, arr: string[]) => 
                  i === arr.length - 1 ? <span key={i} className="text-brand-400 italic font-light drop-shadow-lg">{word}</span> : word + ' '
                )}
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-zinc-300 font-light leading-relaxed max-w-4xl mx-auto mb-14 px-4 drop-shadow-md"
            >
              {displayHeroSubtitle}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-5 justify-center w-full px-4 sm:px-0 sm:w-auto"
            >
              <Link
                to="/checkout"
                className="inline-flex items-center justify-center px-10 py-5 text-sm sm:text-base tracking-widest uppercase font-bold text-black bg-brand-500 hover:bg-brand-400 transition-all duration-300 rounded-full shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:shadow-[0_0_60px_rgba(212,175,55,0.7)] hover:-translate-y-1 active:scale-95 w-full sm:w-auto"
              >
                <ShoppingCart className="mr-3 w-5 h-5" />
                {(isTr ? (settings as any).heroCta2 : null) || t('home.orderNow', 'Kopyanı Hemen Ayırt')}
              </Link>
              <Link
                to="/kitap"
                className="inline-flex items-center justify-center px-10 py-5 text-sm sm:text-base tracking-widest uppercase font-semibold text-white bg-zinc-900/80 hover:bg-zinc-800 transition-all duration-300 rounded-full backdrop-blur-md border border-white/10 hover:border-brand-500/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95 w-full sm:w-auto"
              >
                <BookOpen className="mr-3 w-5 h-5 text-brand-400" />
                {(isTr ? (settings as any).heroCta1 : null) || t('home.reviewBook', 'Arka Kapak Yazısını Oku')}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Video Section */}
      {((settings as any).philosophyVideoUrl || ((settings as any).promotionalVideos && (settings as any).promotionalVideos.length > 0)) && (
        <section className="py-24 bg-zinc-900 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-500/5 mix-blend-overlay pointer-events-none"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight mb-4">
                {(isTr ? (settings as any).philosophyTitle : null) || t('home.philosophyTitle')}
              </h2>
              <p className="text-lg text-zinc-400 font-light max-w-2xl mx-auto">
                {(isTr ? (settings as any).philosophySubtitle : null) || t('home.philosophySubtitle')}
              </p>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-2xl overflow-hidden border border-white/10 bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] relative aspect-video"
            >
              <VideoPlayer 
                url={(settings as any).philosophyVideoUrl || (settings as any).promotionalVideos?.[0]?.url} 
                className="w-full h-full object-contain" 
                autoPlay 
                muted 
                loop 
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Psychological Persuasion / Quote Section */}
      <section className="py-32 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/20 via-zinc-950 to-zinc-950 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Star className="w-12 h-12 text-brand-500 mx-auto mb-8 opacity-50" />
          <blockquote className="text-2xl md:text-4xl font-serif text-white leading-relaxed mb-8">
            {(isTr ? (settings as any).quoteText : null) || '"İnsanların çoğu gerçeği aramaz, sadece inandıkları yalanları doğrulayacak birilerini arar. Bu kitap, o yalanları yüzünüze çarpmak için yazıldı."'}
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-1px bg-brand-500/50"></div>
            <span className="text-brand-400 font-medium tracking-widest uppercase text-sm">{(isTr ? (settings as any).quoteAuthor : null) || 'İshak Alper'}</span>
            <div className="w-12 h-1px bg-brand-500/50"></div>
          </div>
        </div>
      </section>

      {/* Content Feed Section */}
      <section className="py-24 bg-zinc-950 border-t border-white/5" aria-labelledby="content-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 id="content-heading" className="text-3xl md:text-5xl font-serif text-white tracking-tight mb-6">
              {displayContentFeedTitle}
            </h2>
            <p className="text-lg text-zinc-400 font-light">
              {displayContentFeedSubtitle}
            </p>
          </div>
          <ContentFeed settings={settings} />
        </div>
      </section>
    </div>
  );
}
