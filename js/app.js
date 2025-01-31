/********************************************************************* 
 * Web AI Agent for Flights designed and coded by Jason Mayes 2025. 
 *--------------------------------------------------------------------
 * Connect with me on social if aquestions or comments:
 *
 * LinkedIn: https://www.linkedin.com/in/webai/
 * Twitter / X: https://x.com/jason_mayes
 * Github: https://github.com/jasonmayes
 * CodePen: https://codepen.io/jasonmayes
 *********************************************************************/

import {FilesetResolver, LlmInference} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai';
import FileProxyCache from 'https://cdn.jsdelivr.net/gh/jasonmayes/web-ai-model-proxy-cache@main/FileProxyCache.min.js';


/**************************************************************
 * DOM References and defaults
 **************************************************************/
const SIDE_PANEL_LLM_WRITE_SPACE = document.getElementById('sidePanelInterface');
const PRELOADER = document.getElementById('preloader');
const CHAT = document.getElementById('chat');
const FLIGHTS_TRIP_TYPE = document.getElementById('tripType');
const FLIGHTS_PASSENGER_COUNT = document.getElementById('passengerCount');
const FLIGHTS_TRIP_CLASS = document.getElementById('tripClass');
const FLIGHTS_DESTINATIONS = document.getElementById('destinations');
const FLIGHTS_SEARCH = document.getElementById('search');
const SEARCH_RESULTS_AREA = document.getElementById('searchResults');
const HCI_PERSONA_TEXTBOX = document.getElementById('hciPersona');
const FAKE_API_PERSONA_TEXTBOX = document.getElementById('fakeAPIPersona');
const CHAT_BTN = document.getElementById('chatBtn');
const ERASE_MEMORY_BTN = document.getElementById('eraseMemorytBtn');
const TALK_TO_AGENT_BTN = document.getElementById('talkToAgent');
const PROGRESS = document.getElementById('progress');



/**************************************************************
 * Web AI Gemma 2 LLM code.
 **************************************************************/
const modelFileNameRemote = 'https://storage.googleapis.com/jmstore/WebAIDemos/models/Gemma2/gemma2-2b-it-gpu-int8.bin';
const modelFileName = 'http://localhost/gemma2-2b-it-gpu-int8.bin';

const CHAT_PERSONA_NAME = 'chatPersona';
const API_PERSONA_NAME = 'apiPersona';
const CHAT_PERSONA_HISTORY = [];
const API_PERSONA_HISTORY = [];

let llmInference = undefined;
let lastGeneratedResponse = '';
let activePersona = '';



function fileProgressCallback(textUpdate) {
  PROGRESS.innerText = textUpdate;
}


async function initLLM() {
  // Attempt to load from cache or localhost.
  let dataUrl = await FileProxyCache.loadFromURL(modelFileName, fileProgressCallback);
  // If failed due to no local file stored, fetch cloud version instead from cache or remote.
  if (dataUrl === null) {
    dataUrl = await FileProxyCache.loadFromURL(modelFileNameRemote, fileProgressCallback);
  }
  PROGRESS.innerText = 'Model downloaded. Intializing on GPU... Please wait.';
  
  const genaiFileset = await FilesetResolver.forGenAiTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm');
  
  let llm = await LlmInference.createFromOptions(genaiFileset, {
    baseOptions: {
      modelAssetPath: dataUrl
    },
    maxTokens: 8000,
    topK: 1,
    temperature: 0.01, // More deterministic and focused.
    randomSeed: 64
  });
  //.createFromModelPath(genaiFileset, modelFileName)

  llmInference = llm;
  PRELOADER.classList.remove('animate__fadeIn');
  PRELOADER.classList.add('animate__fadeOut');
  setTimeout(function() {
    PRELOADER.setAttribute('class', 'removed');
  }, 1000);

}


function executeAgent(task, personaName, personaHistory) {
  // Only proceed with execution if no active generation in progress.
  if (lastGeneratedResponse === '') {
    activePersona = personaName;
    personaHistory.push('<start_of_turn>user\n' + task + '<end_of_turn>\n<start_of_turn>model\n');

    if(llmInference !== undefined) {
      llmInference.generateResponse(personaHistory.join(''), displayPartialAgentResults);
    }

    if (activePersona === API_PERSONA_NAME) {
      SEARCH_RESULTS_AREA.innerHTML = '<h2>Please wait - generating pretend search results emulating an API call - watch progess in the left hand panel!</h2><p>This may take a moment. In a real world situation you would just call some API which would be faster but I want to demonstrate how capable this tiny model is.</p>';
    } else {
      SEARCH_RESULTS_AREA.innerHTML = '<h2>Analysing user input</h2><p>This may take a moment. Please respond with any extra information the agent may ask you. Please wait.</p>';
    }

    SEARCH_RESULTS_AREA.setAttribute('class', 'preSearch');
  } else {
    console.warn('Can not process request as agent busy!');
  }
}

