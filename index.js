'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const fs = require('fs');

const server = express();
server.use(bodyParser.urlencoded({
    extended:true
}));

server.use(bodyParser.json());

server.post('/assistant', (req, res) =>{

    let action = req.body.queryResult && req.body.queryResult.action ;

    if(action === "getWeather"){

        let citytoSearch = req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.City ? req.body.queryResult.parameters.City : 'Eindhoven';

        let data = '';
        http.get('http://api.openweathermap.org/data/2.5/weather?q=' + citytoSearch +'&units=metric&appid=004f84a325e90cf982bfb35ddc63c3f5', (resp) => {


            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                console.log(JSON.parse(data).main.temp);
                console.log(citytoSearch);

                return res.json({
                    fulfillmentText: "the weather in " + citytoSearch + " is " + String(JSON.parse(data).main.temp) + " degrees",
                    source: 'weather'
                });
            });

        }).on("error", (err) => {
            console.log(err);
            res.send(null, "something went wrong")
        });
    }else if(action === "getLocation"){

        var obj = JSON.parse(fs.readFileSync('permission.json'));
        res.send(obj);
    }else if(action === "AssistanceIntent.AssistanceIntent-custom")
    {
        console.log(req);
        let id = req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.given_name ? req.body.queryResult.parameters.given_name : null;

        let userFirstName = req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.given_name ? req.body.queryResult.parameters.given_name : null;
        let userLastName = req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.last_name ? req.body.queryResult.parameters.last_name : null;
        let age = req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.age ? req.body.queryResult.parameters.age : null;
        let country = req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.geo_country ? req.body.queryResult.parameters.geo_country : null;
    }else if(action === "foodintent.foodintent-custom"){

        let lat = req.body.originalDetectIntentRequest.payload.device.location.coordinates.latitude;
        let long = req.body.originalDetectIntentRequest.payload.device.location.coordinates.longitude;

        let data = '';

        http.get('http://dev.virtualearth.net/REST/v1/Locations/51.701129599999994,5.2868734?o=&key=Aggj5CpKjEmutBw542gIzwzbk1HMDHoog7meyo5t_jGkS89ehkjyRhRZBvu9Okf7', (resp) =>{

            //http://dev.virtualearth.net/REST/v1/Locations/' + lat + ',' + long +  '?o=&key=Aggj5CpKjEmutBw542gIzwzbk1HMDHoog7meyo5t_jGkS89ehkjyRhRZBvu9Okf7
            resp.on('data', (chunk) =>{
                data += chunk;
            });

            resp.on('end', () =>{

                console.log(JSON.parse(data).resourceSets[0].resources);
                console.log(JSON.parse(data).resourceSets[0].resources[2]);
                return res.json(JSON.parse(data))
            });
        }).on('error', (err) => {
            console.log(err)
            res.json({
                fulfillmentText: "something went wrong finding the location",
                source: 'location'
            })
        })
    }
});

server.listen((process.env.PORT || 8000), ()=>{
    console.log("Server is up and running...")
});