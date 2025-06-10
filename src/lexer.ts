export interface Token {
  lexema: string;
  tipo: string;
  fila: number;
  columna: number;
}

const palabrasReservadas = ['Jugador', 'Pokemon', 'Datos'];

export function analyzeText(input: string): Token[] {
  const tokens: Token[] = [];
  const lines = input.split('\n');

  for (let fila = 0; fila < lines.length; fila++) {
    const line = lines[fila];
    let columna = 1;
    let buffer = '';

    const pushToken = (lexema: string, tipo: string) => {
      tokens.push({ lexema, tipo, fila: fila + 1, columna });
    };

    for (let i = 0; i <= line.length; i++) {
      const char = line[i] || ' ';

      if (char === ' ' || char === '\t' || i === line.length) {
        if (buffer.length > 0) {
          // Clasificación del lexema
          if (palabrasReservadas.includes(buffer)) {
            pushToken(buffer, 'Palabra Reservada');
          } else if (/^\d+$/.test(buffer)) {
            pushToken(buffer, 'Número Entero');
          } else {
            pushToken(buffer, 'Desconocido');
          }
          columna += buffer.length + 1;
          buffer = '';
        } else {
          columna++;
        }
      } else if (char === '"' || char === "'") {
        // Cadena de texto
        let lexema = char;
        i++;
        while (i < line.length && line[i] !== char) {
          lexema += line[i++];
        }
        if (i < line.length) lexema += char; // Cierre de comillas
        pushToken(lexema, 'Cadena de Texto');
        columna += lexema.length + 1;
      } else if (['{', '}', ':'].includes(char)) {
        pushToken(char, 'Símbolo');
        columna++;
      } else if (/[\w\d]/.test(char)) {
        buffer += char;
      } else {
        pushToken(char, 'Desconocido');
        columna++;
      }
    }
  }

  return tokens;
}