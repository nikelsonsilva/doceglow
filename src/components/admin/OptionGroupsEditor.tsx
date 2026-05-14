'use client';

import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export interface OptionItem {
  name: string;
  extra_price: number;
}

export interface OptionGroup {
  name: string;
  min_select: number;
  max_select: number;
  price_mode: 'add' | 'replace';
  sort_order: number;
  options: OptionItem[];
}

interface Props {
  groups: OptionGroup[];
  onChange: (groups: OptionGroup[]) => void;
}

const FOOD_TEMPLATES: { label: string; groups: OptionGroup[] }[] = [
  {
    label: '🍝 Macarronada (Montável)',
    groups: [
      { name: 'Escolha a massa', min_select: 1, max_select: 1, price_mode: 'add', sort_order: 0, options: [
        { name: 'Espaguete', extra_price: 0 }, { name: 'Talharim', extra_price: 0 },
        { name: 'Penne', extra_price: 0 }, { name: 'Fettuccine', extra_price: 0 },
      ]},
      { name: 'Escolha o sabor', min_select: 1, max_select: 1, price_mode: 'add', sort_order: 1, options: [
        { name: 'Carne Moída', extra_price: 0 }, { name: 'Frango Desfiado', extra_price: 0 },
        { name: 'Calabresa', extra_price: 0 }, { name: 'Camarão', extra_price: 5 },
      ]},
      { name: 'Escolha o molho', min_select: 1, max_select: 1, price_mode: 'add', sort_order: 2, options: [
        { name: 'Tomate', extra_price: 0 }, { name: 'Branco', extra_price: 0 },
        { name: 'Rosé', extra_price: 0 }, { name: 'Sem molho', extra_price: 0 },
      ]},
      { name: 'Acompanhamentos', min_select: 0, max_select: 5, price_mode: 'add', sort_order: 3, options: [
        { name: 'Milho', extra_price: 0 }, { name: 'Azeitona', extra_price: 0 },
        { name: 'Cebola', extra_price: 0 }, { name: 'Tomate', extra_price: 0 },
        { name: 'Queijo', extra_price: 2 }, { name: 'Orégano', extra_price: 0 },
      ]},
    ],
  },
  {
    label: '🍔 Hambúrguer (Montável)',
    groups: [
      { name: 'Escolha o pão', min_select: 1, max_select: 1, price_mode: 'add', sort_order: 0, options: [
        { name: 'Brioche', extra_price: 0 }, { name: 'Australiano', extra_price: 0 },
        { name: 'Integral', extra_price: 0 },
      ]},
      { name: 'Ponto da carne', min_select: 1, max_select: 1, price_mode: 'add', sort_order: 1, options: [
        { name: 'Mal passado', extra_price: 0 }, { name: 'Ao ponto', extra_price: 0 },
        { name: 'Bem passado', extra_price: 0 },
      ]},
      { name: 'Adicionais', min_select: 0, max_select: 5, price_mode: 'add', sort_order: 2, options: [
        { name: 'Bacon', extra_price: 3 }, { name: 'Ovo', extra_price: 2 },
        { name: 'Cheddar extra', extra_price: 3 }, { name: 'Onion rings', extra_price: 4 },
      ]},
    ],
  },
  {
    label: '🍕 Pizza (Montável)',
    groups: [
      { name: 'Tamanho', min_select: 1, max_select: 1, price_mode: 'replace', sort_order: 0, options: [
        { name: 'Pequena (4 fatias)', extra_price: 25 }, { name: 'Média (6 fatias)', extra_price: 35 },
        { name: 'Grande (8 fatias)', extra_price: 45 }, { name: 'Família (12 fatias)', extra_price: 60 },
      ]},
      { name: 'Borda', min_select: 1, max_select: 1, price_mode: 'add', sort_order: 1, options: [
        { name: 'Tradicional', extra_price: 0 }, { name: 'Catupiry', extra_price: 5 },
        { name: 'Cheddar', extra_price: 5 },
      ]},
      { name: 'Adicionais', min_select: 0, max_select: 3, price_mode: 'add', sort_order: 2, options: [
        { name: 'Borda recheada', extra_price: 8 }, { name: 'Molho extra', extra_price: 3 },
      ]},
    ],
  },
];

