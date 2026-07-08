#!/usr/bin/env node

/**
 * Script para convertir INFORME_TECNICO.md a DOCX
 * Uso: node convertir-a-docx.js
 */

import { exec } from 'child_process';
import { readFileSync } from 'fs';
import { promisify } from 'util';

const execPromise = promisify(exec);

console.log('🔄 Iniciando conversión de Markdown a DOCX...\n');

// Leer el archivo markdown
try {
  const markdownContent = readFileSync('INFORME_TECNICO.md', 'utf-8');
  console.log('✅ Archivo Markdown leído correctamente');
  console.log(`📄 Tamaño: ${(markdownContent.length / 1024).toFixed(2)} KB\n`);

  // Proponer opciones
  console.log('Para convertir a DOCX, elige una opción:\n');
  console.log('1️⃣  OPCIÓN A - Usar Pandoc Online (más fácil)');
  console.log('   → Ir a: https://pandoc.org/try/');
  console.log('   → Pegar contenido → Descargar DOCX\n');

  console.log('2️⃣  OPCIÓN B - Instalar Pandoc Desktop');
  console.log('   → Descargar: https://github.com/jgm/pandoc/releases');
  console.log('   → Buscar: pandoc-X.X-windows-x86_64.msi');
  console.log('   → Luego ejecutar: pandoc INFORME_TECNICO.md -o INFORME_TECNICO.docx\n');

  console.log('3️⃣  OPCIÓN C - Usar LibreOffice (si está instalado)');
  console.log('   → Ejecutar: soffice --headless --convert-to docx INFORME_TECNICO.md\n');

  console.log('━'.repeat(80));
  console.log('\n📋 ALTERNATIVA RÁPIDA:');
  console.log('Copia el contenido del archivo y úsalo en Microsoft Word Online:');
  console.log('→ https://www.office.com/ → New → Word Document → Pegar\n');

} catch (error) {
  console.error('❌ Error al leer archivo:', error.message);
  process.exit(1);
}
