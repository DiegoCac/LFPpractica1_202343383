import { PokemonData } from './pokenapi';

export interface PokemonConIV extends PokemonData {
  salud: number;
  ataque: number;
  defensa: number;
  iv: number;
}

// Calcular el IV de un Pokémon con sus stats
export function calcularIV(salud: number, ataque: number, defensa: number): number {
  return Math.round(((salud + ataque + defensa) / 45) * 100);
}

// Elegir los mejores 6 sin repetir tipo
export function seleccionarMejores(pokemones: PokemonConIV[]): PokemonConIV[] {
  const mejoresPorTipo = new Map<string, PokemonConIV>();

  for (const poke of pokemones) {
    for (const tipo of poke.tipos) {
      const actual = mejoresPorTipo.get(tipo);
      if (!actual || poke.iv > actual.iv) {
        mejoresPorTipo.set(tipo, poke);
      }
    }
  }

  // Convertimos a lista y elegimos los 6 mejores distintos por tipo
  const unicos = Array.from(new Set(mejoresPorTipo.values()));
  return unicos
    .sort((a, b) => b.iv - a.iv) // mayor IV primero
    .slice(0, 6);
}