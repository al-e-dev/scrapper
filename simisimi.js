import axios from 'axios'
import * as cheerio from'cheerio'

class Simi {
    constructor() {
        this.baseUrl = 'https://simsimi.vn'
    }

    async simi(query) {
        return new Promise((resolve, reject) => {
            const params = new URLSearchParams()
            params.append('text', query)
            params.append('lc', 'es')
            params.append('=', '')
    
            const { data: result } = await axios({
                method: 'post',
                url: this.baseUrl + '/web/simtalk',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Accept': 'application/json, text/javascript, /; q=0.01',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                data: params
            })
    
            resolve({
                message: result.success
            })
        })
    }
}

// const a = new Simi()

// a.simi("puta").then(_ => console.log(_)).catch(_ => console.log(_))