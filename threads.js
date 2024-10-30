import axios from "axios"

class Threads {
    constructor() {
        this.baseUrl = ""
    }
    async threads(url) {
        const response = await axios.get(`https://api.threadsphotodownloader.com/v2/media?url=${encodeURIComponent(url)}`)
        return response.data
    }
}