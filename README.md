
This is the documentation about this thingie

Cordova Plugins Needed
======================

org.apache.cordova.inappbrowser 0.6.0 "InAppBrowser"
org.apache.cordova.splashscreen 1.0.0 "Splashscreen"
org.apache.cordova.statusbar 0.1.10 "StatusBar"


cordova-plugin-splashscreen
cordova-plugin-inappbrowser





Setting up the icons and splash screens
=======================================

<platform name="android">
    
    <icon src="res/android/icon.png" />
    
    <!-- you can use any density that exists in the Android project -->
    <splash src="res/android/splash-port-hdpi.png" density="land-hdpi"/>
    <splash src="res/android/splash-port-ldpi.png" density="land-ldpi"/>
    <splash src="res/android/splash-port-mdpi.png" density="land-mdpi"/>
    <splash src="res/android/splash-port-xhdpi.png" density="land-xhdpi"/>

    <splash src="res/android/splash-port-hdpi.png" density="port-hdpi"/>
    <splash src="res/android/splash-port-ldpi.png" density="port-ldpi"/>
    <splash src="res/android/splash-port-mdpi.png" density="port-mdpi"/>
    <splash src="res/android/splash-port-xhdpi.png" density="port-xhdpi"/>
</platform>

<platform name="ios">
    
    <icon src="res/ios/icon.png" />
    
    <!-- images are determined by width and height. The following are supported -->
    <splash src="res/ios/Default~iphone.png" width="320" height="480"/>
    <splash src="res/ios/Default@2x~iphone.png" width="640" height="960"/>
    <splash src="res/ios/Default-568h@2x~iphone.png" width="640" height="1136"/>
    
    <!-- all the rest use the same image -->
    <splash src="res/ios/Default@2x~iphone.png" width="768" height="1024"/>
    <splash src="res/ios/Default@2x~iphone.png" width="1536" height="2048"/>
    <splash src="res/ios/Default@2x~iphone.png" width="1024" height="768"/>
    <splash src="res/ios/Default@2x~iphone.png" width="2048" height="1536"/>
    
    <splash src="res/ios/Default@2x~iphone.png" width="750" height="1334"/>
    <splash src="res/ios/Default@2x~iphone.png" width="1242" height="2208"/>
    <splash src="res/ios/Default@2x~iphone.png" width="2208" height="1242"/>

</platform>
