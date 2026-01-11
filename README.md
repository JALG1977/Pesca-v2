<strong>Opción A instalar APK</strong> </br>
Descargar desde https://github.com/JALG1977/Pesca-v2/releases/tag/V2</br>
Instalar la aplicación en un teléfono o Tablet.</br>
</br>
<strong>Opción B Instalar y probar el código en un teléfono Android (Capacitor)</strong></br>
</br>
1) Requisitos</br>
•	Node.js (LTS)</br>
•	Git</br>
•	Ionic CLI (si no lo tiene)</br>
2) Clonar el proyecto</br>
•	git clone https://github.com/JALG1977/Pesca-v2.git</br>
•	cd Pesca-v2</br>
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
