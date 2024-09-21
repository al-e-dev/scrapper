import axios from 'axios';
import * as cheerio from 'cheerio';

class Wallpaper {
    constructor() {
        this.baseUrl = 'https://wallspic.com/es/search/';
    }

    async down(url) {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const data = $('a.btn_block.wallpaper__download').attr('href');
        return data;
    }

    async details(url) {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const title = $('h1.wallpaper__title').text().trim();
        const date = $('div.wallpaper__date').text().trim().replace("Descargado ", "");
        const category = $('span.detailsList__label').eq(0).next('a').text().trim();
        const resolution = $('li').filter((i, el) => $(el).find('span.detailsList__label').text().trim()).contents().filter(function() {
            return this.nodeType === 3;
        }).text().trim();
        const uploader = $('span.detailsList__label').eq(2).next('a').text().trim();
        const download = $('a.btn_block.wallpaper__download').attr('href');

        const resolutions = [];
        const promises = [];
        $('.defPanel__item').each((i, el) => {
            const type = $(el).find('button').text().trim();
            $(el).find('.defPanel__list .defPanel__link').each((j, link) => {
                const url = $(link).attr('href');
                const text = $(link).text().trim();
                promises.push(
                    this.down(url).then(download => {
                        resolutions.push({
                            type: type,
                            url: url,
                            resolution: text,
                            download: download
                        });
                    })
                );
            });
        });

        await Promise.all(promises);

        return {
            title,
            date,
            category,
            resolution,
            uploader,
            download,
            resolutions
        };
    }

    async wall(query) {
        const response = await axios.get(`${this.baseUrl}${encodeURIComponent(query)}`);
        const $ = cheerio.load(response.data);

        const results = [];
        const promises = [];

        $('script').each((i, el) => {
            const script = $(el).html();

            if (script && script.includes('window.mainAdaptiveGallery')) {
                const json = script.match(/window.mainAdaptiveGallery\s*=\s*(\{.*?\});/s);
                if (json) {
                    const data = JSON.parse(json[1]);
                    data.list.forEach(item => {
                        const url = item.original.link;
                        promises.push(
                            this.details(url)
                                .then(details => {
                                    results.push({
                                        ...details,
                                        preview: item.thumbnail.link
                                    });
                                })
                        );
                    });
                }
            }
        });

        await Promise.all(promises);

        return results;
    }
}

export default Wallpaper
