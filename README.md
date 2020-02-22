# DocImExport
DocImExport es un script para documentos de texto de Google que extrae todas las imágenes del documento y las archiva en una subcarpeta junto al propio documento. Específicamente, se extraen los siguientes elementos:
- Imágenes insertadas (`Insertar` ⏩ `Imagen`).
- Gráficos procedentes de una hoja de cálculo existente o creada en el propio documento (`Insertar` ⏩ `Gráfico`).
- Dibujos insertados desde Drive, vinculados o no (`Insertar` ⏩ `Dibujo` ⏩ `De Drive`).

Estos elementos pueden estar situados en el **cuerpo**, **encabezado** o **pie de página**, dentro de tablas o elementos de numeración o viñetas y estar posicionados de manara intercalada, ajustados al texto o intercalados entre otros elementos.

<p align="center"><img src="https://user-images.githubusercontent.com/12829262/75083181-a93a4b00-5517-11ea-9742-be03d97958d9.gif"</p>

DocImExport genera una carpeta con este nombre:

`Imágenes` `{nombre del documento}` `-` `{ID del documento]`

<p align="center"><img src="https://user-images.githubusercontent.com/12829262/75082309-3c24b680-5513-11ea-8f73-396b39d315c6.png"></p>

Las imágenes se exportan en su formato original, utilizando esta nomenclatura:

`Numeral` `Texto alternativo` (si existe) o `Imagen [de párrafo] sin título` 

<p align="center"><img src="https://user-images.githubusercontent.com/12829262/75082667-008aec00-5515-11ea-974a-775430328fdb.png"</p>

El valor `numeral` depende del orden de inserción de los elementos gráficos en el documento. Es posible establecer un **texto alternativo**, para facilitar su identificación una vez exportados, en imágenes, dibujos y gráficos (visible al situar el ratón sobre ellos) haciendo clic con el botón derecho del ratón y a continuación en `Texto alternativo`,  o simplemente seleccionando el elemento y presionando `CTRL+ALT+Y`.

<p align="center"><img src="https://user-images.githubusercontent.com/12829262/75082576-92462980-5514-11ea-99a6-5341b03d92ac.gif"></p>

Cada vez que se produce una exportación se elimina la carpeta generada en exportaciones anteriores, con todo su contenido. El uso del ID del documento como sufijo de la carpeta es una estrategia para tratar de realizar su identifición sin errores.

# Limitaciones
DocImExport presenta en estos momentos las siguientes limitaciones:
- Los dibujos creados directamente dentro del documento no pueden exportarse.
- Los elementos de tipo GIF animado son exportados de manera estática (pierden la animación).

# Licencia
© 2020 Pablo Felip Monferrer ([@pfelipm](https://twitter.com/pfelipm)). Se distribuye bajo licencia MIT.
