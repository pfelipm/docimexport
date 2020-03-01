/**
 * DocImExport es un script para documentos de texto de Google que extrae
 * todas las imágenes del documento y las archiva en una subcarpeta junto al propio documento.
 * Específicamente, se extraen los siguientes elementos:
 * - Imágenes insertadas.
 * - Gráficos procedentes de una hoja de cálculo existente o creada en el propio documento.
 * - Gráficos creados dentro de documento
 * - Dibujos insertados desde Drive, vinculados o no
 * Estos elementos pueden encontrarse en el cuerpo, encabezado o pie de página,
 * dentro de tablas o elementos de numeración o viñetas y estar posicionados de manera
 * intercalada, ajustados al texto o intercalados entre otros elementos.
 *
 * MIT License
 * Copyright (c) 2020 Pablo Felip Monferrer(@pfelipm)
 *
 * @OnlyCurrentDoc
 */

function onOpen() {
 
  DocumentApp.getUi().createMenu('DocImExport')
    .addItem('📥 Exportar elementos gráficos', 'exportar')
    .addToUi();
  
}

function exportar() {
    
  var doc = DocumentApp.getActiveDocument();
  
  var imagenes = []; // Vector de imágenes del documento
  
  // Obtener (a) imágenes que no tienen ajustes de texto y (b) párrafos del documento, se comprueba si body, header, footer existen
  
  var inlineImages = [...doc.getBody() != null ? doc.getBody().getImages() : [],
                      ...doc.getHeader() != null ? doc.getHeader().getImages() : [],
                      ...doc.getFooter() != null ? doc.getFooter().getImages() : [],
                     ];
  
  var parrafos =     [...doc.getBody() != null ? doc.getBody().getParagraphs() : [],
                      ...doc.getHeader() != null ? doc.getHeader().getParagraphs() : [],
                      ...doc.getFooter() != null ? doc.getFooter().getParagraphs() : [],
                     ];
  
  // Añadir imágenes en línea
  
  inlineImages.map((i) => {imagenes.push({img: i, tipo: 'inline'});});

  // Añadir imágenes con posicionamiento respecto a párrafo

  parrafos.map((p) => {p.getPositionedImages().map((pi) => {imagenes.push({img: pi, tipo: 'positioned'});});});

  // Si no tenemos imágenes, fin

  if (imagenes.length == 0) {
    
    DocumentApp.getUi().alert('❌ ¡No hay imágenes que exportar!');
    
  } else {

    // Crear carpeta nombre_doc + 'img', si no existe ya
    
    var docDrive = DriveApp.getFileById(doc.getId());
    var nombreCarpeta = `Imágenes ${doc.getName()} - ${doc.getId()}`; // ID en el nombre para no confundirnos al borrar carpeta
    var carpeta = docDrive.getParents().next();
    var carpetaExp;
    
    // Si la carpeta de exportación ya existe la eliminamos
    
    if (carpeta.getFoldersByName(nombreCarpeta).hasNext()) {
      carpeta.getFoldersByName(nombreCarpeta).next().setTrashed(true);
    }
    carpetaExp = carpeta.createFolder(nombreCarpeta);
    
    // Exporta imágenes
    // Las imágenes con ajustes de texto no tienen getAltTitle(), getType(), getAttributes()... pero sí getId()
    
    var nDigitos = parseInt(imagenes.length).toString().length;
    
    imagenes.map((i, p) => {
                 
      // Genera prefijo numeral con relleno de 0's para facilitar ordenación en lista de archivos
              
      let prefijoNum = '0'.repeat(nDigitos).substring(0, nDigitos - (p + 1).toString().length) + (p + 1);      
    
      // Si el objeto es de tipo 'inline' usa su AltTitle (si existe), en cualquier otro caso 'Imagen [de párrafo] sin título'
    
      let nombre = `${prefijoNum} ${i.tipo == 'inline' ? i.img.getAltTitle() == null ? 'Imagen sin título' : i.img.getAltTitle() : 'Imagen de párrafo sin título'}`;
    
      // Exportar imagen en su formato original ¡GIF pierde animación! 😒
    
      carpetaExp.createFile(i.img.getBlob().setName(nombre));
    });

    DocumentApp.getUi().alert('✔️️ URL carpeta exportación:\n\n' + carpetaExp.getUrl());
    
  }

}