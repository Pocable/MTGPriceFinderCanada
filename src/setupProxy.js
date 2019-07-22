const proxy = require('http-proxy-middleware');

// Setup the reverse proxy for f2f and wiz so we can bypass CORS
module.exports = function(app){
    app.use(proxy('/f2f', {target: 'https://www.facetofacegames.com/products/multi_search', changeOrigin: true, pathRewrite: {'^/f2f' : ''}}))
    app.use(proxy('/wiz', {target: 'https://kanatacg.crystalcommerce.com/products/multi_search', changeOrigin: true, pathRewrite: {'^/wiz' : ''}}))
};