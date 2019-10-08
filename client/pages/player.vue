<template>
    <div class="black h-full white--text">
        <video v-if="playing && current" ref="video" autoplay @ended="stopCurrent" controls class="video fixed left-0 top-0 w-full" :src="`//localhost:8890/videos/${current.song.filename}`" />
        <div v-else class="flex flex-col justify-center items-center h-full">
            <div v-if="current" class="flex flex-col justify-center items-center">
                <v-btn color="purple" class="white--text" @click="playNextVideo" >
                    Nächstes Video starten
                </v-btn>
                <h2 class="text-xl">Singer: <b>{{ current.username }}</b></h2>
                <h2 class="text-xl">Lied: <b>{{ current.song.artist }} - {{ current.song.songname }}</b></h2>
            </div>
            <h1 v-else class="text-xxl">Momentan keiner in der Queue</h1>
        </div>
        <div class="purple darken-3 absolute bottom-0 left-0 w-full z-20 h-16 flex flex-col justify-center px-4">
            <div v-if="current">
                Jetzt: <b>{{ current.username }}</b> singt <b>{{ current.song.artist }} - {{ current.song.songname }}</b><br>
            </div>
            <div v-if="next">
                Nächstes Lied: <b>{{ next.username}}</b> singt <b>{{ next.song.artist }} {{ next.song.songname }}</b>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    layout: 'player',
    data: () => ({
        ws: null,
        queue: [],
        playing: true,
    }),
    computed: {
        current() {
            return this.queue[0]
        },
        next() {
            return this.queue[1]
        },
    },
    async created() {
        await this.getQueue()
    },
    mounted() {
        this.ws = new WebSocket('ws://localhost:8890')
        this.ws.addEventListener('message', ({ data }) => {
            const map = {
                'queue:shift': () => this.getQueue(),
                'queue:enqueue': () => this.getQueue(),
            }
            console.log('MSG', data)
            map[data] && map[data]()
        })
    },
    methods: {
        async getQueue() {
            this.queue = (await this.$axios.get('queue')).data
            if (!this.queue.length) this.playing = false
        },
        async stopCurrent() {
            await this.$axios.delete('queue')
            this.playing = false
        },
        playNextVideo() {
            this.playing = true
        }
    }
}
</script>

<style>
.video {
    height: calc(100% - 4rem)
}
.text-xxl {
    font-size: 3rem;
}
</style>
