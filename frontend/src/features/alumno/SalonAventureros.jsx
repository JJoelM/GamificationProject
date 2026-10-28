import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Medal, Flame, Swords, Shield, Sparkles, Crown,
  User, ChevronRight, X, Heart, Star, Users, ArrowUpRight
} from 'lucide-react';
import { useRankingAula } from '../../hooks/useRankingAula';
import useSessionStore, { calcularNivel, formatearTitulo } from '../../store/useSessionStore';
import ArtFrame from '../../components/ui/ArtFrame';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { getAvatarPorId } from './components/AvataresData';
import { playParchment } from '../../utils/audio';

const MASCOTAS_INFO = {
  buho: { nombre: 'Búho Erudito', src: '/images/mascotas/buho.png', desc: 'Compañero de lecturas nocturnas y concentración.' },
  dragon: { nombre: 'Dragón Guardián', src: '/images/mascotas/dragon.png', desc: 'Fuego y valentía ante los mayores desafíos.' },
  gato: { nombre: 'Gato Místico', src: '/images/mascotas/gato.png', desc: 'Serenidad y cariño en las horas de estudio.' },
};

export default function SalonAventureros() {
  const { data, isLoading, isError } = useRankingAula();
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [vistaModo, setVistaModo] = useState('tarjetas'); // 'tarjetas' | 'tabla'

  const ranking = data?.ranking || [];
  const progresoPropio = data?.progresoPropio;

  const top3 = ranking.slice(0, 3);
  const restoRanking = ranking.slice(3);

  // Orden para el podio visual: #2 a la izquierda, #1 en el centro elevado, #3 a la derecha
  const podioDisplay = [
    top3[1] ? { ...top3[1], lugar: 2 } : null,
    top3[0] ? { ...top3[0], lugar: 1 } : null,
    top3[2] ? { ...top3[2], lugar: 3 } : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* ── 1. ENCABEZADO PRINCIPAL (Painterly RPG) ── */}
      <section className="relative overflow-hidden p-6 sm:p-8 rounded-[18px_24px_20px_22px] bg-gradient-to-r from-[var(--bg-panel)] via-[var(--bg-accent)] to-[var(--bg-panel)] border-3 border-[var(--border)] shadow-[var(--shadow-c)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/15 border-3 border-[var(--brand-gold)] flex items-center justify-center text-[var(--brand-gold)] shadow-[2px_2px_0px_var(--border)] shrink-0">
              <Trophy size={32} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="gold">Salón de Aventureros</Badge>
                <span className="text-xs font-display font-semibold text-[var(--text-secondary)]">
                  Laboratorio de Sistemas
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-[var(--text-primary)] tracking-tight">
                Cuadro de Honor del Aula
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mt-1">
                Compite con honor, luce tus cosméticos legendarios y celebra el progreso colectivo con tus compañeros de expedición.
              </p>
            </div>
          </div>

          {/* Estadísticas rápidas de participación */}
          <div className="flex items-center gap-3 bg-[var(--bg-panel)]/90 backdrop-blur-xs p-3 rounded-2xl border-2 border-[var(--border-muted)] self-stretch sm:self-auto justify-around sm:justify-start">
            <div className="text-center px-3">
              <span className="block font-display font-black text-xl text-[var(--brand-primary)]">
                {ranking.length}
              </span>
              <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Aventureros
              </span>
            </div>
            <div className="w-px h-8 bg-[var(--border-muted)]" />
            <div className="text-center px-3">
              <span className="block font-display font-black text-xl text-[var(--brand-gold)]">
                {progresoPropio?.xpEstasSemana ?? 0}
              </span>
              <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Tu XP Semanal
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. ESTADO DE CARGA O ERROR ── */}
      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <Spinner size="lg" label="Reuniendo a los aventureros del aula..." />
        </div>
      ) : isError ? (
        <div className="p-8 text-center rounded-2xl border-2 border-[var(--brand-crimson)] bg-[var(--bg-panel)]">
          <p className="text-sm font-display font-bold text-[var(--brand-crimson)]">
            No se pudo cargar el Salón de Aventureros en este momento.
          </p>
        </div>
      ) : ranking.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-[var(--border-muted)] bg-[var(--bg-panel)]">
          <Users size={40} className="mx-auto text-[var(--text-secondary)] mb-2 opacity-50" />
          <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
            Aún no hay expedicionarios en el ranking
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Completa misiones en el Tablero para inscribir tu nombre con letras doradas.
          </p>
        </div>
      ) : (
        <>
          {/* ── 3. PODIO DE HONOR (TOP 3 VISUAL) ── */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-display font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Crown size={20} className="text-[var(--brand-gold)]" />
                <span>Podio de los Grandes Maestros</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4 pb-2">
              {podioDisplay.map((alumno) => {
                const esPrimero = alumno.lugar === 1;
                const esSegundo = alumno.lugar === 2;
                const esTercero = alumno.lugar === 3;
                const nivel = calcularNivel(alumno.experienciaXP).nivel;
                const avatar = getAvatarPorId(alumno.avatarEquipado);
                const mascota = MASCOTAS_INFO[alumno.mascotaEquipada];

                const colorBorde = esPrimero
                  ? 'border-[var(--brand-gold)] shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                  : esSegundo
                    ? 'border-slate-300 dark:border-slate-600'
                    : 'border-amber-700/60 dark:border-amber-700/60';

                const podioH = esPrimero ? 'md:min-h-[380px]' : esSegundo ? 'md:min-h-[340px]' : 'md:min-h-[320px]';

                return (
                  <motion.div
                    key={alumno.nombreCompleto}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => { playParchment(); setSelectedAlumno(alumno); }}
                    className={[
                      'relative p-5 rounded-[16px_22px_18px_20px] border-3 flex flex-col items-center justify-between text-center transition-all cursor-pointer bg-[var(--bg-panel)]',
                      colorBorde,
                      podioH,
                      alumno.esYo ? 'ring-3 ring-[var(--brand-primary)] ring-offset-2 ring-offset-[var(--bg-base)]' : '',
                    ].join(' ')}
                  >
                    {/* Medalla de Puesto */}
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                      <div
                        className={[
                          'px-3 py-1 rounded-full text-xs font-display font-black flex items-center gap-1.5 shadow-md border-2',
                          esPrimero
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 border-amber-300'
                            : esSegundo
                              ? 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900 border-slate-100'
                              : 'bg-gradient-to-r from-amber-700 to-amber-800 text-amber-100 border-amber-600',
                        ].join(' ')}
                      >
                        <Medal size={14} />
                        <span>#{alumno.lugar} Lugar</span>
                      </div>
                    </div>

                    {/* Retrato con Marco, Avatar y Mascota */}
                    <div className="relative mt-3">
                      <ArtFrame
                        label={`Retrato de ${alumno.nombreCompleto}`}
                        shape={alumno.marcoEquipado || 'scroll'}
                        aspectRatio="1/1"
                        avatarId={alumno.avatarEquipado}
                        className={[
                          'w-24 h-24 sm:w-28 sm:h-28 shadow-md',
                          esPrimero ? 'ring-2 ring-amber-400/80' : '',
                        ].join(' ')}
                      />

                      {/* Nivel en la base */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                        <Badge variant="nivel">Nv. {nivel}</Badge>
                      </div>

                      {/* Mascota en la esquina superior */}
                      {mascota && (
                        <div
                          className="absolute -top-2 -right-2 z-20 w-9 h-9 rounded-full border-2 border-[var(--brand-gold)] shadow-md overflow-hidden bg-[var(--bg-panel)] p-0.5"
                          title={`Compañero: ${mascota.nombre}`}
                        >
                          <img src={mascota.src} alt={mascota.nombre} className="w-full h-full object-cover rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Información del estudiante */}
                    <div className="flex flex-col items-center gap-1.5 my-3 w-full">
                      {alumno.tituloEquipado && (
                        <Badge variant="violet" className="text-[10px]">
                          {formatearTitulo(alumno.tituloEquipado)}
                        </Badge>
                      )}

                      <h3 className="font-display font-bold text-base sm:text-lg text-[var(--text-primary)] truncate max-w-[200px]">
                        {alumno.nombreCompleto}
                      </h3>

                      {alumno.esYo && (
                        <span className="text-[10px] font-display font-extrabold text-[var(--brand-primary)] bg-[color-mix(in_oklch,var(--brand-primary)_12%,var(--bg-panel))] px-2 py-0.5 rounded-full border border-[var(--brand-primary)]/30">
                          ¡Eres tú!
                        </span>
                      )}

                      <span className="text-xs text-[var(--text-secondary)] font-display">
                        {avatar?.clase}
                      </span>
                    </div>

                    {/* Estadísticas de combate y sabiduría */}
                    <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-muted)] text-xs">
                      <div className="flex flex-col items-center">
                        <span className="font-display font-black text-sm text-[var(--brand-primary)]">
                          {alumno.experienciaXP}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)] uppercase">XP Total</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-display font-black text-sm text-[var(--brand-emerald)] flex items-center gap-1">
                          <Flame size={12} className="text-amber-500" />
                          {alumno.rachaDiasActivos}d
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)] uppercase">Racha</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ── 4. LISTA COMPLETA DE AVENTUREROS ── */}
          <section className="flex flex-col gap-4 mt-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-base sm:text-lg font-display font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Users size={20} className="text-[var(--brand-primary)]" />
                <span>Todos los Aventureros del Aula ({ranking.length})</span>
              </h2>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-muted)]">
                <button
                  type="button"
                  onClick={() => { playParchment(); setVistaModo('tarjetas'); }}
                  className={[
                    'px-3 py-1 rounded-lg text-xs font-display font-bold transition-all cursor-pointer',
                    vistaModo === 'tarjetas' ? 'bg-[var(--brand-primary)] text-white shadow-xs' : 'text-[var(--text-secondary)]',
                  ].join(' ')}
                >
                  Tarjetas
                </button>
                <button
                  type="button"
                  onClick={() => { playParchment(); setVistaModo('tabla'); }}
                  className={[
                    'px-3 py-1 rounded-lg text-xs font-display font-bold transition-all cursor-pointer',
                    vistaModo === 'tabla' ? 'bg-[var(--brand-primary)] text-white shadow-xs' : 'text-[var(--text-secondary)]',
                  ].join(' ')}
                >
                  Tabla
                </button>
              </div>
            </div>

            {vistaModo === 'tarjetas' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ranking.map((alumno, idx) => {
                  const nivel = calcularNivel(alumno.experienciaXP).nivel;
                  const avatar = getAvatarPorId(alumno.avatarEquipado);
                  const mascota = MASCOTAS_INFO[alumno.mascotaEquipada];
                  const puesto = idx + 1;

                  return (
                    <Card
                      key={alumno.nombreCompleto}
                      onClick={() => { playParchment(); setSelectedAlumno(alumno); }}
                      className={[
                        'p-4 flex items-center justify-between gap-4 border-2 transition-all cursor-pointer hover:border-[var(--brand-primary)] hover:shadow-md',
                        alumno.esYo
                          ? 'border-[var(--brand-primary)] bg-[color-mix(in_oklch,var(--brand-primary)_6%,var(--bg-panel))] shadow-[3px_3px_0px_var(--brand-primary)]'
                          : 'border-[var(--border)]',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Puesto */}
                        <span className={[
                          'w-7 h-7 rounded-lg flex items-center justify-center font-display font-black text-xs shrink-0',
                          puesto === 1
                            ? 'bg-amber-400 text-amber-950 font-extrabold'
                            : puesto === 2
                              ? 'bg-slate-300 text-slate-900 font-extrabold'
                              : puesto === 3
                                ? 'bg-amber-700 text-amber-100 font-extrabold'
                                : 'bg-[var(--bg-accent)] text-[var(--text-secondary)]',
                        ].join(' ')}>
                          #{puesto}
                        </span>

                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <ArtFrame
                            label={alumno.nombreCompleto}
                            shape={alumno.marcoEquipado || 'scroll'}
                            aspectRatio="1/1"
                            avatarId={alumno.avatarEquipado}
                            className="w-14 h-14"
                          />
                          {mascota && (
                            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full border border-[var(--brand-gold)] overflow-hidden bg-[var(--bg-panel)] p-0.5">
                              <img src={mascota.src} alt={mascota.nombre} className="w-full h-full object-cover rounded-full" />
                            </div>
                          )}
                        </div>

                        {/* Textos */}
                        <div className="min-w-0 flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-display font-bold text-sm text-[var(--text-primary)] truncate max-w-[130px]">
                              {alumno.nombreCompleto}
                            </span>
                            {alumno.esYo && (
                              <span className="text-[9px] font-extrabold text-[var(--brand-primary)] bg-[color-mix(in_oklch,var(--brand-primary)_12%,var(--bg-panel))] px-1.5 py-0.5 rounded-md">
                                Tú
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[var(--text-secondary)] truncate">
                            {formatearTitulo(alumno.tituloEquipado) || avatar?.clase}
                          </span>
                          <span className="text-[10px] font-display font-semibold text-amber-600 dark:text-amber-400">
                            Nv. {nivel} • {avatar?.clase}
                          </span>
                        </div>
                      </div>

                      {/* XP & Racha */}
                      <div className="flex flex-col items-end shrink-0">
                        <span className="font-display font-black text-sm text-[var(--brand-primary)]">
                          {alumno.experienciaXP} <span className="text-[10px] text-[var(--text-secondary)]">XP</span>
                        </span>
                        <span className="text-[11px] font-display font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                          <Flame size={12} className="text-amber-500" />
                          {alumno.rachaDiasActivos}d
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              /* Vista en Tabla */
              <div className="overflow-x-auto rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-panel)] shadow-[var(--shadow-c)]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[var(--border-muted)] bg-[var(--bg-accent)] text-xs font-display font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      <th className="py-3 px-4">Puesto</th>
                      <th className="py-3 px-4">Aventurero</th>
                      <th className="py-3 px-4">Título & Arquetipo</th>
                      <th className="py-3 px-4 text-center">Nivel</th>
                      <th className="py-3 px-4 text-center">Mascota</th>
                      <th className="py-3 px-4 text-right">Racha</th>
                      <th className="py-3 px-4 text-right">XP Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-muted)] text-xs">
                    {ranking.map((alumno, idx) => {
                      const puesto = idx + 1;
                      const nivel = calcularNivel(alumno.experienciaXP).nivel;
                      const avatar = getAvatarPorId(alumno.avatarEquipado);
                      const mascota = MASCOTAS_INFO[alumno.mascotaEquipada];

                      return (
                        <tr
                          key={alumno.nombreCompleto}
                          onClick={() => { playParchment(); setSelectedAlumno(alumno); }}
                          className={[
                            'hover:bg-[var(--bg-accent)] transition-colors cursor-pointer',
                            alumno.esYo ? 'bg-[color-mix(in_oklch,var(--brand-primary)_8%,var(--bg-panel))] font-bold' : '',
                          ].join(' ')}
                        >
                          <td className="py-3 px-4 font-display font-black">
                            #{puesto}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <ArtFrame
                                label={alumno.nombreCompleto}
                                shape={alumno.marcoEquipado || 'scroll'}
                                aspectRatio="1/1"
                                avatarId={alumno.avatarEquipado}
                                className="w-10 h-10 shrink-0"
                              />
                              <div>
                                <span className="font-display font-bold text-[var(--text-primary)] block">
                                  {alumno.nombreCompleto}
                                </span>
                                {alumno.esYo && (
                                  <span className="text-[9px] text-[var(--brand-primary)]">¡Eres tú!</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="block font-semibold text-[var(--text-primary)]">
                              {formatearTitulo(alumno.tituloEquipado)}
                            </span>
                            <span className="text-[10px] text-[var(--text-secondary)] font-display">
                              {avatar?.clase}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-display font-bold">
                            <Badge variant="nivel">Nv. {nivel}</Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {mascota ? (
                              <div className="inline-flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                                <img src={mascota.src} alt={mascota.nombre} className="w-6 h-6 object-cover rounded-full border border-[var(--brand-gold)]" />
                                <span className="hidden sm:inline">{mascota.nombre}</span>
                              </div>
                            ) : (
                              <span className="text-[var(--text-secondary)] opacity-50">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-display font-bold text-[var(--brand-emerald)]">
                            {alumno.rachaDiasActivos} días
                          </td>
                          <td className="py-3 px-4 text-right font-display font-black text-sm text-[var(--brand-primary)]">
                            {alumno.experienciaXP}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* ── 5. MODAL DE FICHA DE AVENTURERO (INSPECCIONAR COMPAÑERO) ── */}
      <AnimatePresence>
        {selectedAlumno && (
          <Modal
            isOpen={Boolean(selectedAlumno)}
            onClose={() => setSelectedAlumno(null)}
            title="Ficha de Aventurero del Aula"
            size="md"
          >
            {(() => {
              const avatar = getAvatarPorId(selectedAlumno.avatarEquipado);
              const nivel = calcularNivel(selectedAlumno.experienciaXP).nivel;
              const mascota = MASCOTAS_INFO[selectedAlumno.mascotaEquipada];

              return (
                <div className="flex flex-col gap-5 pb-2">
                  {/* Retrato Grande */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--bg-accent)] to-[var(--bg-panel)] border-2 border-[var(--border)] flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                    <div className="relative shrink-0">
                      <ArtFrame
                        label={selectedAlumno.nombreCompleto}
                        shape={selectedAlumno.marcoEquipado || 'scroll'}
                        aspectRatio="1/1"
                        avatarId={selectedAlumno.avatarEquipado}
                        className="w-28 h-28 shadow-lg"
                      />
                      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                        <Badge variant="nivel">Nv. {nivel}</Badge>
                      </div>
                      {mascota && (
                        <div
                          className="absolute -top-2.5 -right-2.5 z-20 w-11 h-11 rounded-full border-2 border-[var(--brand-gold)] shadow-md overflow-hidden bg-[var(--bg-panel)] p-0.5"
                          title={mascota.nombre}
                        >
                          <img src={mascota.src} alt={mascota.nombre} className="w-full h-full object-cover rounded-full" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <Badge variant="violet">
                          {formatearTitulo(selectedAlumno.tituloEquipado)}
                        </Badge>
                        <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                          {avatar?.clase}
                        </span>
                      </div>
                      <h3 className="font-display font-black text-xl text-[var(--text-primary)]">
                        {selectedAlumno.nombreCompleto}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {avatar?.descripcion}
                      </p>
                    </div>
                  </div>

                  {/* Estadísticas de Aventurero */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-panel)]">
                      <span className="block font-display font-black text-lg text-[var(--brand-primary)]">
                        {selectedAlumno.experienciaXP}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">XP Acumulada</span>
                    </div>

                    <div className="p-3 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-panel)]">
                      <span className="block font-display font-black text-lg text-[var(--brand-emerald)]">
                        {selectedAlumno.rachaDiasActivos}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Días de Racha</span>
                    </div>

                    <div className="p-3 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-panel)]">
                      <span className="block font-display font-black text-lg text-[var(--brand-gold)]">
                        {selectedAlumno.misionesCompletadas ?? 1}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Misiones</span>
                    </div>
                  </div>

                  {/* Sección de Mascota Acompañante */}
                  {mascota ? (
                    <div className="p-3.5 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-accent)] flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full border-2 border-[var(--brand-gold)] overflow-hidden shrink-0 bg-[var(--bg-panel)] p-0.5 shadow-sm">
                        <img src={mascota.src} alt={mascota.nombre} className="w-full h-full object-cover rounded-full" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--brand-gold)] block">
                          Compañero Fiel
                        </span>
                        <h4 className="font-display font-bold text-sm text-[var(--text-primary)]">
                          {mascota.nombre}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                          {mascota.desc}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border border-dashed border-[var(--border-muted)] text-center text-xs text-[var(--text-secondary)]">
                      Este aventurero aún no ha equipado una mascota mística en el Bazar.
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button variant="secondary" size="sm" onClick={() => setSelectedAlumno(null)}>
                      Cerrar Ficha
                    </Button>
                  </div>
                </div>
              );
            })()}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
