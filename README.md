# DocImExport
DocImExport es un script para documentos de texto de Google que extrae todas las imágenes del documento y las archiva en una subcarpeta junto al propio documento. Específicamente, es posible extraer los siguientes elementos:
- Imágenes insertadas (`Insertar` ⏩ `Imagen`).
- Gráficos procedentes de una hoja de cálculo existente o creada en el propio documento (`Insertar` ⏩ `Gráfico`).
- Dibujos *insertados* desde Drive, vinculados o no (`Insertar` ⏩ `Dibujo` ⏩ `De Drive`). Los dibujos creados directamente dentro del documento pueden exportarse.
Estos elementos pueden estar situados en el **cuerpo**, **encabezado** y **pie de página** , dentro de tablas o elementos de numeración o viñetas y estar posicionados de manara intercalada, ajustados al texto o dividiéndolo.

DocImExport genera una carpeta con este nombre:

`Imágenes` `{nombre del documento}` `-` `{ID del documento]`

![screenshot-drive google com-2020 02 22-01_32_00](https://user-images.githubusercontent.com/12829262/75082309-3c24b680-5513-11ea-8f73-396b39d315c6.png)

Las imágenes se exportan en su formato original (en el caso de los elementos de tipo GIF se pierde, lamentablemente, la animación) y se utiliza esta nomenclatura:

`Numeral` `Texto alternativo` (si existe) o `Imagen sin título` 

El valor `numeral` depende del orden de inserción de los elementos gráficos en el documento. Es posible establecer un texto alternativo en imágenes, dibujos y gráficos (visible al situar el ratón sobre ellos) haciendo clic con el botón derecho del ratón y seleccionado `Texto alternativo` o simplemente seleccionado el elemento y presionando `CTRL+ALT+Y`.

![DocImExport - Documentos de Google](https://user-images.githubusercontent.com/12829262/75082576-92462980-5514-11ea-99a6-5341b03d92ac.gif)
