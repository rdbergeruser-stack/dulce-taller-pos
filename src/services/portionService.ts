import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Preparation } from '../types/database';
import { recipeService } from './recipeService';

/**
 * Normaliza nombres para comparación flexible entre porción y torta entera madre
 * Ej: "Porción Lemon Pie" -> "lemon pie"
 *     "Lemon Pie (Torta Entera)" -> "lemon pie"
 */
export function normalizeFlavorName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita tildes
    .replace(/porci[oó]n\s+(de\s+)?/gi, '')
    .replace(/\s*\(torta\s+entera\)/gi, '')
    .replace(/\s*\(entera\)/gi, '')
    .replace(/\s*torta\s+entera/gi, '')
    .replace(/\s*entera/gi, '')
    .replace(/\s*torta/gi, '')
    .trim();
}

/**
 * Encuentra la Torta Entera madre correspondiente a una porción
 */
export function findMotherPreparation(portionPrep: Preparation, allPreps: Preparation[]): Preparation | null {
  if (portionPrep.unit_type !== 'porcion') return null;

  // 1. Buscar si hay código explícito en la descripción [TORTA_MADRE:CODIGO/ID]
  if (portionPrep.description) {
    const match = portionPrep.description.match(/\[TORTA_MADRE:([^\]]+)\]/i);
    if (match) {
      const target = match[1].trim();
      const found = allPreps.find(p => p.id === target || p.code === target);
      if (found) return found;
    }
  }

  // 2. Coincidencia inteligente por nombre de sabor y unit_type === 'entera'
  const portionFlavor = normalizeFlavorName(portionPrep.name);
  if (!portionFlavor) return null;

  const candidate = allPreps.find(p => {
    if (p.unit_type !== 'entera' && p.category !== 'pasteleria') return false;
    if (p.unit_type !== 'entera') return false;
    const cakeFlavor = normalizeFlavorName(p.name);
    return cakeFlavor === portionFlavor || cakeFlavor.includes(portionFlavor) || portionFlavor.includes(cakeFlavor);
  });

  return candidate || null;
}

/**
 * Calcula el stock efectivo disponible (porciones directas en mostrador + porciones potenciales en tortas enteras)
 */

/**
 * Encuentra la Porción hija correspondiente a una Torta Entera madre
 */
export function findPortionPreparation(motherPrep: Preparation, allPreps: Preparation[]): Preparation | null {
  if (motherPrep.unit_type !== 'entera') return null;

  const cakeFlavor = normalizeFlavorName(motherPrep.name);
  if (!cakeFlavor) return null;

  return allPreps.find(p => {
    if (p.unit_type !== 'porcion') return false;
    if (p.description && p.description.includes(motherPrep.code)) return true;
    const portionFlavor = normalizeFlavorName(p.name);
    return portionFlavor === cakeFlavor || portionFlavor.includes(cakeFlavor) || cakeFlavor.includes(portionFlavor);
  }) || null;
}

export function getEffectiveAvailableStock(prep: Preparation, allPreps: Preparation[]): {
  directStock: number;
  motherStock: number;
  totalAvailablePortions: number;
  motherPrep: Preparation | null;
  yieldPerCake: number;
} {
  const directStock = Number(prep.stock_available) || 0;

  if (prep.unit_type !== 'porcion') {
    return {
      directStock,
      motherStock: 0,
      totalAvailablePortions: directStock,
      motherPrep: null,
      yieldPerCake: 1
    };
  }

  const motherPrep = findMotherPreparation(prep, allPreps);
  const motherStock = motherPrep ? Number(motherPrep.stock_available) || 0 : 0;
  const yieldPerCake = Number(prep.portion_yield) > 0 ? Number(prep.portion_yield) : 8;
  const totalAvailablePortions = directStock + (motherStock * yieldPerCake);

  return {
    directStock,
    motherStock,
    totalAvailablePortions,
    motherPrep,
    yieldPerCake
  };
}

