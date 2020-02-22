# ¿Qué es DocImExport?
DocImExport es un script para documentos de texto de Google que extrae todas las imágenes del documento y las archiva en una subcarpeta junto al propio documento. Específicamente, se extraen los siguientes elementos:
- Imágenes insertadas (`Insertar` ⏩ `Imagen`).
- Gráficos procedentes de una hoja de cálculo existente o creada en el propio documento (`Insertar` ⏩ `Gráfico`).
- Dibujos insertados desde Drive, vinculados o no (`Insertar` ⏩ `Dibujo` ⏩ `De Drive`).

Estos elementos pueden encontrarse en el **cuerpo**, **encabezado** o **pie de página**, dentro de tablas o elementos de numeración o viñetas y estar posicionados de manera intercalada, ajustados al texto o intercalados entre otros elementos.

<p align="center"><img src="https://user-images.githubusercontent.com/12829262/75083257-24036600-5518-11ea-989e-9e77ab75fcb4.gif"</p>

DocImExport genera una carpeta con este nombre:

`Imágenes` `{nombre del documento}` `-` `{ID del documento]`

<p align="center"><img src="https://user-images.githubusercontent.com/12829262/75082309-3c24b680-5513-11ea-8f73-396b39d315c6.png"></p>

Las imágenes se exportan en su formato original, utilizando esta nomenclatura:

`Numeral` `Texto alternativo` (si existe) o `Imagen [de párrafo] sin título` 

<p align="center"><img src="https://user-images.githubusercontent.com/12829262/75082667-008aec00-5515-11ea-974a-775430328fdb.png"</p>

El valor `numeral` depende del orden de inserción de los elementos gráficos en el documento. Es posible establecer un **texto alternativo** en imágenes, dibujos y gráficos para facilitar su identificación una vez exportados. Este texto es visible al situar el ratón sobre ellos. Para conseguirlo basta hacer clic con el botón derecho del ratón sobre uno de estos elementos y a continuación en `Texto alternativo`,  o simplemente seleccionando el elemento y presionando `CTRL+ALT+Y`.

<p align="center"><img src="https://user-images.githubusercontent.com/12829262/75082576-92462980-5514-11ea-99a6-5341b03d92ac.gif"></p>

Cada vez que se produce una exportación se elimina la carpeta generada en exportaciones anteriores, con todo su contenido. El uso del ID del documento como sufijo de la carpeta es una estrategia para tratar de realizar su identifición sin errores.

Para utilizarlo en tus propios documentos tienes 2 opciones:

1. Abre el editor GAS de tu documento (`Herramientas` ⏩ `Editor de secuencias de comandos`), pega el código que encontrarás dentro del archivo `Código.gs`de este repositorio y guarda los cambios. Debes asegurarte de que se esté utilizando el nuevo motor GAS JavaScript V8 (`Ejecutar` ⏩ `Habilitar ... V8`).
2. Hazte una copia de esto :point_right: [DocImExport # plantilla](https://docs.google.com/document/d/1UXYbNEDxyAiqAQ8gFcUno-p53Rp2udo0_JCRsw-7_ro/template/preview) :point_left:.

# Limitaciones
DocImExport presenta en estos momentos las siguientes limitaciones:
- Los dibujos creados directamente dentro del documento no pueden exportarse.
- Los elementos de tipo GIF animado son exportados de manera estática (pierden la animación).

# Detalles técnicos

Aunque se trata de un script muy sencillo, me gustaría destacar dos cosas. Vamos con la primera.

El uso de V8 permite utilizar el operador de propagación para concatenar vectores. Gracias a él, podemos obtener todas las imágenes de cuerpo, encabezado y pie de página del documento concatenando los vectores devueltos por sucesivas invocaciones del método `.getImages()` de una manera tan limpia y elegante como esta:

```javascript
// Obtener imágenes que no tienen ajustes de texto y párrafos
var inlineImages = [...doc.getBody().getImages(), ...doc.getHeader().getImages(), ...doc.getFooter().getImages()];

// Añadir imágenes en línea
inlineImages.map((i) => {imagenes.push({img: i, tipo: 'inline'});});
```
Google Google Docs considera elementos de tipo imagen tanto a las imágenes convencionales como a los gráficos de hoja de cálculo (insertados o creados en el documento) y a los dibujos, aunque en este caso solo a los que han sido insertados desde Drive. Los dibujos directamente incrustados en el documento no pueden exportarse como imagen, al menos con el servicio GAS convencional... quedaría por ver si esto puede salvarse utilizando la [API avanzada de Docs](https://developers.google.com/docs/api), pero dado que para mí la funcionalidad actual de DocImExport es adecuada ya no me he molestado en averiguarlo... al menos por el momento.

Pero si alguna de estas entidades de tipo imagen está vinculada a un párrafo, `.getImages()` no será capaz de enumerarla. Curiosamente, esto no es así en el caso de que la entidad aparezca en una lista de elementos. Personalmente no encuentro esta decisión de diseño especialemente razonable, pero es lo que hay. Y por eso tenemos que hacer más cosas para identificar el resto de elementos de tipo imagen: deberemos recorrer todos los párrafos para localizar las imágenes que pudiera *colgar* de ellas. De esto se encargan estas líneas:

```javascript
var parrafos = [...doc.getBody().getParagraphs(), ...doc.getHeader().getParagraphs(), ...doc.getFooter().getParagraphs()];
parrafos.map((p) => {p.getPositionedImages().map((pi) => {imagenes.push({img: pi, tipo: 'positioned'});});});
```
Tras esto tendremos en `imagenes[]` un vector de objetos con las imágenes que deseamos exportar. Estos objetos contendrán las propiedades `img`(la imagen en cuestión, tal y como nos la devuelve la API) y `tipo`que será `['inline | positioned']`en función de si se trata de un elemento libre o vinculado a un párrafo.

La segunda cuestión tiene que ver con los métodos que pueden utilizarse sobre cada uno de estos dos tipos de elementos. Dependiendo de cuál se trate en cada caso optaremos por una u otra estrategia a la hora de asignarle un nombre. Aquí tiramos nuevamentel del *músculo* de V8, recurriendo a sus potentes literales (y a las asignaciones condicionales con `?`, aunque esto no es nuevo) para resolver esto en una sola línea.

```javascript
// Exportar imágenes
// Las imágenes con ajustes de texto no tienen getAltTitle(), getType(), getAttributes()... pero sí getId()

imagenes.map((i, p) => {

  // Si el objeto es de tipo 'inline' usa su AltTitle (si existe), en cualquier otro caso 'Imagen sin título'
  let nombre = `${p + 1} ${i.tipo == 'inline' ? i.img.getAltTitle() == null ? 'Imagen sin título' : i.img.getAltTitle() : 'Imagen de párrafo sin título'}`;

  // Exportar imagen en su formato original ¡GIF pierde animación! 😒
  carpetaExp.createFile(i.img.getBlob().setName(nombre));
});
```

# Licencia
© 2020 Pablo Felip Monferrer ([@pfelipm](https://twitter.com/pfelipm)). Se distribuye bajo licencia MIT.