initLLM();



/**************************************************************
 * Web app business logic - the typical code the web app would
 * have used without any Agents to get stuff done 
***************************************************************/

// Here we are using the LLM to generate fake search results
// too but this would traditionally be an API call to some server DB.
FLIGHTS_SEARCH.addEventListener('click', function() {
  // Use API persona.
  let context = CHAT_PERSONA_HISTORY[CHAT_PERSONA_HISTORY.length -1];
  executeAgent(context, API_PERSONA_NAME, API_PERSONA_HISTORY);
});

// Call the agent from our app logic to execute user demand.
CHAT_BTN.addEventListener('click', function() {
  SIDE_PANEL_LLM_WRITE_SPACE.innerText = '';
  executeAgent(CHAT.value, CHAT_PERSONA_NAME, CHAT_PERSONA_HISTORY);
  CHAT.value = '';
});

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SPEECH_RECOGNITION = new window.SpeechRecognition();
SPEECH_RECOGNITION.continuous = true;
SPEECH_RECOGNITION.interimResults = true;
SPEECH_RECOGNITION.addEventListener("result", function(data) {
 for (const result of data.results) {
   if (result.isFinal) {
     console.log(result[0].transcript);
     executeAgent(result[0].transcript, CHAT_PERSONA_NAME, CHAT_PERSONA_HISTORY);
   }
 }
});

function speechDeactivated () {
  TALK_TO_AGENT_BTN.setAttribute('class', '');
  // Allow 1s grace for speech recognition to finish.
  setTimeout(function(){
    SPEECH_RECOGNITION.stop();
  },1000);
}

TALK_TO_AGENT_BTN.addEventListener('mousedown', function() {
  this.setAttribute('class', 'activated');
  SPEECH_RECOGNITION.start();
});
TALK_TO_AGENT_BTN.addEventListener('mouseup', speechDeactivated);
TALK_TO_AGENT_BTN.addEventListener('focusout', speechDeactivated);

// As this is a demo we also allow the clearning of agent memory to start fresh.
ERASE_MEMORY_BTN.addEventListener('click', function() {
  CHAT_PERSONA_HISTORY.splice(0);
  CHAT_PERSONA_HISTORY.push(agentPersonas[CHAT_PERSONA_NAME]);

  API_PERSONA_HISTORY.splice(0);
  API_PERSONA_HISTORY.push(agentPersonas[API_PERSONA_NAME]);

  SIDE_PANEL_LLM_WRITE_SPACE.innerText = '';
});


// Handle rendering of results sent back from LLM.
function displayPartialAgentResults(partialResults, complete) {
  lastGeneratedResponse += partialResults;
  SIDE_PANEL_LLM_WRITE_SPACE.innerText = lastGeneratedResponse;
  
  if (complete) {
    if (!lastGeneratedResponse) {
      console.error('Result is empty');
    }
    
    // Decide which chat history to work with.
    let chatHistory;
    if (activePersona === CHAT_PERSONA_NAME) {
      chatHistory = CHAT_PERSONA_HISTORY;
    } else if(activePersona === API_PERSONA_NAME) {
      chatHistory = API_PERSONA_HISTORY;
    }
    
    // Concat with open model turn to complete history correctly.
    chatHistory[chatHistory.length - 1] += lastGeneratedResponse + '<end_of_turn>\n';
    
    // Ensure we dont max out our tokens in a long chatty user session.
    if (chatHistory.length > 7) {
      // remove the 2nd chat from the start so not to remove
      // the persona def.
      chatHistory.splice(1, 1);
    }

    // Check for follow up questions or if we found everything
    // needed to call a function.
    let answerObj = undefined;
    
    try {
      answerObj = JSON.parse(lastGeneratedResponse.split('```json')[1].split('```')[0]);

      // Check what type of response the LLM is giving.
      if (answerObj.results.length === 0) {
        // Agent has all data it needs from user to search a
        // flight as no follow ups defined.
        if (answerObj.followUpQuestion === 'none' || !lastGeneratedResponse.includes('"undefined"')) {
          // Force any chattyness to stop as all values
          // are filled.
          const regex = /"followUpQuestion": .+"/gm;
          chatHistory[chatHistory.length - 1] = chatHistory[chatHistory.length - 1].replace(regex, '"followUpQuestion": "none"');
          
          refreshUserSearchData(answerObj);
          // Set time to wait before calling agent again to 
          // prevent edge case bug with MP lib.
          setTimeout(function() {
            agentSearch();
          }, 100);
        } else {
          // Update GUI to show question.
          SEARCH_RESULTS_AREA.innerHTML = '<h2>Please answer the follow up question below</h2><p>' + answerObj.followUpQuestion + '</p>';
          // Else ask follow up question for user to respond
          // to and wait for user to take action.
          let utterance = new SpeechSynthesisUtterance(answerObj.followUpQuestion);
          speechSynthesis.speak(utterance);
        }
      } else {
        // We are generating fake search results for this 
        // demo app instead of calling a real API.
        // First update the user search data incase user 
        //changed something
        refreshUserSearchData(answerObj);
        // Display the fake search results that came back.
        displaySearchResults(answerObj);
      }
    } catch(e) {
      // LLM fail at valid JSON response. 
      // Potentially try and pass manually or follow up 
      //asking it to fix broken JSON it returned.
      console.warn('Invalid JSON generated');
      // For now we just log bad JSON for debugging.
      console.log(answerObj);
    }

    lastGeneratedResponse = '';
  }
}