export const portionService = {
  findMotherPreparation,
  getEffectiveAvailableStock,

  /**
   * Apertura / Fraccionamiento automático de 1 o más tortas enteras si el stock de porciones no alcanza
   */
  async autoFractionIfNeeded(
    portionPrepId: string,
    quantityNeeded: number,
    userId?: string
  ): Promise<{ success: boolean; cakesOpened: number; portionsAdded: number; message: string }> {
    const allPreps = await recipeService.getPreparations();
    const portionPrep = allPreps.find(p => p.id === portionPrepId);

    if (!portionPrep || portionPrep.unit_type !== 'porcion') {
      return { success: true, cakesOpened: 0, portionsAdded: 0, message: 'No requiere fraccionamiento.' };
    }

    const currentStock = Number(portionPrep.stock_available) || 0;
    if (currentStock >= quantityNeeded) {
      // Ya hay suficientes porciones cortadas en la heladera
      return { success: true, cakesOpened: 0, portionsAdded: 0, message: 'Stock de porciones suficiente.' };
    }

    const motherPrep = findMotherPreparation(portionPrep, allPreps);
    if (!motherPrep) {
      return {
        success: false,
        cakesOpened: 0,
        portionsAdded: 0,
        message: `No se encontró la Torta Entera madre asociada a "${portionPrep.name}".`
      };
    }

    const deficit = quantityNeeded - currentStock;
    const yieldPerCake = Number(portionPrep.portion_yield) > 0 ? Number(portionPrep.portion_yield) : 8;
    const cakesToOpen = Math.ceil(deficit / yieldPerCake);
    const motherStock = Number(motherPrep.stock_available) || 0;

    if (motherStock < cakesToOpen) {
      return {
        success: false,
        cakesOpened: 0,
        portionsAdded: 0,
        message: `Stock insuficiente: se necesitan abrir ${cakesToOpen} torta(s) de "${motherPrep.name}", pero sólo hay ${motherStock} disponibles.`
      };
    }

    const newMotherStock = motherStock - cakesToOpen;
    const portionsToAdd = cakesToOpen * yieldPerCake;
    const newPortionStock = currentStock + portionsToAdd;

    // Actualizar Torta Madre
    await recipeService.updatePreparation(motherPrep.id, {
      stock_available: newMotherStock
    });

    // Actualizar Porción
    await recipeService.updatePreparation(portionPrep.id, {
      stock_available: newPortionStock
    });

    // Registrar movimientos en Kardex
    if (isSupabaseConfigured && supabase) {
      const isValidUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

      await supabase.from('stock_movements').insert([
        {
          preparation_id: motherPrep.id,
          movement_type: 'ajuste',
          quantity: -cakesToOpen,
          previous_stock: motherStock,
          new_stock: newMotherStock,
          reason: `Fraccionamiento automático: Apertura de ${cakesToOpen} un. de "${motherPrep.name}" para vitrina de salón`,
          created_by: isValidUuid ? userId : null
        },
        {
          preparation_id: portionPrep.id,
          movement_type: 'ajuste',
          quantity: portionsToAdd,
          previous_stock: currentStock,
          new_stock: newPortionStock,
          reason: `Fraccionamiento automático: +${portionsToAdd} porciones obtenidas de "${motherPrep.name}" (Rendimiento: ${yieldPerCake} porc./torta)`,
          created_by: isValidUuid ? userId : null
        }
      ]);
    }

    return {
      success: true,
      cakesOpened: cakesToOpen,
      portionsAdded: portionsToAdd,
      message: `Se abrió ${cakesToOpen} torta entera de "${motherPrep.name}", sumando +${portionsToAdd} porciones a la vitrina.`
    };
  },

  /**
   * Fraccionamiento manual: El pastelero o mozo decide abrir una torta entera físicamente para colocarla en porciones
   */
  async manualSliceCake(
    targetPrepId: string,
    cakesCount: number = 1,
    userId?: string
  ): Promise<{ success: boolean; message: string; newPortionStock?: number; newMotherStock?: number }> {
    const allPreps = await recipeService.getPreparations();
    const target = allPreps.find(p => p.id === targetPrepId);

    if (!target) {
      throw new Error('La preparación seleccionada no fue encontrada.');
    }

    let motherPrep: Preparation;
    let portionPrep: Preparation | null = null;

    if (target.unit_type === 'porcion') {
      portionPrep = target;
      motherPrep = findMotherPreparation(portionPrep, allPreps)!;
      if (!motherPrep) {
        throw new Error(`No se encontró la Torta Entera madre asociada a "${portionPrep.name}".`);
      }
    } else if (target.unit_type === 'entera') {
      motherPrep = target;
      portionPrep = findPortionPreparation(motherPrep, allPreps);

      if (!portionPrep) {
        // Autocrear la porción hija si no existe
        const nextNum = allPreps.length + 1;
        const autoCode = motherPrep.code === 'PREP-001' ? 'PREP-002' : `PREP-P${String(nextNum).padStart(2, '0')}`;
        const cleanName = motherPrep.name.replace(/\s*\(torta\s*entera\)/i, '').replace(/\s*torta\s*entera/i, '').trim();
        const portionName = cleanName.toLowerCase().startsWith('porci') ? cleanName : `Porción ${cleanName}`;
        const portionPrice = motherPrep.code === 'PREP-001' ? 3800 : Math.round((motherPrep.price / 8 * 1.1) / 100) * 100;

        portionPrep = await recipeService.createPreparation({
          code: autoCode,
          name: portionName,
          category: motherPrep.category || 'pasteleria',
          description: `Porción individual de ${motherPrep.name}. [TORTA_MADRE:${motherPrep.code}]`,
          unit_type: 'porcion',
          portion_yield: 8.0,
          price: portionPrice > 0 ? portionPrice : 3800,
          stock_available: 0,
          is_active: true
        });
      }
    } else {
      throw new Error('La preparación seleccionada no es una torta ni una porción fraccionable.');
    }

    const motherStock = Number(motherPrep.stock_available) || 0;
    if (motherStock < cakesCount) {
      throw new Error(`Stock insuficiente: se intentó cortar ${cakesCount} torta(s), pero sólo hay ${motherStock} disponible(s) de "${motherPrep.name}".`);
    }

    const currentStock = Number(portionPrep.stock_available) || 0;
    const yieldPerCake = Number(portionPrep.portion_yield) > 0 ? Number(portionPrep.portion_yield) : 8;
    const portionsToAdd = cakesCount * yieldPerCake;
    const newMotherStock = motherStock - cakesCount;
    const newPortionStock = currentStock + portionsToAdd;

    await recipeService.updatePreparation(motherPrep.id, {
      stock_available: newMotherStock
    });

    await recipeService.updatePreparation(portionPrep.id, {
      stock_available: newPortionStock
    });

    if (isSupabaseConfigured && supabase) {
      const isValidUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

      await supabase.from('stock_movements').insert([
        {
          preparation_id: motherPrep.id,
          movement_type: 'ajuste',
          quantity: -cakesCount,
          previous_stock: motherStock,
          new_stock: newMotherStock,
          reason: `Corte de torta en vitrina: ${cakesCount} un. de "${motherPrep.name}" abierta(s) para venta por porción`,
          created_by: isValidUuid ? userId : null
        },
        {
          preparation_id: portionPrep.id,
          movement_type: 'ajuste',
          quantity: portionsToAdd,
          previous_stock: currentStock,
          new_stock: newPortionStock,
          reason: `Corte de torta en vitrina: +${portionsToAdd} porciones obtenidas de "${motherPrep.name}"`,
          created_by: isValidUuid ? userId : null
        }
      ]);
    }

    return {
      success: true,
      message: `¡Corte realizado! Se fraccionó ${cakesCount} torta de "${motherPrep.name}". Ahora hay ${newPortionStock} porciones listas y quedan ${newMotherStock} tortas enteras.`,
      newPortionStock,
      newMotherStock
    };
  }
};
