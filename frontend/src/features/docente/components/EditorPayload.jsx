import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import Button from '../../../components/ui/Button';

/**
 * EditorPayload — Editor interactivo de preguntas y opciones del payloadJson
 */
function EditorPayload({ payload, onChange }) {
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

    // Si la opción modificada era la respuesta correcta, actualizamos el puntero de respuesta correcta
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
        <h3 className="text-base font-display font-bold text-[var(--text-primary)]">
          Cuestionario ({preguntas.length} {preguntas.length === 1 ? 'pregunta' : 'preguntas'})
        </h3>
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
                className="text-[var(--brand-crimson)] hover:opacity-80 p-1 transition-opacity"
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
                        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all',
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
                        className="text-[var(--text-muted)] hover:text-[var(--brand-crimson)] p-1"
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
                className="self-start text-xs font-display font-semibold text-[var(--brand-primary)] hover:underline mt-1 flex items-center gap-1"
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

export default EditorPayload;