// Web Dev designs a suitable Agent persona to work with 
// the exposed functions below.
function setupAgentPersonas() {
  // In this demo we set defaults in the HTML itself so 
  // you can play around later. Also append current date for smarts.
  const today = new Date();
  const dateStr = today.getDate() + '/' + today.getMonth() + 1 + '/'+ today.getFullYear();
  
  let personas = {
    [CHAT_PERSONA_NAME]: HCI_PERSONA_TEXTBOX.value + '\n The current date is: ' + dateStr,
    [API_PERSONA_NAME]: FAKE_API_PERSONA_TEXTBOX.value
  };
  
  return personas;
}


function agentPersonaChange() {
  agentPersonas = setupAgentPersonas();
  
  // Overwrite persona in current persona chat histories too.
  CHAT_PERSONA_HISTORY[0] = agentPersonas[CHAT_PERSONA_NAME];
  API_PERSONA_HISTORY[0] = agentPersonas[API_PERSONA_NAME];

  SIDE_PANEL_LLM_WRITE_SPACE.innerText = '';
}


let agentPersonas = setupAgentPersonas();
HCI_PERSONA_TEXTBOX.addEventListener('keyup', agentPersonaChange);
FAKE_API_PERSONA_TEXTBOX.addEventListener('keyup', agentPersonaChange);
CHAT_PERSONA_HISTORY.push(agentPersonas[CHAT_PERSONA_NAME]);
API_PERSONA_HISTORY.push(agentPersonas[API_PERSONA_NAME]);


/** 
 *  Web App Agent Functions it can call. 
 *
 *  This is a develeoper decision what to expose so 
 *  they always stay in control of what functions to
 *  expose to agent. This also means they can control
 *  the UX when an agent does something vs a human eg
 *  perform actions faster but could still educate user
 *  watching on how GUI is used to learn from the agent
 * behaviour.
 **/

function agentSearch() {
  FLIGHTS_SEARCH.click();
}


function agentSetTripType(value) {
  if (value === 'oneway') {
    FLIGHTS_TRIP_TYPE.selectedIndex = 1;
  } else if (value === 'multitrip') {
    FLIGHTS_TRIP_TYPE.selectedIndex = 2;
  } else {
    FLIGHTS_TRIP_TYPE.selectedIndex = 0;
  }
}


function agentSetPassengerCount(value) {
  let n = parseInt(value);
  FLIGHTS_PASSENGER_COUNT.selectedIndex = n - 1;
}


function agentSetSeatClass(value) {
  if (value === 'first' || value === 'first class') {
    FLIGHTS_TRIP_CLASS.selectedIndex = 3;
  } else if(value === 'business' || value === 'business class') {
    FLIGHTS_TRIP_CLASS.selectedIndex = 2;
  } else if(value === 'premium economy') {
    FLIGHTS_TRIP_CLASS.selectedIndex = 1;
  } else {
    FLIGHTS_TRIP_CLASS.selectedIndex = 0;
  }
  
  FLIGHTS_TRIP_CLASS.classList.add('animate__tada');
  setTimeout(function() {FLIGHTS_TRIP_CLASS.classList.remove('animate__tada')}, 200);
}


