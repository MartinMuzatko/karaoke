const fs = require('fs-extra')
const path = require('path')
const duration = require('get-video-duration')

let cachedSongs = null

const SONGINDEX = __dirname + '/songindex'
const QUEUE = __dirname + '/playlist'

async function getQueue() {
    try {
        return fs.readJSON(QUEUE)
    } catch (error) {
        return []        
    }
}

async function deleteFromQueue(index) {
    const queue = await getQueue()
    queue.splice(index, 1)
    return fs.writeJSON(QUEUE, queue)
}

async function shiftQueue() {
    const queue = await getQueue()
    queue.shift()
    return fs.writeJSON(QUEUE, queue)
}

async function setQueue(song) {
    const queue = await getQueue()
    return fs.writeJSON(QUEUE, [...queue, song])
}

async function retrieveCache() {
    if (cachedSongs) return cachedSongs
    cachedSongs = await fs.readJSON(SONGINDEX)
    return cachedSongs
}

function getKeywords(search) {
    if (typeof search != 'string') return
    return search
        .toLowerCase()
        .split(' ')
        .filter(String)
}

async function findSongs(search) {
    const keywords = getKeywords(search)
    const songs = await getSongs()
    return songs
        .map(song => ({
            points: keywords
                .map(
                    keyword =>
                        song.filename.toLowerCase().includes(keyword.toLowerCase()) +
                        song.artist.toLowerCase().includes(keyword.toLowerCase())
                )
                .reduce((previous, current) => previous + current, 0),
            song,
        }))
        .filter(song => song.points)
        .sort((a, b) => {
            if (a.points > b.points) return -1
            if (a.points < b.points) return 1
            return 0
        })
        .slice(0, 15)
}

async function getSongs() {
    await retrieveCache()
    if (cachedSongs) return cachedSongs
    const songs = await fs.readdir(path.resolve(__dirname, '../songs'))
    const mp4Songs = songs.filter(song => song.includes('.mp4'))
    cachedSongs = await Promise.all(mp4Songs.map(getSongInfoFromFilename))
    await fs.ensureFile(SONGINDEX)
    await fs.writeJSON(SONGINDEX, cachedSongs)
    return cachedSongs
}

async function getSongInfoFromFilename(filename) {
    let songtime = NaN
    try {
        songtime = await duration.getVideoDurationInSeconds('../songs/' + filename)
    } catch (error) {
        console.log(`can't read ${filename}`)
    }
    const { name } = path.parse(filename)
    const [artist, songname] = name.split(' - ')
    return { artist, songname, filename, duration: songtime }
}

module.exports = {
    cachedSongs,
    getSongInfoFromFilename,
    getSongs,
    findSongs,
    getKeywords,
    retrieveCache,
    setQueue,
    getQueue,
    shiftQueue,
    deleteFromQueue,
}