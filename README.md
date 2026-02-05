# Proyecto Final - Seguridad

Aplicación web interactiva para demostrar conceptos de criptografía y seguridad informática. El proyecto incluye implementación de algoritmos de cifrado simétrico (AES-256), asimétrico (RSA-OAEP), cifrado clásico (Vigenère), hashing de contraseñas (Bcrypt) y gestión básica de usuarios.

## Características Principales

La aplicación ofrece una interfaz gráfica moderna con cuatro módulos principales que permiten experimentar con diferentes técnicas criptográficas. El módulo de registro de usuarios permite crear cuentas con contraseñas seguras que son procesadas mediante el algoritmo Bcrypt para generar hashes resistentes a ataques de fuerza bruta, mientras que los datos sensibles se cifran automáticamente con AES-256 antes de almacenarse.

El módulo de cifrado RSA-OAEP implementa criptografía asimétrica utilizando claves de 2048 bits generadas dinámicamente, permitiendo cifrar información que solo puede ser descifrada con la clave privada correspondiente. Esta técnica es ideal para intercambiar claves de sesión o transmitir información altamente sensible entre partes que no han compartido un secreto previamente.

El módulo de cifrado clásico implementa el algoritmo de Vigenère, uno de los métodos de sustitución polialfabética más históricos y elegantes, proporcionando una forma didáctica de comprender la evolución histórica de la criptografía y sus vulnerabilidades ante los ataques de frecuencia.

El sistema incluye una API REST completa desarrollada con FastAPI que expone todos los endpoints necesarios para la funcionalidad del frontend, facilitando futuras extensiones y la integración con otros sistemas que requieran servicios criptográficos.

## Estructura del Proyecto

```
Proyecto_Seguridad/
├── index.html          # Interfaz de usuario principal
├── estilo.css          # Estilos CSS personalizados
├── script.js           # Lógica del frontend y llamadas a la API
├── main.py             # Servidor FastAPI con endpoints criptográficos
├── README.md           # Documentación del proyecto
```

El archivo `index.html` contiene toda la estructura de la interfaz de usuario, incluyendo las pestañas de navegación y los formularios para cada功能 de cifrado. El diseño es completamente responsive y se adapta a diferentes tamaños de pantalla, utilizando variables CSS para facilitar la personalización de colores y estilos.

El archivo `estilo.css` define la apariencia visual de toda la aplicación, con un esquema de colores profesional basado en tonos azules y grises que transmiten confianza y seguridad. Los estilos incluyen animaciones suaves para las transiciones de pestañas, indicadores visuales de fuerza de contraseña y mensajes de estado intuitivos.

El archivo `script.js` implementa toda la lógica del cliente, incluyendo la navegación entre pestañas, la validación de formularios en tiempo real, la comunicación asíncrona con el servidor mediante la Fetch API, y la visualización de resultados en formatos legibles para el usuario.

El archivo `main.py` contiene la implementación completa del servidor backend utilizando FastAPI, incluyendo la generación dinámica de claves criptográficas, los endpoints para cada operación de cifrado y descifrado, y la gestión básica de usuarios en memoria.

## Uso de la Aplicación

Para iniciar el servidor de desarrollo, se debe ejecutar el comando `python main.py` desde la terminal con el entorno virtual activo. El servidor iniciará en la dirección `http://127.0.0.1:8000` y permanecerá activo mientras la terminal permanezca abierta. FastAPI proporciona automáticamente documentación interactiva de la API en la ruta `/docs`, donde se pueden probar los endpoints directamente desde el navegador.

Una vez iniciado el servidor, se debe abrir el archivo `index.html` en un navegador web moderno como Chrome, Firefox, Edge o Safari. La aplicación cargará y se conectará automáticamente al servidor local para procesar todas las operaciones criptográficas. Es importante mantener el servidor ejecutándose mientras se utiliza la interfaz web, ya que todas las operaciones de cifrado y descifrado se realizan en el backend.

Para registrar un nuevo usuario, navegue a la pestaña "Registro", complete los campos de nombre de usuario, contraseña y nota sensible, luego haga clic en "Registrar y Cifrar". El sistema generará automáticamente un hash Bcrypt de la contraseña y cifrará la nota sensible con AES-256 antes de almacenarla. La barra de indicadores de fuerza de contraseña proporciona retroalimentación visual en tiempo real sobre la calidad de la contraseña ingresada.

Para utilizar el cifrado RSA, navegue a la pestaña "Cifrado RSA", ingrese el texto que desea cifrar en el área de texto proporcionada y haga clic en "Cifrar con RSA". El resultado mostrará el texto cifrado en formato hexadecimal. De manera similar, el cifrado AES se realiza desde la misma pestaña utilizando el botón correspondiente, y el resultado se presenta en formato Base64 estándar.

Para el cifrado Vigenère, navegue a la pestaña "Cifrado Clásico", ingrese el texto y la clave de cifrado, luego elija entre las opciones "Cifrar" o "Descifrar" según sea necesario. El algoritmo mantiene intactos los caracteres no alfabéticos durante el proceso de transformación.

Para ver la lista de usuarios registrados, navegue a la pestaña "Usuarios" y haga clic en "Listar Todos". El sistema mostrará cada usuario junto con su nota sensible cifrada, demostrando cómo se almacenan los datos protegidos en el sistema.

## Medidas de Seguridad Implementadas

La aplicación incorpora múltiples capas de seguridad para proteger los datos sensibles. El hashing de contraseñas utiliza Bcrypt con salt automático, lo que protege contra ataques de tabla arcoíris y hace que cada hash sea único incluso para contraseñas idénticas. El cifrado de datos sensibles utiliza AES-256 en modo Fernet, que proporciona confidencialidad e integridad mediante códigos de autenticación de mensaje (HMAC).

Las claves criptográficas se generan dinámicamente al iniciar el servidor y no se almacenan de manera persistente en esta versión, lo que significa que los datos cifrados no serán recuperables si se reinicia el servidor. Esta característica es apropiada para entornos de demostración y aprendizaje pero debería modificarse para entornos de producción donde se requiera persistencia de datos.

El servidor configura CORS (Cross-Origin Resource Sharing) para permitir solicitudes desde cualquier origen, lo que facilita el desarrollo y las pruebas. En un entorno de producción, esta configuración debería restringirse a los orígenes específicos autorizados para reducir la superficie de ataque.

