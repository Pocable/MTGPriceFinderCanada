const request = require('request');

var FACE_TO_FACE_ENDPOINT = "https://cors-anywhere.herokuapp.com/https://www.facetofacegames.com/products/multi_search";
var WIZARDS_ENDPOINT = "https://cors-anywhere.herokuapp.com/https://kanatacg.crystalcommerce.com/products/multi_search";

function getElementsByXPath(doc, path){
    return doc.evaluate(path, doc, null, XPathResult.ANY_TYPE, null);
}

/**
 * Convert an XResult from .evaluate into a list.
 * @param {The XPathResult} itr 
 */
function convertXResultToList(itr){
    var cur = itr.iterateNext();
    var output = [];
    while(cur){
        output.push(cur);
        cur = itr.iterateNext();
    }
    return output;
}

/**
 * Extract prices from face to face's price HTML string.
 * @param {The input HTML from the XPATH} input 
 */
function extractPriceFromFaceToFaceHTML(input){
    var lines = input.replace("\n", " ").split("$ ");
    var prices = [];
    var left = 0;
    var right = 1;
    while(right < lines.length){
        var data = lines[right].split("\"", 1);
        if(!lines[left].includes("Out of stock") && !data[0].includes("</span>")){
            prices.push(parseFloat(data[0]));
        }
        left += 1;
        right += 1;
    }
    return prices;
}

/**
 * Extract prices from wizards price HTML string
 * @param {The input HTML from the XPATH} input 
 */
function extractPriceFromWizardsHTML(input){
    var lines = input.split("CAD$ ");
    var prices = [];
    for(var i = 1; i < lines.length; i++){
        try{
            var val = parseFloat(lines[i].split("\n", 1)[0]);
            if(!isNaN(val)){
                prices.push(val);
            }
        }catch{
            throw new Error("Unable to determine " + lines[i] + " as a price.");
        }
    }
    return prices;
}

//https://stackoverflow.com/questions/4239587/create-string-from-htmldivelement
function outerHTML(node){
    return node.outerHTML || new XMLSerializer().serializeToString(node);
}

/**
 * Gets the card prices from face to face.
 * @param {The list of cards from the text area} cards 
 */
export const getFaceToFaceCardPrices = async (cards) => {
    return new Promise(function (resolve, reject) {
        request.post({url:FACE_TO_FACE_ENDPOINT, form: {query: cards}}, function(error, resp, body) {
            if(error){
                console.error(error);
                throw new Error('Something is currently wrong. Please see the console.');
            }else{
                // Parase the html recieved from FacetoFace.
                var doc = new DOMParser().parseFromString(body, "text/html");
                var cards_html = doc.getElementsByTagName("h3");
                var values_iter = getElementsByXPath(doc, "//div[@class='inner']");
                var values_html = convertXResultToList(values_iter);


                var expectedValues = 0;

                // Get all card editions and the number of them.
                var card_editions = new Map();
                for(var i = 0; i < cards_html.length; i++){
                    var info = cards_html[i].textContent.split(" results for ");
                    // If the card edition is not undefined or the Search Results, add it.
                    if(info[1] !== undefined && info[0] !== "Search Results"){
                        card_editions.set(info[1].split("\"")[1], parseInt(info[0]));
                        expectedValues += parseInt(info[0]);
                    }
                }


                // Get the card values. Face to face has a wierd duplication ofelements so the array returned
                // from the extract function has more than one of the same value. We can ignore that as price
                // is supposed to be minimal.
                var values = []
                values_html.forEach(val => {
                    values.push(extractPriceFromFaceToFaceHTML(outerHTML(val)));
                });


                // Check if the number of values is equal to the expected number of values.
                if(values.length !== expectedValues){
                    throw new Error("Amount of values differes from the expected amount. Have: " + values.length + " Expected: " + expectedValues);
                }

                var valueIndex = 0;
                var optimal_prices = {};
                // For each card
                for(const card of card_editions.entries()){
                    // Get the amount of card editions, and set optimal amount high.
                    var amount = card[1];
                    var optimal = 99999999999999.0;
                    for(i = valueIndex; i < valueIndex + amount; i++){
                        if(i >= values.length){ break; }
                        for(var k = 0; k < values[i].length; k++){
                            if(values[i][k] < optimal){
                                optimal = values[i][k];
                            }
                        }
                    }
                    valueIndex += amount;
                    optimal_prices[card[0]] = optimal;
                }
                resolve(optimal_prices);
            }
        });
    });
}

/**
 * Get the price of the card list provided on wizards tower.
 * @param {The card list.} cards 
 */
export const getWizardsCardPrices = async (cards) => {
    return new Promise(function (resolve, reject) {
        request.post({url:WIZARDS_ENDPOINT, form: {query: cards}}, function(error, resp, body) {
            if(error){
                console.error(error);
                throw new Error('Something is currently wrong. Please see the console.');
            }else{
                // Parase the html recieved from FacetoFace.
                var doc = new DOMParser().parseFromString(body, "text/html");
                var cards_html = doc.getElementsByClassName("header_row");
                var values_iter = getElementsByXPath(doc, "//table[@class='invisible-table' and not(@border='0')]");
                var values_html = convertXResultToList(values_iter);
                var card_editions = new Map();

                var expectedValues = 0;

                // Load the cards and their number of editions.
                for(var i = 0; i < cards_html.length; i++){
                    var info = cards_html[i].textContent.split(" results for ");
                    var card_name = info[1].split("\"")[1];
                    card_editions.set(card_name, parseInt(info[0]));
                    expectedValues += parseInt(info[0]);
                }

                // Load the values of the cards into a large values array.
                var values = [];
                values_html.forEach(item => {
                    var strings = outerHTML(item).replace("/<[^>]*>/g,", "");
                    values.push(extractPriceFromWizardsHTML(strings));
                });

                // Check if the number of values is equal to the expected number of values.
                if(values.length !== expectedValues){
                    throw new Error("Amount of values differes from the expected amount. Have: " + values.length + " Expected: " + expectedValues);
                }

                var valueIndex = 0;
                var optimal_prices = {};

                for(const card of card_editions.entries()){
                    // Get the amount of card editions, and set optimal amount high.
                    var amount = card[1];
                    var optimal = 99999999999999.0;
                    for(i = valueIndex; i < valueIndex + amount; i++){
                        if(i >= values.length){ break; }
                        for(var k = 0; k < values[i].length; k++){
                            if(values[i][k] < optimal){
                                optimal = values[i][k];
                            }
                        }
                    }
                    valueIndex += amount;
                    optimal_prices[card[0]] = optimal;
                }
                resolve(optimal_prices);
            }
        });
    });
}