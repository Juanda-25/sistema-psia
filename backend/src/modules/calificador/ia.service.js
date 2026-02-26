const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Extrae el texto del documento según su tipo
const extraerTexto = async (rutaArchivo) => {
  const ext = path.extname(rutaArchivo).toLowerCase();
  const buffer = fs.readFileSync(rutaArchivo);

  if (ext === '.pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === '.doc' || ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error('Formato de archivo no soportado');
};

// Califica el documento usando Gemini según los criterios de la rúbrica
const calificarConIA = async (rutaArchivo, criterios) => {
  try {
    const textoDocumento = await extraerTexto(rutaArchivo);

    if (!textoDocumento || textoDocumento.trim().length < 50) {
      throw new Error('El documento está vacío o no se pudo extraer el texto');
    }

    const criteriosTexto = criterios.map((c, i) =>
      `${i + 1}. ${c.nombre} (puntaje máximo: ${c.puntaje_max} puntos)${c.descripcion ? ': ' + c.descripcion : ''}`
    ).join('\n');

    const prompt = `
Eres un evaluador académico experto en documentos PAT (Plan de Acción Tutorial) Colectivo universitario.

Analiza el siguiente documento y evalúa cada criterio de la rúbrica con un puntaje numérico.

CRITERIOS DE EVALUACIÓN:
${criteriosTexto}

DOCUMENTO A EVALUAR:
${textoDocumento.substring(0, 8000)}

INSTRUCCIONES:
- Evalúa cada criterio con un puntaje entre 0 y su puntaje máximo
- Sé objetivo y justo en la evaluación
- Responde ÚNICAMENTE con un JSON válido con este formato exacto, sin texto adicional:
{
  "calificaciones": [
    {
      "criterio_index": 0,
      "puntaje": 15,
      "observacion": "Explicación breve de por qué se asignó este puntaje"
    }
  ],
  "comentario_general": "Comentario general sobre el documento"
}
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Limpiar respuesta y parsear JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('La IA no devolvió un formato válido');

    const parsed = JSON.parse(jsonMatch[0]);

    // Mapear index de criterio al id real
    const calificaciones = parsed.calificaciones.map((cal) => ({
      criterio_id: criterios[cal.criterio_index].id,
      puntaje: Math.min(
        parseFloat(cal.puntaje),
        parseFloat(criterios[cal.criterio_index].puntaje_max)
      ),
      observacion: cal.observacion,
    }));

    return {
      calificaciones,
      comentario_general: parsed.comentario_general,
    };

  } catch (err) {
    console.error('Error en calificarConIA:', err.message);
    throw new Error('Error al analizar el documento con IA: ' + err.message);
  }
};

module.exports = { calificarConIA, extraerTexto };