export default function OptionGroupsEditor({ groups, onChange }: Props) {
  const [expandedGroup, setExpandedGroup] = useState<number | null>(groups.length > 0 ? 0 : null);

  const addGroup = () => {
    const newGroup: OptionGroup = {
      name: `Passo ${groups.length + 1}`,
      min_select: 1,
      max_select: 1,
      price_mode: 'add',
      sort_order: groups.length,
      options: [{ name: '', extra_price: 0 }],
    };
    onChange([...groups, newGroup]);
    setExpandedGroup(groups.length);
  };

  const removeGroup = (idx: number) => {
    const updated = groups.filter((_, i) => i !== idx).map((g, i) => ({ ...g, sort_order: i }));
    onChange(updated);
    if (expandedGroup === idx) setExpandedGroup(null);
  };

  const updateGroup = (idx: number, field: string, value: any) => {
    const updated = [...groups];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const addOption = (groupIdx: number) => {
    const updated = [...groups];
    updated[groupIdx] = {
      ...updated[groupIdx],
      options: [...updated[groupIdx].options, { name: '', extra_price: 0 }],
    };
    onChange(updated);
  };

  const removeOption = (groupIdx: number, optIdx: number) => {
    const updated = [...groups];
    updated[groupIdx] = {
      ...updated[groupIdx],
      options: updated[groupIdx].options.filter((_, i) => i !== optIdx),
    };
    onChange(updated);
  };

  const updateOption = (groupIdx: number, optIdx: number, field: string, value: any) => {
    const updated = [...groups];
    const opts = [...updated[groupIdx].options];
    opts[optIdx] = { ...opts[optIdx], [field]: value };
    updated[groupIdx] = { ...updated[groupIdx], options: opts };
    onChange(updated);
  };

  const applyTemplate = (template: typeof FOOD_TEMPLATES[0]) => {
    onChange(template.groups);
    setExpandedGroup(0);
  };

  const moveGroup = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= groups.length) return;
    const updated = [...groups];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    updated.forEach((g, i) => g.sort_order = i);
    onChange(updated);
    setExpandedGroup(newIdx);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-slate-700">Etapas de Montagem</label>
          <p className="text-xs text-slate-400 mt-0.5">Configure os passos que o cliente vai seguir pra montar o pedido</p>
        </div>
      </div>

      {/* Templates */}
      {groups.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800 mb-2">💡 Comece com um modelo pronto:</p>
          <div className="flex flex-wrap gap-2">
            {FOOD_TEMPLATES.map((t, i) => (
              <button key={i} type="button" onClick={() => applyTemplate(t)}
                className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-100 transition">
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Groups */}
      {groups.map((group, gIdx) => (
        <div key={gIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {/* Group Header */}
          <div
            className="flex items-center gap-2 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition"
            onClick={() => setExpandedGroup(expandedGroup === gIdx ? null : gIdx)}
          >
            <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" onClick={(e) => { e.stopPropagation(); moveGroup(gIdx, -1); }}
                disabled={gIdx === 0} className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30">
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); moveGroup(gIdx, 1); }}
                disabled={gIdx === groups.length - 1} className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
              Passo {gIdx + 1}
            </span>
            <span className="text-sm font-medium text-slate-700 truncate flex-1">{group.name || 'Sem nome'}</span>
            <span className="text-xs text-slate-400 shrink-0">{group.options.length} opções</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); removeGroup(gIdx); }}
              className="p-1 text-slate-400 hover:text-red-500 transition shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${expandedGroup === gIdx ? 'rotate-180' : ''}`} />
          </div>

          {/* Group Content */}
          {expandedGroup === gIdx && (
            <div className="p-4 space-y-3 border-t border-slate-100">
              {/* Group name */}
              <input type="text" value={group.name} placeholder="Ex: Escolha a massa"
                onChange={e => updateGroup(gIdx, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />

              {/* Min/Max select */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-500">Mín.</label>
                  <input type="number" min="0" value={group.min_select}
                    onChange={e => updateGroup(gIdx, 'min_select', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Máx.</label>
                  <input type="number" min="1" value={group.max_select}
                    onChange={e => updateGroup(gIdx, 'max_select', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Preço</label>
                  <select value={group.price_mode}
                    onChange={e => updateGroup(gIdx, 'price_mode', e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="add">Somar (+R$)</option>
                    <option value="replace">Substituir preço</option>
                  </select>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Opções</p>
                {group.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input type="text" value={opt.name} placeholder={`Opção ${oIdx + 1}`}
                      onChange={e => updateOption(gIdx, oIdx, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    <div className="relative w-24 shrink-0">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">+R$</span>
                      <input type="number" step="0.01" min="0" value={opt.extra_price || ''}
                        onChange={e => updateOption(gIdx, oIdx, 'extra_price', parseFloat(e.target.value) || 0)}
                        placeholder="0,00"
                        className="w-full pl-9 pr-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>
                    <button type="button" onClick={() => removeOption(gIdx, oIdx)}
                      disabled={group.options.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition disabled:opacity-30">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addOption(gIdx)}
                  className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary-hover transition">
                  <Plus className="w-3.5 h-3.5" /> Adicionar opção
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add group button */}
      <button type="button" onClick={addGroup}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition">
        <Plus className="w-4 h-4" /> Adicionar etapa de montagem
      </button>
    </div>
  );
}
