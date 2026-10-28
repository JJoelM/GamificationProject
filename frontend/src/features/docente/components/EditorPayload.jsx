import { useState } from 'react';
import {
  Plus, Trash2, CheckCircle2, Swords, Clock, AlertTriangle,
  HelpCircle, Shield, Sparkles, RefreshCw, MoveUp, MoveDown
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

/**
 * ───────────────────────────────────────────────────────────────────
 * 1. EDITOR PARA OPCIÓN MÚLTIPLE (QUIZ CLÁSICO)
 * ───────────────────────────────────────────────────────────────────
 */
function EditorOpcionMultiple({ payload, onChange }) {
  const preguntas = payload?.preguntas ?? [];

  const handleEnunciadoChange = (index, valor) => {
    const updated = [...preguntas];
    updated[index] = { ...updated[index], enunciado: valor };
    onChange({ ...payload, preguntas: updated });
  };

  const handleExplicacionChange = (index, valor) => {
    const updated = [...preguntas];
    updated[index] = { ...updated[index], explicacion: valor };
    onChange({ ...payload, preguntas: updated });
  };

  const handleOpcionChange = (pIndex, oIndex, valor) => {
    const updated = [...preguntas];
    const opciones = [...(updated[pIndex].opciones ?? [])];
    const valorAnterior = opciones[oIndex];
    opciones[oIndex] = valor;

    let respuestaCorrecta = updated[pIndex].respuestaCorrecta;
    if (respuestaCorrecta === valorAnterior) {
      respuestaCorrecta = valor;
    }

    updated[pIndex] = { ...updated[pIndex], opciones, respuestaCorrecta };
    onChange({ ...payload, preguntas: updated });
  };

  const handleSetCorrecta = (pIndex, opcion) => {
    const updated = [...preguntas];
    updated[pIndex] = { ...updated[pIndex], respuestaCorrecta: opcion };
    onChange({ ...payload, preguntas: updated });
  };

  const handleAddOpcion = (pIndex) => {
    const updated = [...preguntas];
    const opciones = [...(updated[pIndex].opciones ?? []), `Nueva opción ${updated[pIndex].opciones?.length + 1}`];
    updated[pIndex] = { ...updated[pIndex], opciones };
    onChange({ ...payload, preguntas: updated });
  };

  const handleRemoveOpcion = (pIndex, oIndex) => {
    const updated = [...preguntas];
    const opciones = updated[pIndex].opciones.filter((_, i) => i !== oIndex);
    let respuestaCorrecta = updated[pIndex].respuestaCorrecta;
    if (!opciones.includes(respuestaCorrecta)) {
      respuestaCorrecta = opciones[0] || '';
    }
    updated[pIndex] = { ...updated[pIndex], opciones, respuestaCorrecta };
    onChange({ ...payload, preguntas: updated });
  };

  const handleAddPregunta = () => {
    const nuevaPregunta = {
      enunciado: 'Nueva pregunta...',
      opciones: ['Opción A', 'Opción B', 'Opción C'],
      respuestaCorrecta: 'Opción A',
      explicacion: 'Explicación didáctica de por qué es la correcta.',
    };
    onChange({ ...payload, preguntas: [...preguntas, nuevaPregunta] });
  };

  const handleRemovePregunta = (pIndex) => {
    const updated = preguntas.filter((_, i) => i !== pIndex);
    onChange({ ...payload, preguntas: updated });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle size={18} className="text-[var(--brand-primary)]" />
          <h3 className="text-base font-display font-bold text-[var(--text-primary)]">
            Cuestionario ({preguntas.length} {preguntas.length === 1 ? 'pregunta' : 'preguntas'})
          </h3>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleAddPregunta}
        >
          <Plus size={14} />
          Agregar Pregunta
        </Button>
      </div>

      {preguntas.map((pregunta, pIndex) => (
        <div
          key={pIndex}
          className="p-5 rounded-[12px_16px_14px_14px] border-2 border-[var(--border)] bg-[var(--bg-panel)] shadow-[2px_2px_0px_var(--border)] flex flex-col gap-4"
        >
          {/* Header pregunta */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--brand-primary)]">
              Pregunta {pIndex + 1}
            </span>
            {preguntas.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemovePregunta(pIndex)}
                className="text-[var(--brand-crimson)] hover:opacity-80 p-1 transition-opacity cursor-pointer"
                title="Eliminar pregunta"
                aria-label={`Eliminar pregunta ${pIndex + 1}`}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* Enunciado */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Enunciado</label>
            <input
              type="text"
              value={pregunta.enunciado}
              onChange={(e) => handleEnunciadoChange(pIndex, e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-primary)] outline-none"
              placeholder="Enunciado de la pregunta"
            />
          </div>

          {/* Opciones */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Opciones (marca con el círculo verde la correcta)
            </label>
            <div className="flex flex-col gap-2">
              {pregunta.opciones?.map((opcion, oIndex) => {
                const isCorrect = opcion === pregunta.respuestaCorrecta;
                return (
                  <div key={oIndex} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetCorrecta(pIndex, opcion)}
                      className={[
                        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer',
                        isCorrect
                          ? 'border-[var(--brand-emerald)] bg-[var(--brand-emerald)] text-white shadow-[0_0_8px_var(--brand-emerald)]'
                          : 'border-[var(--border-muted)] bg-[var(--bg-base)] text-transparent hover:border-[var(--brand-emerald)]',
                      ].join(' ')}
                      title={isCorrect ? 'Respuesta correcta' : 'Marcar como correcta'}
                      aria-label={`Marcar opción ${oIndex + 1} como correcta`}
                    >
                      <CheckCircle2 size={16} className={isCorrect ? 'block' : 'opacity-0'} />
                    </button>
                    <input
                      type="text"
                      value={opcion}
                      onChange={(e) => handleOpcionChange(pIndex, oIndex, e.target.value)}
                      className={[
                        'flex-1 px-3 py-1.5 rounded-lg border text-sm bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] outline-none',
                        isCorrect ? 'border-[var(--brand-emerald)] font-semibold' : 'border-[var(--border)]',
                      ].join(' ')}
                    />
                    {pregunta.opciones.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOpcion(pIndex, oIndex)}
                        className="text-[var(--text-muted)] hover:text-[var(--brand-crimson)] p-1 cursor-pointer"
                        aria-label={`Eliminar opción ${oIndex + 1}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {pregunta.opciones?.length < 6 && (
              <button
                type="button"
                onClick={() => handleAddOpcion(pIndex)}
                className="self-start text-xs font-display font-semibold text-[var(--brand-primary)] hover:underline mt-1 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Agregar Opción
              </button>
            )}
          </div>

          {/* Explicación didáctica */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Explicación didáctica (se mostrará al alumno tras resolver)</label>
            <textarea
              rows={2}
              value={pregunta.explicacion || ''}
              onChange={(e) => handleExplicacionChange(pIndex, e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-xs focus:border-[var(--brand-primary)] outline-none resize-y"
              placeholder="Explicación educativa que se mostrará al alumno cuando responda la pregunta..."
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * ───────────────────────────────────────────────────────────────────
 * 2. EDITOR PARA BATALLA DE JEFE (FASES + DAÑO DE 100 HP)
 * ───────────────────────────────────────────────────────────────────
 */
function EditorBatallaDeJefe({ payload, onChange }) {
  const fases = payload?.fases ?? [];
  const totalDanio = fases.reduce((acc, f) => acc + (Number(f.danio) || 0), 0);
  const esDanioExacto = totalDanio === 100;

  const handleJefeChange = (campo, valor) => {
    onChange({ ...payload, [campo]: valor });
  };

  const handleFaseFieldChange = (fIndex, campo, valor) => {
    const updated = [...fases];
    updated[fIndex] = { ...updated[fIndex], [campo]: valor };
    onChange({ ...payload, fases: updated });
  };

  const handleDanioChange = (fIndex, valor) => {
    const num = Math.max(0, parseInt(valor, 10) || 0);
    handleFaseFieldChange(fIndex, 'danio', num);
  };

  const handleOpcionChange = (fIndex, oIndex, valor) => {
    const updated = [...fases];
    const opciones = [...(updated[fIndex].opciones ?? [])];
    const anterior = opciones[oIndex];
    opciones[oIndex] = valor;

    let respuestaCorrecta = updated[fIndex].respuestaCorrecta;
    if (respuestaCorrecta === anterior) {
      respuestaCorrecta = valor;
    }

    updated[fIndex] = { ...updated[fIndex], opciones, respuestaCorrecta };
    onChange({ ...payload, fases: updated });
  };

  const handleSetCorrecta = (fIndex, opcion) => {
    const updated = [...fases];
    updated[fIndex] = { ...updated[fIndex], respuestaCorrecta: opcion };
    onChange({ ...payload, fases: updated });
  };

  const handleAddOpcion = (fIndex) => {
    const updated = [...fases];
    const opciones = [...(updated[fIndex].opciones ?? []), `Nueva opción ${updated[fIndex].opciones?.length + 1}`];
    updated[fIndex] = { ...updated[fIndex], opciones };
    onChange({ ...payload, fases: updated });
  };

  const handleRemoveOpcion = (fIndex, oIndex) => {
    const updated = [...fases];
    const opciones = updated[fIndex].opciones.filter((_, i) => i !== oIndex);
    let respuestaCorrecta = updated[fIndex].respuestaCorrecta;
    if (!opciones.includes(respuestaCorrecta)) {
      respuestaCorrecta = opciones[0] || '';
    }
    updated[fIndex] = { ...updated[fIndex], opciones, respuestaCorrecta };
    onChange({ ...payload, fases: updated });
  };

  const handleAddFase = () => {
    const nuevaFaseNum = fases.length + 1;
    const nuevaFase = {
      fase: nuevaFaseNum,
      narrativa: `La criatura adopta una nueva postura defensiva en la fase ${nuevaFaseNum}...`,
      pregunta: 'Pregunta táctica de la fase...',
      opciones: ['Opción A', 'Opción B', 'Opción C'],
      respuestaCorrecta: 'Opción A',
      explicacion: 'Explicación del golpe certero contra el jefe.',
      danio: 25,
    };
    onChange({ ...payload, fases: [...fases, nuevaFase] });
  };

  const handleRemoveFase = (fIndex) => {
    const updated = fases
      .filter((_, i) => i !== fIndex)
      .map((f, idx) => ({ ...f, fase: idx + 1 }));
    onChange({ ...payload, fases: updated });
  };

  // Rebalanceo equitativo automático para sumar exactamente 100 HP
  const handleReequilibrarDanio = () => {
    if (fases.length === 0) return;
    const n = fases.length;
    const base = Math.floor(100 / n);
    const resto = 100 % n;

    const updated = fases.map((f, idx) => ({
      ...f,
      danio: base + (idx < resto ? 1 : 0),
    }));

    onChange({ ...payload, fases: updated });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Datos del Jefe */}
      <div className="p-5 rounded-[12px_16px_14px_14px] border-2 border-[var(--brand-crimson)]/30 bg-[var(--bg-panel)] shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Swords size={20} className="text-[var(--brand-crimson)]" />
          <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
            Perfil del Jefe Pedagógico
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Nombre del Jefe</label>
            <input
              type="text"
              value={payload?.nombreJefe || ''}
              onChange={(e) => handleJefeChange('nombreJefe', e.target.value)}
              placeholder="Ej: El Espectro del Sofisma"
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-crimson)] outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Descripción Narrativa</label>
            <input
              type="text"
              value={payload?.descripcionJefe || ''}
              onChange={(e) => handleJefeChange('descripcionJefe', e.target.value)}
              placeholder="Ej: Una criatura ancestral que distorsiona los principios de..."
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-crimson)] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Barra de Validación de Daño Total */}
      <div className={[
        'p-3.5 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3',
        esDanioExacto
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-amber-500/10 border-amber-500/40 text-amber-300',
      ].join(' ')}>
        <div className="flex items-center gap-2.5">
          {esDanioExacto ? (
            <CheckCircle2 size={18} className="text-[var(--brand-emerald)] shrink-0" />
          ) : (
            <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          )}
          <div>
            <span className="text-xs font-display font-bold uppercase tracking-wider block">
              Daño Acumulado: {totalDanio} / 100 HP
            </span>
            <p className="text-[11px] opacity-90">
              {esDanioExacto
                ? '¡Perfecto! El daño acumulado suma exactamente 100 HP (70 HP victoria menor, 100 HP victoria total).'
                : `Ajustá el daño de cada fase para sumar exactamente 100 HP (diferencia: ${100 - totalDanio} HP).`}
            </p>
          </div>
        </div>

        {!esDanioExacto && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleReequilibrarDanio}
            className="shrink-0 text-xs border border-amber-500/40 hover:bg-amber-500/20"
          >
            <RefreshCw size={13} />
            Equilibrar a 100 HP
          </Button>
        )}
      </div>

      {/* Listado de Fases */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-display font-bold text-[var(--text-primary)]">
          Fases de Combate ({fases.length} {fases.length === 1 ? 'fase' : 'fases'})
        </h3>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleAddFase}
        >
          <Plus size={14} />
          Agregar Fase
        </Button>
      </div>

      {fases.map((fase, fIndex) => (
        <div
          key={fIndex}
          className="p-5 rounded-[12px_16px_14px_14px] border-2 border-[var(--border)] bg-[var(--bg-panel)] shadow-[2px_2px_0px_var(--border)] flex flex-col gap-4"
        >
          {/* Header Fase */}
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border-muted)] pb-2.5">
            <div className="flex items-center gap-2">
              <Badge variant="racha">Fase {fase.fase || fIndex + 1}</Badge>
              <span className="text-xs font-display font-semibold text-[var(--text-muted)]">
                Golpe táctico
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[var(--bg-base)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
                <label className="text-xs font-display font-bold text-[var(--brand-crimson)]">Daño:</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={fase.danio ?? 25}
                  onChange={(e) => handleDanioChange(fIndex, e.target.value)}
                  className="w-12 text-center text-xs font-display font-bold bg-transparent outline-none text-[var(--text-primary)]"
                />
                <span className="text-[10px] text-[var(--text-muted)] font-display">HP</span>
              </div>
              {fases.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveFase(fIndex)}
                  className="text-[var(--brand-crimson)] hover:opacity-80 p-1 transition-opacity cursor-pointer"
                  title="Eliminar fase"
                  aria-label={`Eliminar fase ${fIndex + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Narrativa de la Fase */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Narrativa / Comportamiento del Jefe en esta fase</label>
            <textarea
              rows={2}
              value={fase.narrativa || ''}
              onChange={(e) => handleFaseFieldChange(fIndex, 'narrativa', e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-xs focus:border-[var(--brand-crimson)] outline-none resize-y italic"
              placeholder="Narrativa de la fase..."
            />
          </div>

          {/* Pregunta */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Pregunta para acertar el ataque</label>
            <input
              type="text"
              value={fase.pregunta || ''}
              onChange={(e) => handleFaseFieldChange(fIndex, 'pregunta', e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-crimson)] outline-none"
              placeholder="Pregunta táctica..."
            />
          </div>

          {/* Opciones */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Opciones de respuesta (marca con el círculo verde el ataque certero)
            </label>
            <div className="flex flex-col gap-2">
              {fase.opciones?.map((opcion, oIndex) => {
                const isCorrect = opcion === fase.respuestaCorrecta;
                return (
                  <div key={oIndex} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetCorrecta(fIndex, opcion)}
                      className={[
                        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer',
                        isCorrect
                          ? 'border-[var(--brand-emerald)] bg-[var(--brand-emerald)] text-white shadow-[0_0_8px_var(--brand-emerald)]'
                          : 'border-[var(--border-muted)] bg-[var(--bg-base)] text-transparent hover:border-[var(--brand-emerald)]',
                      ].join(' ')}
                      title={isCorrect ? 'Ataque certero' : 'Marcar como certero'}
                      aria-label={`Marcar opción ${oIndex + 1} como correcta`}
                    >
                      <CheckCircle2 size={16} className={isCorrect ? 'block' : 'opacity-0'} />
                    </button>
                    <input
                      type="text"
                      value={opcion}
                      onChange={(e) => handleOpcionChange(fIndex, oIndex, e.target.value)}
                      className={[
                        'flex-1 px-3 py-1.5 rounded-lg border text-sm bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--brand-crimson)] outline-none',
                        isCorrect ? 'border-[var(--brand-emerald)] font-semibold' : 'border-[var(--border)]',
                      ].join(' ')}
                    />
                    {fase.opciones.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOpcion(fIndex, oIndex)}
                        className="text-[var(--text-muted)] hover:text-[var(--brand-crimson)] p-1 cursor-pointer"
                        aria-label={`Eliminar opción ${oIndex + 1}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {fase.opciones?.length < 6 && (
              <button
                type="button"
                onClick={() => handleAddOpcion(fIndex)}
                className="self-start text-xs font-display font-semibold text-[var(--brand-crimson)] hover:underline mt-1 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Agregar Opción
              </button>
            )}
          </div>

          {/* Explicación didáctica */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Explicación del contragolpe / respuesta correcta</label>
            <textarea
              rows={2}
              value={fase.explicacion || ''}
              onChange={(e) => handleFaseFieldChange(fIndex, 'explicacion', e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-xs focus:border-[var(--brand-crimson)] outline-none resize-y"
              placeholder="Explicación pedagógica de por qué este concepto debilita al jefe..."
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * ───────────────────────────────────────────────────────────────────
 * 3. EDITOR PARA LÍNEA TEMPORAL (HITOS + ANOMALÍA CULPABLE)
 * ───────────────────────────────────────────────────────────────────
 */
function EditorLineaTemporal({ payload, onChange }) {
  const eventos = payload?.eventosDesordenados ?? [];
  const culpableId = payload?.eventoCulpableId || '';

  const handleFieldChange = (campo, valor) => {
    onChange({ ...payload, [campo]: valor });
  };

  const handleEventoChange = (index, campo, valor) => {
    const updated = [...eventos];
    updated[index] = { ...updated[index], [campo]: valor };
    onChange({ ...payload, eventosDesordenados: updated });
  };

  const handleMoverEvento = (index, direccion) => {
    const targetIndex = index + direccion;
    if (targetIndex < 0 || targetIndex >= eventos.length) return;

    const updated = [...eventos];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Actualizar ordenCorrecto según la nueva posición
    const recalibrado = updated.map((e, idx) => ({ ...e, ordenCorrecto: idx + 1 }));
    onChange({ ...payload, eventosDesordenados: recalibrado });
  };

  const handleAddEvento = () => {
    const nuevoId = `ev${eventos.length + 1}`;
    const nuevoEvento = {
      id: nuevoId,
      descripcion: 'Nuevo acontecimiento histórico o proceso...',
      fechaAproximada: 'Año / Momento aproximado',
      ordenCorrecto: eventos.length + 1,
    };
    onChange({
      ...payload,
      eventosDesordenados: [...eventos, nuevoEvento],
      eventoCulpableId: culpableId || nuevoId,
    });
  };

  const handleRemoveEvento = (index) => {
    const eliminado = eventos[index];
    const updated = eventos
      .filter((_, i) => i !== index)
      .map((e, idx) => ({ ...e, ordenCorrecto: idx + 1 }));

    let nuevoCulpable = culpableId;
    if (culpableId === eliminado?.id) {
      nuevoCulpable = updated[0]?.id || '';
    }

    onChange({
      ...payload,
      eventosDesordenados: updated,
      eventoCulpableId: nuevoCulpable,
    });
  };

  const tieneCulpableValido = eventos.some((e) => e.id === culpableId);

  return (
    <div className="flex flex-col gap-6">
      {/* Datos de Anomalía Temporal */}
      <div className="p-5 rounded-[12px_16px_14px_14px] border-2 border-[var(--brand-violet)]/30 bg-[var(--bg-panel)] shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-[var(--brand-violet)]" />
          <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
            Configuración de la Anomalía Temporal
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Descripción de la Paradoja / Estado Erróneo</label>
            <textarea
              rows={2}
              value={payload?.estadoErroneoDescripcion || ''}
              onChange={(e) => handleFieldChange('estadoErroneoDescripcion', e.target.value)}
              placeholder="Ej: En los registros históricos, el Congreso de Tucumán figura antes de la Revolución de Mayo..."
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-violet)] outline-none resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Pista Didáctica del Grimorio</label>
              <input
                type="text"
                value={payload?.pistaDidactica || ''}
                onChange={(e) => handleFieldChange('pistaDidactica', e.target.value)}
                placeholder="Ej: Recuerda qué suceso desencadenó la necesidad de declarar la independencia..."
                className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-violet)] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Acontecimiento Culpable (Causa Raíz)
              </label>
              <select
                value={culpableId}
                onChange={(e) => handleFieldChange('eventoCulpableId', e.target.value)}
                className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-violet)] outline-none cursor-pointer"
              >
                {eventos.map((e, idx) => (
                  <option key={e.id || idx} value={e.id}>
                    Hito #{e.ordenCorrecto ?? idx + 1}: {e.descripcion?.slice(0, 45)}...
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de Culpable */}
      {!tieneCulpableValido && eventos.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          <span>Selecciona un evento culpable válido para que el alumno pueda identificar la anomalía.</span>
        </div>
      )}

      {/* Lista de Eventos Cronológicos */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-display font-bold text-[var(--text-primary)]">
          Secuencia Cronológica ({eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'})
        </h3>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleAddEvento}
        >
          <Plus size={14} />
          Agregar Evento
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {eventos.map((ev, eIndex) => {
          const esCulpable = ev.id === culpableId;
          return (
            <div
              key={ev.id || eIndex}
              className={[
                'p-4 rounded-xl border-2 bg-[var(--bg-panel)] flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all',
                esCulpable
                  ? 'border-[var(--brand-violet)] shadow-[0_0_12px_color-mix(in_oklch,var(--brand-violet)_20%,transparent)]'
                  : 'border-[var(--border)]',
              ].join(' ')}
            >
              {/* Controles de orden */}
              <div className="flex sm:flex-col items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMoverEvento(eIndex, -1)}
                  disabled={eIndex === 0}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
                  title="Subir en orden cronológico"
                >
                  <MoveUp size={14} />
                </button>
                <span className="w-6 h-6 rounded-full bg-[var(--brand-violet)] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {ev.ordenCorrecto ?? eIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleMoverEvento(eIndex, 1)}
                  disabled={eIndex === eventos.length - 1}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
                  title="Bajar en orden cronológico"
                >
                  <MoveDown size={14} />
                </button>
              </div>

              {/* Campos */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={ev.descripcion || ''}
                    onChange={(e) => handleEventoChange(eIndex, 'descripcion', e.target.value)}
                    placeholder="Descripción del suceso histórico..."
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-violet)] outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={ev.fechaAproximada || ''}
                    onChange={(e) => handleEventoChange(eIndex, 'fechaAproximada', e.target.value)}
                    placeholder="Fecha o época..."
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-xs focus:border-[var(--brand-violet)] outline-none"
                  />
                </div>
              </div>

              {/* Tag culpable y botón borrar */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {esCulpable ? (
                  <Badge variant="violet">Causa Raíz</Badge>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleFieldChange('eventoCulpableId', ev.id)}
                    className="text-[11px] font-display text-[var(--text-muted)] hover:text-[var(--brand-violet)] underline cursor-pointer"
                  >
                    Marcar culpable
                  </button>
                )}
                {eventos.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEvento(eIndex)}
                    className="text-[var(--text-muted)] hover:text-[var(--brand-crimson)] p-1 cursor-pointer"
                    title="Eliminar evento"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ───────────────────────────────────────────────────────────────────
 * COMPONENTE PRINCIPAL: EditorPayload
 * Despacha al editor correspondiente según tipoPlantilla o contenido del payload
 * ───────────────────────────────────────────────────────────────────
 */
function EditorPayload({ payload, onChange, tipoPlantilla }) {
  const tipo = tipoPlantilla
    || (payload?.fases ? 'BatallaDeJefe' : payload?.eventosDesordenados ? 'LineaTemporal' : 'OpcionMultiple');

  if (tipo === 'BatallaDeJefe') {
    return <EditorBatallaDeJefe payload={payload} onChange={onChange} />;
  }

  if (tipo === 'LineaTemporal') {
    return <EditorLineaTemporal payload={payload} onChange={onChange} />;
  }

  return <EditorOpcionMultiple payload={payload} onChange={onChange} />;
}

export { EditorOpcionMultiple, EditorBatallaDeJefe, EditorLineaTemporal };
export default EditorPayload;
