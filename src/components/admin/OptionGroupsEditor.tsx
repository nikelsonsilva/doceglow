'use client';

import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
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

const FOOD_TEMPLATES: { label: string; emoji: string; groups: OptionGroup[] }[] = [
  {
    label: 'Macarronada',
    emoji: '🍝',
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
    label: 'Hambúrguer',
    emoji: '🍔',
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
    label: 'Pizza',
    emoji: '🍕',
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
      name: '',
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
      {/* Templates - show when empty */}
      {groups.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-slate-700">Comece com um modelo pronto</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {FOOD_TEMPLATES.map((t, i) => (
              <button key={i} type="button" onClick={() => applyTemplate(t)}
                className="flex flex-col items-center gap-1.5 p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-primary hover:bg-primary/5 hover:shadow-md hover:shadow-primary/10 transition-all duration-200 group">
                <span className="text-2xl group-hover:scale-110 transition-transform">{t.emoji}</span>
                <span className="text-xs">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Groups list */}
      {groups.length > 0 && (
        <div className="space-y-3">
          {groups.map((group, gIdx) => {
            const isExpanded = expandedGroup === gIdx;
            const validOptions = group.options.filter(o => o.name.trim());
            
            return (
              <div key={gIdx}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isExpanded 
                    ? 'border-primary/30 shadow-lg shadow-primary/5 bg-white' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {/* Group Header */}
                <div
                  className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
                    isExpanded ? 'bg-gradient-to-r from-primary/5 to-transparent' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setExpandedGroup(isExpanded ? null : gIdx)}
                >
                  {/* Drag handle + reorder */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <GripVertical className="w-4 h-4 text-slate-300" />
                    <div className="flex flex-col">
                      <button type="button" onClick={(e) => { e.stopPropagation(); moveGroup(gIdx, -1); }}
                        disabled={gIdx === 0}
                        className="p-0.5 text-slate-400 hover:text-primary disabled:opacity-20 transition-colors">
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); moveGroup(gIdx, 1); }}
                        disabled={gIdx === groups.length - 1}
                        className="p-0.5 text-slate-400 hover:text-primary disabled:opacity-20 transition-colors">
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Step badge */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isExpanded 
                      ? 'bg-primary text-white' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {gIdx + 1}
                  </div>

                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {group.name || <span className="text-slate-400 italic">Sem nome</span>}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {validOptions.length} {validOptions.length === 1 ? 'opção' : 'opções'}
                      {group.min_select > 0 && <span> · Obrigatório</span>}
                      {group.price_mode === 'replace' && <span> · Substitui preço</span>}
                    </p>
                  </div>

                  {/* Actions */}
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeGroup(gIdx); }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isExpanded ? 'rotate-180' : ''
                  }`} />
                </div>

                {/* Group Content - Expanded */}
                {isExpanded && (
                  <div className="border-t border-slate-100 animate-[fadeSlideDown_0.2s_ease-out]">
                    {/* Config area */}
                    <div className="p-4 space-y-4">
                      {/* Group name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                          Nome da Etapa
                        </label>
                        <input type="text" value={group.name} placeholder="Ex: Escolha a massa"
                          onChange={e => updateGroup(gIdx, 'name', e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-slate-300" />
                      </div>

                      {/* Settings row */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Mín.
                          </label>
                          <input type="number" min="0" value={group.min_select}
                            onChange={e => updateGroup(gIdx, 'min_select', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Máx.
                          </label>
                          <input type="number" min="1" value={group.max_select}
                            onChange={e => updateGroup(gIdx, 'max_select', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Preço
                          </label>
                          <select value={group.price_mode}
                            onChange={e => updateGroup(gIdx, 'price_mode', e.target.value)}
                            className="w-full px-2 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-white transition-all">
                            <option value="add">Somar (+R$)</option>
                            <option value="replace">Substituir</option>
                          </select>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-100" />

                      {/* Options */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Opções</p>
                          <span className="text-[11px] text-slate-400">{group.options.length} itens</span>
                        </div>
                        {group.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2 group/opt">
                            <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center shrink-0">
                              <span className="text-[10px] text-slate-400 font-medium">{oIdx + 1}</span>
                            </div>
                            <input type="text" value={opt.name} placeholder={`Opção ${oIdx + 1}`}
                              onChange={e => updateOption(gIdx, oIdx, 'name', e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-slate-300" />
                            <div className="relative w-24 shrink-0">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium">+R$</span>
                              <input type="number" step="0.01" min="0" value={opt.extra_price || ''}
                                onChange={e => updateOption(gIdx, oIdx, 'extra_price', parseFloat(e.target.value) || 0)}
                                placeholder="0,00"
                                className="w-full pl-9 pr-2 py-2 border border-slate-200 rounded-lg text-sm text-right font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                            </div>
                            <button type="button" onClick={() => removeOption(gIdx, oIdx)}
                              disabled={group.options.length <= 1}
                              className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-20 opacity-0 group-hover/opt:opacity-100">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addOption(gIdx)}
                          className="flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary-hover transition-colors mt-1 px-1">
                          <Plus className="w-3.5 h-3.5" /> Adicionar opção
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add group button */}
      <button type="button" onClick={addGroup}
        className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-200 rounded-xl text-sm font-semibold text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
        <Plus className="w-4 h-4" /> Nova etapa de montagem
      </button>
    </div>
  );
}
