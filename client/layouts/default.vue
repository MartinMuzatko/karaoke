<template>
    <v-app class="h-full">
        <v-toolbar color="primary" class="white--text" fixed app>
            <v-btn icon color="white">
                <v-icon>audiotrack</v-icon>
            </v-btn>
            <v-toolbar-title>H-CON Karaoke Anzeigesystem</v-toolbar-title>
        </v-toolbar>
        <v-content class="h-full">
            <nuxt />
        </v-content>
        <v-footer fixed app dark class="p-2">
            Programmiert mit <v-icon color="red">favorite</v-icon> von Misan, mit den Ideen von Pum, Meow und co :3
        </v-footer>
    </v-app>
</template>
