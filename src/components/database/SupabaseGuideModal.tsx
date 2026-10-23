import React, { useState } from 'react';
import { Database, Check, Copy, ExternalLink, X } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyPath = () => {
    navigator.clipboard.writeText('C:\\Desarrollos Propios\\DulceTaller-App\\supabase\\full_schema_and_seed.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#fff8f2] rounded-2xl border border-[#dec0b6] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#dec0b6] bg-[#f5ede3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1c120c] text-white rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1c120c]">
                Configuración de Base de Datos Supabase
              </h3>
              <p className="text-xs text-[#7c5641]">
                Persistencia real en la nube con PostgreSQL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7c5641] hover:bg-[#efe7dd]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#1c120c]">
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            isSupabaseConfigured
              ? 'bg-[#ebffe8] border-[#aecfae] text-[#446147]'
              : 'bg-[#fef3c7] border-[#fde68a] text-[#92400e]'
          }`}>
            <span className="font-bold">
              {isSupabaseConfigured
                ? 'Conexión activa con Supabase.'
                : 'Modo Desarrollo / Demostrativo Activo (Sin credenciales en .env)'}
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#9d3c0c] uppercase tracking-wider">
              Pasos para conectar tu proyecto de Supabase en 2 minutos:
            </h4>

            <ol className="list-decimal list-inside space-y-2 text-xs text-[#57423a] font-medium leading-relaxed">
              <li>
                Entra a <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#9d3c0c] font-bold underline inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a> y crea un proyecto gratuito (ej: <code className="bg-[#efe7dd] px-1.5 py-0.5 rounded text-[#1c120c]">dulce-taller-pos</code>).
              </li>
              <li>
                En el panel lateral izquierdo de Supabase, entra a <strong>SQL Editor</strong> &rarr; <strong>New Query</strong>.
              </li>
              <li>
                Copia y pega el contenido completo del archivo ya generado en tu proyecto:
                <div className="my-2 p-2.5 rounded-xl bg-[#efe7dd] border border-[#dec0b6] font-mono text-[11px] text-[#1c120c] flex items-center justify-between">
                  <span>supabase\full_schema_and_seed.sql</span>
                  <button
                    onClick={handleCopyPath}
                    className="flex items-center gap-1 text-xs font-bold text-[#9d3c0c] hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#446147]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Ruta Copiada' : 'Copiar Ruta'}</span>
                  </button>
                </div>
                Haz clic en <strong>Run</strong> en Supabase para crear las tablas, recetas y la función RPC.
              </li>
              <li>
                Ve a <strong>Project Settings</strong> &rarr; <strong>API</strong> en Supabase, copia la <strong>Project URL</strong> y la <strong>anon public key</strong>.
              </li>
              <li>
                Pégalas en tu archivo <code className="bg-[#efe7dd] px-1.5 py-0.5 rounded text-[#1c120c]">.env</code>:
                <div className="mt-2 p-3 bg-[#1c120c] text-white rounded-xl font-mono text-[11px] space-y-1">
                  <p>VITE_SUPABASE_URL=https://xyzcompany.supabase.co</p>
                  <p>VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="p-3.5 bg-[#f5ede3] rounded-xl border border-[#dec0b6] text-xs text-[#7c5641]">
            <strong className="text-[#1c120c]">Nota importante:</strong> Mientras tanto, la aplicación es 100% interactiva con los datos de pastelería y recetas reales de Dulce Taller ya inicializados para demostración y evaluación docente.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#dec0b6] bg-[#f5ede3] text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold shadow-md hover:bg-[#7f2b00]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
