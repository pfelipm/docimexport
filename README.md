![Banner acercaDe 300p](https://user-images.githubusercontent.com/12829262/75261421-4c76b300-57eb-11ea-826a-7a01385d2623.png)
# ¿Qué es DocImExport?
DocImExport es un script para documentos de texto de Google que extrae las imágenes del documento y las archiva en una subcarpeta junto al propio documento. Específicamente, se extraen los siguientes elementos:
- Imágenes insertadas (`Insertar` ⏩ `Imagen`).
- Gráficos procedentes de una hoja de cálculo existente o creada desde el propio documento (`Insertar` ⏩ `Gráfico`).
- Dibujos insertados desde Drive, vinculados o no (`Insertar` ⏩ `Dibujo` ⏩ `De Drive`).

Estos elementos pueden encontrarse en el **cuerpo**, **encabezado** o **pie de página**, dentro de tablas o elementos de numeración o viñetas y estar posicionados de manera intercalada, ajustados al texto o intercalados entre otros elementos.

<p align="center"><img src="https://user-images.githubusercontent.com/12829262/75083257-24036600-5518-11ea-989e-9e77ab75fcb4.gif"</p>

DocImExport genera una carpeta con este nombre:

`Imágenes` {nombre del documento}` `-` `{ID del documento]`

<p align="center"><img src="https://user-images.githubusercontent.com/12829262/75082309-3c24b680-5513-11ea-8f73-396b39d315c6.png"></p>

Las imágenes se exportan en su formato original. Gráficos y dibujos, por su parte, en `png`. Se utiliza la siguiente nomenclatura en el nombre de los archivos:

`Numeral con relleno de 0s` `Texto alternativo` (si existe) o `Imagen [de párrafo] sin título` 

<p align="center"><img src="https://user-images.githubusercontent.com/12829262/75082667-008aec00-5515-11ea-974a-775430328fdb.png"</p>

El valor `numeral` depende del orden de inserción de los elementos gráficos en el documento. Es posible establecer un **texto alternativo** en imágenes, dibujos y gráficos para facilitar su identificación una vez exportados. Este texto es visible al situar el ratón sobre ellos. Para conseguirlo basta hacer clic con el botón derecho del ratón sobre uno de estos elementos y a continuación en `Texto alternativo`,  o simplemente seleccionar el elemento y presionando `CTRL+ALT+Y`.

<p align="center"><img src="https://user-images.githubusercontent.com/12829262/75082576-92462980-5514-11ea-99a6-5341b03d92ac.gif"></p>

Cada vez que se produce una exportación se elimina la carpeta generada en exportaciones anteriores, con todo su contenido. El uso del ID del documento como sufijo del nombre de la carpeta es una estrategia para tratar de realizar su identificación sin errores.

Para utilizarlo en tus propios documentos tienes dos posibilidades

1. Abre el editor GAS de tu documento (`Herramientas` ⏩ `Editor de secuencias de comandos`), pega el código que encontrarás dentro del archivo `Código.gs`de este repositorio y guarda los cambios. Debes asegurarte de que se esté utilizando el nuevo motor GAS JavaScript V8 (`Ejecutar` ⏩ `Habilitar ... V8`).
2. Hazte una copia de esto :point_right: [DocImExport # plantilla](https://docs.google.com/document/d/1UXYbNEDxyAiqAQ8gFcUno-p53Rp2udo0_JCRsw-7_ro/template/preview) :point_left:.

# Limitaciones
DocImExport presenta en estos momentos las siguientes limitaciones:
- Los dibujos creados directamente dentro del documento no pueden exportarse.
- Los elementos de tipo GIF animado son exportados de manera estática (pierden la animación).
- Los ajustes aplicados sobre las imágenes (recorte, tamaño, transparencia, recoloración, brillo, contraste...) no se exportan. Lo que obtenemos es la imagen original.

# Detalles técnicos

Como siempre, miramos bajo el capó ⚙️🔧.

Aunque se trata de un script muy sencillo que no tiene mucho misterio y que ha surgido para dar una respuesta rápida a una necesidad personal, me gustaría destacar dos cosas. Vamos con la primera.

El uso de V8 como motor de ejecución Apps Script permite utilizar el operador de propagación `...` para concatenar vectores. Gracias a él, podemos obtener de manera consolidada las imágenes de cuerpo, encabezado y pie de página del documento *empalmando* el resultado de sucesivas invocaciones del método `.getImages()` de una manera tan limpia y elegante como esta:

```javascript
// Obtener imágenes que no tienen ajustes de texto, se comprueba si body, header, footer existen

var inlineImages = [...doc.getBody() != null ? doc.getBody().getImages() : [],
                    ...doc.getHeader() != null ? doc.getHeader().getImages() : [],
                    ...doc.getFooter() != null ? doc.getFooter().getImages() : [],
                   ];

// Añadir imágenes en línea

inlineImages.map((i) => {imagenes.push({img: i, tipo: 'inline'});});
```

Se utiliza el operador de comparación `?` para determinar si el documento tiene realmente secciones de cuerpo (`body`), encabezado (`header`) y pie de página (`footer`) antes de tratar de recuperar sus imágenes. De lo contrario obtendremos errores en tiempo de ejecución al usar`.getImages()` si alguna de esas secciones está vacía.

Google Docs considera elementos de tipo imagen tanto las insertadas o pegadas de manera convencional como los gráficos de hoja de cálculo (insertados o creados en el documento), así como los dibujos, aunque en este caso solo los que han sido insertados desde Drive. Los dibujos directamente incrustados en el documento no pueden exportarse como imagen, al menos con el servicio de Documentos GAS convencional... quedaría por ver si esto puede salvarse utilizando la [API avanzada de Docs](https://developers.google.com/docs/api), pero dado que para mí la funcionalidad actual de DocImExport es adecuada ya no me he molestado en averiguarlo... al menos por el momento.

Pero si alguna de estas entidades de tipo imagen está vinculada a un párrafo, `.getImages()` no será capaz de enumerarla. Curiosamente, esto no es así en el caso de que la entidad aparezca dentro de una lista de elementos, numerada o no. Personalmente no encuentro esta decisión de diseño especialmente razonable, pero es lo que hay. Y por eso tenemos que hacer más cosas para identificar el resto de elementos de tipo imagen: deberemos recorrer todos los párrafos para localizar las imágenes que pudieran *colgar* de ellos. De esto se encargan estas líneas:

```javascript
// Obtener párrafos, se comprueba si body, header, footer existen

var parrafos = [...doc.getBody() != null ? doc.getBody().getParagraphs() : [],
                    ...doc.getHeader() != null ? doc.getBody().getParagraphs() : [],
                    ...doc.getFooter() != null ? doc.getFooter().getParagraphs() : [],
                   ];
                     
parrafos.map((p) => {p.getPositionedImages().map((pi) => {imagenes.push({img: pi, tipo: 'positioned'});});});
```

Tras esto tendremos en `imagenes[]` una lista de objetos con las imágenes que deseamos exportar. Estos objetos contendrán las propiedades `.img` (la imagen en cuestión, tal y como nos la proporciona la API) y `.tipo`, que será `['inline | positioned']` en función de si se trata de un elemento libre ([InlineImage](https://developers.google.com/apps-script/reference/document/inline-image) en el servicio de Documentos GAS) o vinculado a un párrafo ([PositionedImage](https://developers.google.com/apps-script/reference/document/positioned-image)), respectivamente.

Y ahora la segunda. Los métodos que pueden utilizarse sobre cada una de estas dos entidades no son exactamente los mismos. Si tiramos por la calle de enmedio y no prestamos atención a este aspecto conseguiremos unos estupendos errores en tiempo de ejecución. Y no queremos eso. Por esa razón, discriminaremos mediante `.tipo` y, dependiendo de su valor, optaremos por una u otra estrategia a la hora de asignarle un nombre al archivo en el que se exportará la imagen. Aquí luciremos nuevamente el músculo ES6 de V8, recurriendo a sus potentes [plantillas de cadena de texto](https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/template_strings) (y a las compactas y anidables asignaciones usando el operador condicional `?`, aunque esto no es nuevo) para resolver esta circunstancia en una sola línea.

```javascript
// Exportar imágenes
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
```

Y eso es todo. Quizás lo natural sería empaquetar esto en un complemento para documentos de Google, añadiéndole de paso alguna cosilla más que se me ocurre, para tenerlo siempre a mano en lugar de andar copiando y pegando código. Personalmente lo que hago por ahora es utilizar la imprescindible extensión para Chrome [GAS GitHub Assistant](https://chrome.google.com/webstore/detail/google-apps-script-github/lfjcgcmkmjjlieihflfhjopckgpelofo) en el editor Apps Script del documento donde lo necesito para invocar el código de DocImExport desde su repositorio en GitHub.

![githubassistant](https://user-images.githubusercontent.com/12829262/75624643-84e50b00-5bb6-11ea-958c-58dfe128b399.png)

# Licencia
© 2020 Pablo Felip Monferrer ([@pfelipm](https://twitter.com/pfelipm)). Se distribuye bajo licencia MIT.
