cd C:\DEV\Pesca

rem borrar build de @capacitor/android
rmdir /S /Q node_modules\@capacitor\android\capacitor\build

rem borrar build de @capacitor/app
rmdir /S /Q node_modules\@capacitor\app\android\build

rem borrar build de otros plugins de capacitor (por las dudas)
rmdir /S /Q node_modules\@capacitor\haptics\android\build
rmdir /S /Q node_modules\@capacitor\keyboard\android\build
rmdir /S /Q node_modules\@capacitor\status-bar\android\build

rem y también el de sqlite comunitario
rmdir /S /Q node_modules\@capacitor-community\sqlite\android\build
