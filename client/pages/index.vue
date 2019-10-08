<template>
    <div class="flex flex-row justify-between h-full">
        <div class="w-1/3 black h-full">
            <v-list dark class="h-full">
                <v-list-tile v-for="({ song, username }, index) in queue" :key="song.songname">
                    <v-list-tile-content>
                        <v-list-tile-title>{{ username }} <span class="font-thin">singt</span> {{song.artist}}</v-list-tile-title>
                        <v-list-tile-sub-title>{{song.songname}}</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action class="text-right">
                        {{ song.duration | toMinutes }} <br>
                        <span class="font-thin">{{ getDurations(queue, index) | toMinutes }}</span>
                    </v-list-tile-action>
                </v-list-tile>
            </v-list>
        </div>
        <div class="w-2/3 flex flex-row items-start justify-around">
            <div class="w-2/5">
                <div class="mt-4 shadow rounded p-4 white">
                    <h2 class="flex flex-row items-center justify-start mb-4">
                        <div class="primary flex justify-center items-center text-white w-8 h-8 rounded-full shadow p-2">1</div>
                        <div class="ml-4 text-lg">Nutzername eingeben</div>
                    </h2>
                    <v-text-field
                        name="search"
                        label="Singer Name"
                        prepend-icon="mic"
                        solo
                        v-model="username"
                    ></v-text-field>
                </div>
                <div class="mt-4 shadow rounded p-4 white">
                    {{artists}}
                </div>
            </div>
            <div class="w-2/5 mt-4 shadow rounded overflow-hidden p-4 white" :class="{ 'opacity-50 pointer-events-none': !searchEnabled }">
                <h2 class="flex flex-row items-center justify-start mb-4">
                    <div class="primary flex justify-center items-center text-white w-8 h-8 rounded-full shadow p-2">2</div>
                    <div class="ml-4 text-lg">Song auswählen</div>
                </h2>
                <v-btn v-if="selection" @click="submit" color="primary" class="my-4 m-0">In die Liste!</v-btn>
                <v-text-field
                    name="search"
                    label="Suche Songs"
                    solo
                    v-model="search"
                    @input="findSongs"
                ></v-text-field>
                <v-list class="">
                    <v-list-tile v-for="({ song, points }, index) in songs" :key="song.filename" @click="selection = song">
                        <v-list-tile-content :class="{ 'yellow': !index && search }">
                            <v-list-tile-title>{{song.artist}}</v-list-tile-title>
                            <v-list-tile-sub-title>{{song.songname}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                        <v-list-tile-action>
                            {{ song.duration | toMinutes }}
                        </v-list-tile-action>
                    </v-list-tile>
                </v-list>
            </div>
        </div>
    </div>
</template>

<script>
import debounce from 'debounce'

export default {
    data: () => ({
        search: '',
        username: '',
        songs: [],
        selection: null,
        queue: [],
        ws: null,
        allSongs: [],
    }),
    filters: {
        toMinutes(value) {
            const [minutes, seconds] = (value / 60).toFixed(2).split('.')
            return `${minutes}:${(60 / 100 * seconds).toFixed(0).padStart(2, 0)}`
        }
    },
    mounted() {
        this.ws = new WebSocket('ws://localhost:8890')
        this.ws.addEventListener('message', ({data}) => {
            const map = {
                'queue:shift': () => this.getQueue(),
            }
            map[data] && map[data]()
        })
    },
    async created() {
        try {
            this.allSongs = (await this.$axios.get('songs')).data
            this.getQueue()
        } catch (error) {
            console.log(error)
        }
    },
    methods: {
        async getQueue() {
            this.queue = (await this.$axios.get('queue')).data
        },
        getDurations(songs, songNumber) {
            if (!songNumber) return 0
            return songs
                .filter((song, index) => index <= songNumber)
                .reduce(((previous, current) => previous + current.song.duration), 0)
        },
        submit() {
            // this.queue
            const enqueue = { song: this.selection, username: this.username}
            this.queue.push(enqueue)
            this.$axios.post('queue', enqueue)
            this.username = ''
            this.selection =  null
        },
        findSongs: debounce(async function() {
            const { data: songs} = await this.$axios.get(`songs?search=${this.search}`)
            this.songs = songs
        }, 200)
    },
    computed: {
        searchEnabled() {
            return !!this.username.length
        },
        artists() {
            return [...(new Set(this.allSongs.map(song => song.artist)))]
        }
    }
}
</script>
