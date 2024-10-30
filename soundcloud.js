import axios from "axios";
import cheerio from "cheerio";

class SoundCloud {
    constructor() {
        this.baseUrl = "https://soundcloudmp3.org";
    }
    
    async soundcloud(url) {
        return new Promise(async (resolve, reject) => {
            const { data, headers } = await axios.get(`${this.baseUrl}/id`)
            const $ = cheerio.load(data)
            const token = $('form#conversionForm > input[type=hidden]').attr('value')
            
            const { data: response } = await axios.post(`${this.baseUrl}/converter`,
                new URLSearchParams({ _token: token, url: url }).toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
                        "Cookie": headers["set-cookie"].join("; "),
                    },
                }
            )
            const $$ = cheerio.load(response);
            resolve({
                title: $$('#preview > div:nth-child(3) > p:nth-child(2)').text().replace('Title:', '').trim(),
                duration: $$('#preview > div:nth-child(3) > p:nth-child(3)').text().replace(/Length:|Minutes/g, '').trim(),
                quality: $$('#preview > div:nth-child(3) > p:nth-child(4)').text().replace('Quality:', '').trim(),
                thumbnail: $$('#preview > div:nth-child(3) > img').attr('src'),
                download: $$('#download-btn').attr('href'),
            })
        })
    }
}