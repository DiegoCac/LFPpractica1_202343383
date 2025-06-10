import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import { getPokemonInfo } from './pokenapi';
import { calcularIV, seleccionarMejores, PokemonConIV } from './ivCalculator';
import { analyzeText } from './lexer';

interface PokemonData {
  nombre: string;
  salud: number;
  ataque: number;
  defensa: number;
}

const app = express();
const PORT = 3001;

app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

// Ruta raíz
app.get('/', async (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para subir archivo
app.post('/upload', async (req, res) => {
  try {
    const file = req.files?.['archivo'] as fileUpload.UploadedFile;
    if (!file || Array.isArray(file)) {
      
    }

    const content = file.data.toString('utf-8');
    console.log('Contenido recibido:', content);
    
    const tokens = analyzeText(content);
    console.log('Tokens generados:', tokens);

    const pokemonesExtraidos: PokemonData[] = [];

    // Extraer datos desde los tokens
    for (let i = 0; i < tokens.length; i++) {
      if (
        tokens[i].lexema === 'Pokemon' &&
        tokens[i + 2]?.tipo === 'Cadena de Texto' &&
        tokens[i + 4]?.lexema === 'Datos'
      ) {
        const nombre = tokens[i + 2].lexema.replace(/"/g, '');
        const salud = parseInt(tokens[i + 6]?.lexema || '0');
        const ataque = parseInt(tokens[i + 8]?.lexema || '0');
        const defensa = parseInt(tokens[i + 10]?.lexema || '0');

        pokemonesExtraidos.push({ nombre, salud, ataque, defensa });
      }
    }

    console.log('Pokémon extraídos:', pokemonesExtraidos);

    // Llamar a la PokeAPI y calcular IV
    const datosConIV: PokemonConIV[] = [];

    for (const p of pokemonesExtraidos) {
      console.log(`Buscando información para: ${p.nombre}`);
      const data = await getPokemonInfo(p.nombre);
      if (data) {
        const iv = calcularIV(p.salud, p.ataque, p.defensa);
        datosConIV.push({ ...data, ...p, iv });
        console.log(`Pokémon procesado: ${p.nombre}, IV: ${iv}`);
      } else {
        console.log(`No se pudo obtener información para: ${p.nombre}`);
      }
    }

    console.log('Datos con IV:', datosConIV);

    // Seleccionar mejores 6 sin repetir tipo
    const seleccionados = seleccionarMejores(datosConIV);
    console.log('Pokémon seleccionados:', seleccionados);

    // Enviar respuesta final
    res.json({ 
      tokens, 
      seleccionados,
      debug: {
        pokemonesExtraidos,
        totalProcesados: datosConIV.length
      }
    });

  } catch (error) {
    console.error('Error procesando archivo:', error);
    
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});