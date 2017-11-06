'use strict';
let http = require('http');

/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */


// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, cardOutput, speechOutput, repromptText, shouldEndSession) {
    let response = {
        outputSpeech: {
            type: 'PlainText',
            text: speechOutput,
        },
        card: {
            type: 'Simple',
            title: `${title}`,
            content: `${cardOutput}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
    console.log('@@@@@@Final response : ', response);
    return response;
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome to Indian Food';
    const cardOutput = 'Please tell me which food do you want to know nutrition facts of.';
    const speechOutput = 'Welcome to Indian Food. ' +
        'Please tell me which food do you want to know nutrition facts of.';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = 'Which food do you want to know about?';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, cardOutput, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Bye!';
    const speechOutput = 'Thank you for trying Indian Food. Hope this helped you. Have a nice day!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, speechOutput, null, shouldEndSession));
}

/**
 * Get food nutrition facts
 */
function getFoodFact(intent, session, callback) {
    let food = intent.slots.food.value;
    const repromptText = null;
    const sessionAttributes = {};
    let shouldEndSession = false;
    let cardOutput = '';
    let speechOutput = '';

    console.log(`##### FOOD: ${food}`);
    if (food) {
        const url = 'https://indianfoodfacts-api.herokuapp.com/api/food/' + food;
        console.log(`URL: ${url}`);

        http.get(url, function(res) {
            res.on('data', function (body) {
                body = JSON.parse(body);
                console.log('BODY: ' + body);

                if(body.name) {
                    console.log('Response from IndiaFood: ' + body.name);
                    cardOutput = `Nutrition facts of "${body.name.replace('&', ' and ')}" are as follows. \n` +
                        `Fat: ${body.fatInGm} grams, \nCarbs: ${body.carbInGm} grams, \nProtein: ${body.proteinInGm} grams, \nCalories: ${body.calories}`;
                    speechOutput = `Nutrition facts of ${body.name.replace('&', ' and ')} are as follows. ` +
                        `Fat: ${body.fatInGm} grams, Carbs: ${body.carbInGm} grams, Protein: ${body.proteinInGm} grams, Calories: ${body.calories}`;
                } else {
                    console.log('Response from IndiaFood: Food details not found');
                    speechOutput = `Nutrition facts of "${food}" are not found. Please try some other food.`;
                    cardOutput = speechOutput;
                }
                shouldEndSession = true;

                callback(sessionAttributes,
                    buildSpeechletResponse(food, cardOutput, speechOutput, repromptText, shouldEndSession));
            });

        }).on('error', function(e) {
            speechOutput = `We could not connect to the remote server to get data about "${food}". Sorry!`;
            cardOutput = speechOutput;
            console.log("Got error: " + e.message);

            callback(sessionAttributes,
                buildSpeechletResponse("Error connecting to Indian Food server", cardOutput, speechOutput, repromptText, shouldEndSession));
        });


    } else {
        speechOutput = "I'm not sure which food you are looking for";
        cardOutput = speechOutput;

        callback(sessionAttributes,
            buildSpeechletResponse('Food name not recognised', cardOutput, speechOutput, repromptText, shouldEndSession));    }
}


/**
 * Get food nutrition facts
 */
function getAnyFoodFact(intent, session, callback) {
    const repromptText = null;
    const sessionAttributes = {};
    let shouldEndSession = false;
    let cardOutput = '';
    let speechOutput = '';

    var url = 'https://indianfoodfacts-api.herokuapp.com/api/anyfood';
    console.log(`URL: ${url}`);

    http.get(url, function(res) {
        res.on('data', function (body) {
            body = JSON.parse(body);
            console.log('BODY: ' + body);

            if(body.name) {
                console.log('Response from IndiaFood: ' + body.name);
                cardOutput = `Nutrition facts of "${body.name.replace('&', ' and ')}" are as follows. \n` +
                    `Fat: ${body.fatInGm} grams, \nCarbs: ${body.carbInGm} grams, \nProtein: ${body.proteinInGm} grams, \nCalories: ${body.calories}`;
                speechOutput = `Nutrition facts of ${body.name.replace('&', ' and ')} are as follows. ` +
                    `Fat: ${body.fatInGm} grams, Carbs: ${body.carbInGm} grams, Protein: ${body.proteinInGm} grams, Calories: ${body.calories}`;
            } else {
                console.log('Response from IndiaFood: Food details not found');
                speechOutput = `Could not get food facts. Sorry!`;
                cardOutput = speechOutput;
            }
            shouldEndSession = true;

            callback(sessionAttributes,
                buildSpeechletResponse(body.name, cardOutput, speechOutput, repromptText, shouldEndSession));
        });

    }).on('error', function(e) {
        speechOutput = `We could not connect to the remote server to get data. Sorry!`;
        cardOutput = speechOutput;
        console.log("Got error: " + e.message);

        callback(sessionAttributes,
            buildSpeechletResponse("Error connecting to Indian Food server", cardOutput, speechOutput, repromptText, shouldEndSession));
    });
}


// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    console.log(`$$$$$$$ ${intentName}`);
    // Dispatch to your skill's intent handlers
    if (intentName === 'FindFood') {
        getFoodFact(intent, session, callback);
    } else if (intentName === 'AnyFood') {
        getAnyFoodFact(intent, session, callback);
    } else if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw new Error('Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             callback('Invalid Application ID');
        }
        */

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
