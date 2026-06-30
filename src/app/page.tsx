"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Loader, { playedLoaders } from "@/components/Loader";
import { whatsappLink, INSTAGRAM_URL } from "@/lib/site";

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Loader bu oturumda zaten oynadıysa hero metni için beklemeyi atla.
  const [heroDelay] = useState(() => {
    if (typeof window !== "undefined") {
      return playedLoaders.has("SUNLINE") ? 0.1 : 1.4;
    }
    return 1.4;
  });

  return (
    <main className="relative bg-[var(--color-ink)]" ref={containerRef}>
      <Loader duration={1400} />
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center p-6">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <div className="w-full h-full bg-stone-900 flex items-center justify-center opacity-40">
            <span className="text-[var(--color-paper)]/50 font-display uppercase tracking-widest text-sm">Kling 3.0 Hero Video Placeholder</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/20 to-transparent"></div>
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col gap-6 mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: heroDelay, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-8xl lg:text-[9rem] font-display font-black tracking-tighter leading-none"
          >
            KUSURSUZ KAYIT<span className="bg-current inline-block h-[0.25em] w-[0.25em] ml-[0.1em]"></span><br/>
            <span className="text-[var(--color-flare)]">EKSİKSİZ SAHNE<span className="bg-current inline-block h-[0.25em] w-[0.25em] ml-[0.1em]"></span></span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: heroDelay + 0.3 }}
            className="flex flex-col md:flex-row md:items-center gap-6 mt-8"
          >
            <div className="tag-volt self-start md:self-auto">İzmir, Alsancak</div>
            <p className="text-xl max-w-lg font-light text-stone-300">
              Premium stüdyo atmosferinden en büyük festival sahnelerine. Ege&apos;nin en güçlü backline envanteriyle her performansa hazır olun.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Provenance Badge Separator */}
      <div className="w-full py-12 flex justify-center bg-[var(--color-ink)] relative z-20">
        <div className="badge-provenance opacity-50">RECORDED AT SUNLINE</div>
      </div>

      {/* Backline Section (Yaz Sezonu Önceliği) */}
      <section id="backline" className="relative min-h-screen py-24 px-6 z-20 bg-[var(--color-paper)] text-[var(--color-ink)] rounded-t-[3rem]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <span className="font-display text-[var(--color-volt)] text-xl font-bold tracking-widest">01 / BACKLINE</span>
            <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-none">
              SAHNEDE<br/>DEV GÜÇ<span className="bg-current inline-block h-[0.25em] w-[0.25em] ml-[0.1em]"></span>
            </h2>
            <p className="text-lg md:text-xl font-medium opacity-80 mt-4">
              Festivaller, turneler ve özel etkinlikler için Ege Bölgesi&apos;nin en geniş ve bakımlı premium backline envanteri. Tam zamanında, eksiksiz kurulum.
            </p>
            
            {/* EEAT İçerik Bloğu - AEO / GEO Optimize Edildi */}
            <div className="mt-6 p-8 border-l-4 border-[var(--color-flare)] bg-stone-100 flex flex-col gap-4">
              <h3 className="font-bold text-lg font-display uppercase tracking-wider">Sanatçının Dilinden Anlayan Backline</h3>
              <p className="text-sm md:text-base opacity-80 font-medium leading-relaxed">
                Biz sadece ekipman sağlamıyoruz; kendimiz de sanatçı olduğumuz için sahnenin ruhunu ve sanatçının ihtiyaçlarını çok iyi anlıyoruz. Gipsy Kings, Volkan Öktem, Yüksek Sadakat, Kibariye ve Monica Molina gibi dünya çapındaki devlerin rider&apos;larını zamanından önce, eksiksiz ve sıfır problemle kuruyoruz. DW Collector&apos;s, Nord Stage 3, Kemper ve Yamaha Montage gibi paha biçilemez ekipmanlarımıza gözümüz gibi bakıyor, sanatçı gelmeden önce isteğe göre kişiselleştiriyoruz.
              </p>
            </div>

            <div className="mt-8">
              <Link href="/ekipmanlar" className="btn-flare">Envanteri İncele</Link>
            </div>
          </div>
          <div className="w-full md:w-1/2">
             <div className="frame-volt aspect-[4/5] bg-stone-200 flex items-center justify-center relative overflow-hidden">
                <span className="text-[var(--color-ink)]/50 font-display uppercase tracking-widest text-sm text-center px-4 relative z-10">
                  Kling 3.0 Video Placeholder<br/><br/>
                  Gipsy Kings, Yüksek Sadakat vb. sahnelerden kesitler veya dev bir festival sahnesi kurulumu
                </span>
             </div>
          </div>
        </div>
      </section>

      {/* Kayıt Section */}
      <section id="kayit" className="relative min-h-screen py-24 px-6 z-20 bg-[var(--color-ink)] text-[var(--color-paper)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse gap-12 items-center">
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <span className="font-display text-[var(--color-flare)] text-xl font-bold tracking-widest">02 / KAYIT</span>
            <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-none">
              SESİN BURADA<br/>BAŞLAR<span className="bg-current inline-block h-[0.25em] w-[0.25em] ml-[0.1em]"></span>
            </h2>
            <p className="text-lg md:text-xl font-light opacity-80 mt-4">
              İzmir&apos;in en iyi ve en donanımlı stüdyosu. İnce mühendislikle tasarlanmış mükemmel akustik, eşi benzeri olmayan analog hardware ve hiçbir saniyesi ziyan edilmeyen konforlu bir üretim alanı.
            </p>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
               <div className="border border-stone-800 p-4 rounded-lg">
                  <h3 className="font-bold text-[var(--color-volt)] mb-1 text-base">Dönüştürücüler</h3>
                  <p className="text-xs opacity-70">Antelope Orion+ 32, Discrete 8</p>
               </div>
               <div className="border border-stone-800 p-4 rounded-lg">
                  <h3 className="font-bold text-[var(--color-flare)] mb-1 text-base">Preamp & Outboard</h3>
                  <p className="text-xs opacity-70">Neve 1073DPA, SSL Pure Drive Octo</p>
               </div>
            </div>

            <div className="mt-8">
              <a
                href={whatsappLink("Merhaba, Sunline stüdyosu (kayıt/prova) hakkında bilgi almak istiyorum.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-paper"
              >
                Stüdyoyu İncele
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/2">
             <div className="border-4 border-[var(--color-flare)] relative overflow-hidden aspect-[4/5] bg-stone-900 flex items-center justify-center">
                <span className="text-[var(--color-paper)]/50 font-display uppercase tracking-widest text-sm text-center px-4">
                  Kling 3.0 Video / Fotoğraf<br/><br/>
                  Prompt: A musician at a mic, lit by dual gels...
                </span>
             </div>
          </div>
        </div>
      </section>

      {/* Mix/Master Section */}
      <section id="mix" className="relative min-h-screen py-24 px-6 z-20 bg-[var(--color-paper)] text-[var(--color-ink)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <span className="font-display text-[var(--color-volt)] text-xl font-bold tracking-widest">03 / MIX & MASTER</span>
            <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-none">
              KUSURSUZ<br/>DENGE<span className="bg-current inline-block h-[0.25em] w-[0.25em] ml-[0.1em]"></span>
            </h2>
            <p className="text-lg md:text-xl font-medium opacity-80 mt-4">
              Analog sıcaklık ve dijital keskinlik. Konsol odamızdaki devasa Genelec monitörler ile şarkının hak ettiği son dokunuş, endüstri standartlarında net bir duyum.
            </p>
            <div className="mt-8">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-flare"
              >
                Örnekleri Dinle
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/2">
             <div className="frame-volt aspect-video bg-stone-200 flex items-center justify-center">
                <span className="text-[var(--color-ink)]/50 font-display uppercase tracking-widest text-sm text-center px-4">
                  Kling 3.0 Video Placeholder<br/><br/>
                  Hands on a console, gel light streaks, shallow DOF
                </span>
             </div>
          </div>
        </div>
      </section>

      {/* Prova Section */}
      <section id="prova" className="relative min-h-screen py-24 px-6 z-20 bg-[var(--color-ink)] text-[var(--color-paper)]">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center gap-8">
          <span className="font-display text-[var(--color-flare)] text-xl font-bold tracking-widest">04 / PROVA</span>
          <h2 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-none">
            SAHNE ÖNCESİ<br/>SON DURAK<span className="bg-current inline-block h-[0.25em] w-[0.25em] ml-[0.1em]"></span>
          </h2>
          <p className="text-xl max-w-2xl font-light opacity-80 mt-4">
            Her türlü enstrümana ve rider isteğine anında cevap verebilen, ince mühendislikle tasarlanmış prova salonu. Geniş alan, referans duyum, terlemeden çalışabileceğin güçlü havalandırma. Sadece çalmaya odaklan.
          </p>
          
          <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-[3/2] border-2 border-[var(--color-paper)] bg-stone-900 flex items-center justify-center">
               <span className="text-[var(--color-paper)]/50 font-display uppercase tracking-widest text-sm text-center px-4">Wide shot of a band mid-session in a live room</span>
            </div>
             <div className="aspect-[3/2] border-2 border-[var(--color-paper)] bg-stone-900 flex items-center justify-center">
               <span className="text-[var(--color-paper)]/50 font-display uppercase tracking-widest text-sm text-center px-4">Premium synth or drum kit against bold solid block</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="relative py-32 px-6 z-20 bg-[var(--color-ink)] text-[var(--color-paper)] border-t border-stone-800 flex flex-col items-center text-center">
         <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter mb-8">
            SAHNEYE HAZIRLAN<span className="bg-current inline-block h-[0.25em] w-[0.25em] ml-[0.1em]"></span>
         </h2>
         <a
            href={whatsappLink("Merhaba, Sunline ile çalışmak istiyorum. Detayları konuşabilir miyiz?")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-flare text-xl h-16 px-12 mb-20"
         >
            Bize Ulaşın
         </a>

         <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4 opacity-50 font-display uppercase tracking-widest text-sm">
            <span>© 2026 SUNLINE STUDIO</span>
            <div className="flex gap-6">
               <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-flare)] transition">Instagram</a>
               <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-flare)] transition">WhatsApp</a>
            </div>
         </div>
      </footer>
    </main>
  );
}
