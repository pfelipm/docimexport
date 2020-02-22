/**
 * Exporta los siguientes elementos gráficos presentes en el documento (cuerpo, encabezado, pie):
 * - Imágenes insertadas
 * - Gráficos de hdc
 * - Gráficos creados dentro de documento
 * - Dibujos *insertados* desde Drive, vinculados o no
 * ...con posicionamiento libre o ajuste de párrafo, en tabla, elementos de numeración o viñetas.
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
  
  // Opciones: borrar imagenes ya generadas, ¿patrón de nombre?
  
  var doc = DocumentApp.getActiveDocument();
  var imagenes = [];
  
  // Obtener imágenes que no tienen ajustes de texto y párrafos
  
  var inlineImages = [...doc.getBody().getImages(), ...doc.getHeader().getImages(), ...doc.getFooter().getImages()];
  var parrafos = [...doc.getBody().getParagraphs(), ...doc.getHeader().getParagraphs(), ...doc.getFooter().getParagraphs()];

  // Añadir imágenes en línea
  
  inlineImages.map((i) => {imagenes.push({img: i, tipo: 'inline'});});


  // Añadir imágenes con posicionamiento respecto a párrafo

  parrafos.map((p) => {p.getPositionedImages().map((pi) => {imagenes.push({img: pi, tipo: 'positioned'});});});

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

  // Exportar imágenes
  // Las imágenes con ajustes de texto no tienen getAltTitle(), getType(), getAttributes()... pero sí getId()

  imagenes.map((i, p) => {
    
    // Si el objeto es de tipo 'inline' usa su AltTitle (si existe), en cualquier otro caso 'Imagen sin título'
               
    let nombre = `${p + 1} ${i.tipo == 'inline' ? i.img.getAltTitle() == null ? 'Imagen sin título' : i.img.getAltTitle() : 'Imagen de párrafo sin título'}`;

    // Exportar imagen en su formato original ¡GIF pierde animación! 😒
    
    carpetaExp.createFile(i.img.getBlob().setName(nombre));
  });
 }