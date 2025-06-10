import axios from 'axios';

// Interfaces para tipar correctamente la respuesta de la API
interface TypeDetail {
  type: {
    name: string;
  };
}

interface SpriteDetail {
  front_default: string | null;
}

interface PokemonApiResponse {
  name: string;
  sprites: SpriteDetail;
  types: TypeDetail[];
}

export interface PokemonData {
  nombre: string;
  sprite: string;
  tipos: string[];
}

export async function getPokemonInfo(nombre: string): Promise<PokemonData | null> {
  try {
    const response = await axios.get<PokemonApiResponse>(
      `https://pokeapi.co/api/v2/pokemon/${nombre.toLowerCase()}` 
    );

    const data = response.data;

    const sprite = data.sprites?.front_default ?? null;

    if (!sprite) {
      throw new Error('No se encontró la imagen del Pokémon');
    }

    const tipos = data.types.map((t) => t.type.name);

    return {
      nombre: data.name,
      sprite,
      tipos
    };
  } catch (error) {
    // Validación segura del error
    let errorMessage = 'Error desconocido';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error(`No se pudo obtener el Pokémon ${nombre}:`, errorMessage);
    return null;
  }
}