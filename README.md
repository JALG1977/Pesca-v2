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
3) Instalar dependencias</br>
•	npm install</br>
4)Android Studio + Android SDK</br>
•	Cable USB</br>
•	En el teléfono: Depuración por USB activada</br>
5) Instalar dependencias</br>
•	npm install</br>
6) Build web</br>
•	ionic build</br>
7) Crear/actualizar plataforma Android</br>
•	Si no existe carpeta android/:</br>
o	npx cap add android</br>
•	Si ya existe:</br>
o	npx cap sync android</br>
8) Abrir en Android Studio</br>
•	npx cap open android</br>
•	En Android Studio:</br>
•	Selecciona el teléfono</br>
•	Run </br>