function agentSetTravelLegs(values) {
  FLIGHTS_DESTINATIONS.innerHTML = '';
  for (let n = 0; n < values.length; n++) {
    const LI = document.createElement('li');
    
    const TRIP_FROM = document.createElement('input');
    TRIP_FROM.setAttribute('class', 'tripElement tripFrom animate__animated animate__tada');
    TRIP_FROM.setAttribute('type', 'text');
    TRIP_FROM.value = values[n].departureLocation;

    const TRIP_TO = document.createElement('input');
    TRIP_TO.setAttribute('class', 'tripElement tripTo animate__animated animate__tada');
    TRIP_TO.setAttribute('type', 'text');
    TRIP_TO.value = values[n].destinationLocation;
    
    const TRIP_DEPART = document.createElement('input');
    TRIP_DEPART.setAttribute('class', 'tripElement tripDepart animate__animated animate__tada');
    TRIP_DEPART.setAttribute('type', 'text');
    TRIP_DEPART.value = values[n].departureDate;
    
    const TRIP_RETURN = document.createElement('input');
    TRIP_RETURN.setAttribute('type', 'text');
    TRIP_RETURN.value = values[n].returnDate;
    if (values[n].return === 'oneway' || values[n].return === 'undefined') {
      TRIP_RETURN.setAttribute('class', 'tripElement tripReturn removed');
      agentSetTripType('oneway');
    } else {
      TRIP_RETURN.setAttribute('class', 'tripElement tripReturn animate__animated animate__tada');
    }
    
    LI.appendChild(TRIP_FROM);
    LI.appendChild(TRIP_TO);
    LI.appendChild(TRIP_DEPART);
    LI.appendChild(TRIP_RETURN);
    
    FLIGHTS_DESTINATIONS.appendChild(LI);
  }
}


function refreshUserSearchData(answerObj) {
  agentSetPassengerCount(answerObj.passengerCount);
  agentSetSeatClass(answerObj.seatClass);
  agentSetTravelLegs(answerObj.legs);
}


function displaySearchResults(data) {
  document.body.setAttribute('class', 'search');
  
  SEARCH_RESULTS_AREA.innerHTML = '';
  
  const TABLE = document.createElement('table');
  
  for (let n = 0; n < data.results.length; n++) {
    const TR = document.createElement('tr');
    
    const TD_AIRLINE = document.createElement('td');
    TD_AIRLINE.innerText = data.results[n].airline;
    TD_AIRLINE.setAttribute('class', 'rowAirline');
    TR.appendChild(TD_AIRLINE);
    
    const TD_FLIGHT_NUM = document.createElement('td');
    TD_FLIGHT_NUM.innerText = data.results[n].flightNumber;
    TD_FLIGHT_NUM.setAttribute('class', 'rowFlightNum');
    TR.appendChild(TD_FLIGHT_NUM);
    
    const TD_TIMING = document.createElement('td');
    TD_TIMING.innerText = data.results[n].departingTime + ' - ' + data.results[n].arrivingTime;
    TD_TIMING.setAttribute('class', 'rowTiming');
    TR.appendChild(TD_TIMING);

    const TD_DEPART_AIRPORT = document.createElement('td');
    TD_DEPART_AIRPORT.innerText = data.results[n].departingAirport;
    TD_DEPART_AIRPORT.setAttribute('class', 'rowDepartAirport');
    TR.appendChild(TD_DEPART_AIRPORT);

    const TD_ARRIVE_AIRPORT = document.createElement('td');
    TD_ARRIVE_AIRPORT.innerText = data.results[n].arrivingAirport;
    TD_ARRIVE_AIRPORT.setAttribute('class', 'rowArriveAirport');
    TR.appendChild(TD_ARRIVE_AIRPORT);
    
    const TD_STOPS = document.createElement('td');
    TD_STOPS.innerText = data.results[n].numberOfFlightChanges + ' changes';
    TD_STOPS.setAttribute('class', 'rowStops');
    TR.appendChild(TD_STOPS);
    
    const TD_DURATION = document.createElement('td');
    TD_DURATION.innerText = data.results[n].flightDuration;
    TD_DURATION.setAttribute('class', 'rowDuration');
    TR.appendChild(TD_DURATION);

    const TD_AIRCRAFT_MAKE = document.createElement('td');
    TD_AIRCRAFT_MAKE.innerText = data.results[n].aircraftType;
    TD_AIRCRAFT_MAKE.setAttribute('class', 'rowMake');
    TR.appendChild(TD_AIRCRAFT_MAKE);
    
    const TD_COST = document.createElement('td');
    TD_COST.innerText = data.results[n].cost;
    TD_COST.setAttribute('class', 'rowCost');
    TR.appendChild(TD_COST);
    
    TABLE.appendChild(TR);
  }
  SEARCH_RESULTS_AREA.setAttribute('class', 'searchComplete');
  SEARCH_RESULTS_AREA.appendChild(TABLE);
}
