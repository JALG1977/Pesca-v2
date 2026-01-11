Opción A instalar APK
Descargar desde https://github.com/JALG1977/Pesca-v2/releases/tag/V2
Instalar la aplicación en un teléfono o Tablet.

Opción B Instalar y probar el código en un teléfono Android (Capacitor)

1) Requisitos
•	Node.js (LTS)
•	Git
•	Ionic CLI (si no lo tiene)
2) Clonar el proyecto
•	git clone https://github.com/JALG1977/Pesca-v2.git
•	cd Pesca-v2
3) Instalar dependencias
•	npm install
4)Android Studio + Android SDK
•	Cable USB
•	En el teléfono: Depuración por USB activada
5) Instalar dependencias
•	npm install
6) Build web
•	ionic build
7) Crear/actualizar plataforma Android
•	Si no existe carpeta android/:
o	npx cap add android
•	Si ya existe:
o	npx cap sync android
8) Abrir en Android Studio
•	npx cap open android
•	En Android Studio:
•	Selecciona el teléfono
•	Run 
