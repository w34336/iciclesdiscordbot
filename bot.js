const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const express = require('express');
const app = express();
const authkey = require('./auth.json');
const rp = require('request-promise');
const GOLD = ':regional_indicator_g:';
const SILVER = ':regional_indicator_s:';
const COPPER = ':regional_indicator_c:';
const REGION = 'na';

client.on('ready', () => {
    console.log('Bot Started');
});

client.on('message', (message) => {
    console.log(message.content);
    if (message.content.substr(0,7) === '=market' && message.author.username === 'Icicles') {
        let msg = message.content;
        let ch = message.channel;
        let item = msg.substr(msg.indexOf(' ')+1);
        let itemReq = {
            url: 'https://api.silveress.ie/bns/v3/items',
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true
        };
        rp(itemReq).then(data => {
            let itemId = -1;
            for (let i = 0; i < data.length; i++) {
                if (data[i].name.toLowerCase() === item) {
                    let itemName = data[i].name;
                    itemId = data[i].id;
                    let priceReq = {
                        url: 'http://api.silveress.ie/bns/v3/market/' + REGION + '/current/' + itemId,
                        headers: {
                            'User-Agent': 'Request-Promise'
                        },
                        json: true
                    };
                    rp(priceReq).then(resp => {
                        if (resp.toString().length < 10) {
                            ch.send(itemName + ' not available on market currently.');
                            return;
                        }
                        let itemPrice = resp[0].listings[0].each;
                        let currency = convertCurrency(itemPrice);
                        let embed = new Discord.RichEmbed()
                            .addField(itemName,currency,true)
                            .setThumbnail(data[i].img)
                            .setTimestamp();
                        ch.send(embed);
                    }).error(() => console.log(error));
                }

            }
            if (itemId === -1) {
                message.channel.send('Item not found');
            }
        }).error(function (err) {
            console.error(err);
        });
    }
});

function convertCurrency(price) {
    let str = price.toString();
    let gold = str.substring( 0 , str.length -4);
    let silver = str.substring(str.length -2 ,str.length - 4);
    let copper = str.substring(str.length, str.length -2);
    return gold + GOLD + silver + SILVER + copper + COPPER;
}

// function findItemId(name) {
//     request.get('https://api.silveress.ie/bns/v3/items', function(err, resp, body) {
//         if (err){
//             console.error(err);
//         }
//         else {
//             let data = JSON.parse(body);
//             for(let i=0; i < data.length; i++) {
//                 if (data[i].name.toLowerCase() === name) {
//                     console.log('return' + data[i].id);
//                     let itemId = data[i].id;
//                     return itemId;
//                 }
//             }
//             return -1;
//
//         }
//     });
// }

client.login(authkey.token);

