'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const fs = require('fs');
const {dialogflow} = require('dialogflow-fulfillment');

const server = express();
server.use(bodyParser.urlencoded({
    extended:true
}));

server.use(bodyParser.json());

var userJson;


server.post('/assistant', (req, res) =>{
    console.log(dialogflowApp);
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
    }else if(action === "userInformation") {

        let parameters = req.body.queryResult.parameters;
        let userFirstName = parameters.given_name;
        let age = parameters.age.amount;
        let country = parameters.geo_country;

        userJson = { "name" : userFirstName, "age" : age, "country" : country};

        return res.json({
            fulfillmentText: "Okay so your name is " + userFirstName + ", you are " + age + " years old and live in " + country,
            source: "userInformation"
        });
    }else if(action === "getUserInformation")
    {
        let fulfillment;
        if(userJson.name === undefined && userJson.country === undefined && userJson.age === undefined)
        {
            fulfillment = "Sorry i don't have any information about you at the moment."
        }
        else
        {
            fulfillment = "I have the following information about you,";
        }

        if(userJson.name !== undefined)
        {
            fulfillment += " your name is " + userJson.name + ",";
        }
        if(userJson.age !== undefined)
        {
            fulfillment += " your age is " + userJson.age;
        }
        if(userJson.country !== undefined)
        {
            fulfillment += " your country is " + userJson.country;
        }

        let a = fulfillment.split("");
        a[fulfillment.lastIndexOf(",")] = "";
        a[fulfillment.lastIndexOf(",")] = "and";

        return res.json({
            fulfillmentText: fulfillment,
            source: "userInformation"
    });
    } else {
        return res.json({
            fulfillmentText: "ok thank you for your information",
            source: "food"
        });
    }
});

server.listen((process.env.PORT || 8000), ()=>{
    console.log("Server is up and running...")
});