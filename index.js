const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const crypto = require('crypto');

const app = express();
const cache = new Map();

app.get('/:size(\\d+)?/:url(*)', async (req, res) => {
    try {
        if (!req.params.url) return res.status(400).send('Missing URL parameter');
        if (!req.params.url.startsWith('http://') && !req.params.url.startsWith('https://'))
            return res.status(400).send('Invalid URL parameter');

        const { size = 32, url } = req.params;
        const width = parseInt(size, 10);
        const cacheKey = crypto.createHash('sha256').update(`${width}-${url}`).digest('hex');
        const cacheControl = req.headers['cache-control'];
        if (cacheControl && cacheControl.includes('no-cache'))
            cache.delete(cacheKey);
        if (cache.has(cacheKey))
            return res.type('png').send(cache.get(cacheKey));

        let iconUrl = `${url}favicon.ico`;
        try {
            const response = await axios.get(url);
            const match = /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut icon|icon)["']|<link\s+[^>]*rel=["'](?:shortcut icon|icon)["'][^>]*href=["']([^"']+)["']/i.exec(response.data);
            iconUrl = match ? (match[1] || match[2]) : iconUrl;
            if (iconUrl && !iconUrl.startsWith('http://') && !iconUrl.startsWith('https://')) {
                const urlParts = url.split('/');
                const domain = urlParts[0] + '//' + urlParts[2];
                iconUrl = domain + (iconUrl.startsWith('/') ? '' : '/') + iconUrl;
            }
            console.info('Found a linked icon URL:', iconUrl);
        } catch { 
            console.error('Error fetching icon from', url);
        }

        const iconResponse = await axios.get(iconUrl, { responseType: 'arraybuffer' });
        const contentType = iconResponse.headers['content-type'];
        const iconBuffer = Buffer.from(iconResponse.data, 'binary');
        const isIcon = (contentType === 'image/x-icon' || contentType === 'image/vnd.microsoft.icon');
        let resizedIcon;
        if(isIcon){
            console.info(`Using ICO image at URL ${iconUrl}`);
            const icojs = await import('icojs');
            const images = await icojs.parseICO(iconBuffer);
            const pngBuffer = images[0].buffer; // Use the first image in the ICO
            resizedIcon = await sharp(pngBuffer).resize(width, width).png().toBuffer();
        }else{
            console.info(`Using image at URL ${iconUrl}, content type ${contentType}`);
            const image = isIcon?sharp(iconBuffer, { pages: -1 }):sharp(iconBuffer);
            resizedIcon = await image.resize(width, width).png().toBuffer();
        }
        cache.set(cacheKey, resizedIcon);
        return res.type('png').send(resizedIcon);
    } catch (ex) {
        console.log('Error generating icon', ex);
        res.status(500).send('Error generating icon');
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));