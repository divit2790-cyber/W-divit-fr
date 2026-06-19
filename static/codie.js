import { contentFilterText, stopAtLastPeriod, removeBlankLines, toBase64, uploadFile } from "./content-filter.js";
import { elevenlabs_api_key, hugging_face_key } from "./keys.js";

const micButton = document.querySelector('.mic-btn');
const entry = document.querySelector(".image-gen-entry");
const frame = document.querySelector('.text-frame');
const submitButton = document.querySelector('.submit-btn');
const downloadButton = document.querySelector('.download-btn');
const downloadableLink = document.querySelector('.download-link');
const codieIntroTag = document.createElement('div');
const codieInstructionTag = document.createElement('div');
const fileReader = new FileReader();
const imgPromtString = [
    'picture', 'image', 'show me', 'photo'
]
const records = [];
let mediaRecorder;
codieStart();

function addBubbleEvent(bubble){
    /************************************
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     ***********************************/
}

async function audioToText(filename) {
    
    













}

fileReader.onload = function (event) {
    const arrayBuffer = event.target.result;
};

async function textGen(data) {
const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
            headers: {
                Authorization: `Bearer ${hugging_face_key}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}

async function imageGen(data) {
   const response = await fetch(
		"https://router.huggingface.co/together/v1/images/generations",
		{
			headers: {
				Authorization: `Bearer ${hugging_face_key}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();
	return result;
}

navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
    mediaRecorder = new MediaRecorder(stream);
    let chunks = [];
    mediaRecorder.ondataavailable = function (event) {
        chunks = [];
        chunks.push(event.data);
    };
    mediaRecorder.onstop = function () {
        micButton.disabled = true;
        const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
        audioToText(blob).then(async (response) => {
            const userAudio = response.text.toLowerCase();
            mainCall(userAudio);
        });
    };
}).catch(function (err) {
    console.error('Error accessing microphone:', err);
});

micButton.addEventListener('click', () => {
    const icon = micButton.childNodes[0].nodeName.toLowerCase();
    if (icon === 'i') {
        const soundIcon = document.createElement('img');
        soundIcon.src = "../../static/asset/sound.gif";
        soundIcon.classList.add('sound-waves');
        micButton.removeChild(micButton.childNodes[0]);
        micButton.appendChild(soundIcon);
        mediaRecorder.start();
    } else {
        const micIcon = document.createElement('i');
        micIcon.classList.add('fa-solid', 'fa-microphone');
        micButton.removeChild(micButton.childNodes[0]);
        micButton.appendChild(micIcon);
        mediaRecorder.stop();
    }
})

downloadButton.addEventListener('click', () => {
    const filename = "records.txt";
    let conversation = "";
    if (records.length > 0) {
        records.forEach(record => {
            conversation += record + '\n' + '\n';
        });

        const blob = new Blob([conversation], {
            type: 'text/plain;charset=utf-8'
        });
        downloadableLink.download = filename;
        downloadableLink.href = window.URL.createObjectURL(blob);
    }
})

submitButton.addEventListener('click', () => {
    submitEntry();
    submitButton.disabled = true; 
})

async function submitEntry() {
    const input = entry.value.toLowerCase().trim();
    mainCall(input);
}

async function mainCall(userValue) {
    const userInput = document.createElement('div');
    userInput.classList.add("user-bubble");
    const aiOutput = document.createElement('div');
    aiOutput.classList.add("ai-bubble");
    if (userValue != "") {
            if (checkImgPromt(userValue)) {
                userInput.innerHTML = userValue;
                aiOutput.innerHTML = "Loading...";
                frame.appendChild(userInput);
                frame.appendChild(aiOutput);
                const imgCon = document.createElement('div');
                const img = document.createElement('img');
                imageGen({     response_format: "b64_json",
			prompt: userValue,
			model: "stabilityai/stable-diffusion-xl-base-1.0", }).then(async (response) => {
                const temp = await response.text()
					const imageObject = JSON.parse(temp)
					console.log(imageObject)
					const imageURL = imageObject.data[0].b64_json
					const URL = "data:image/png;base64,"+imageURL
					console.log(URL);
                    img.src = URL
                    img.classList.add('image-generated-codie');
                    imgCon.classList.add('image-bubble')
                    imgCon.appendChild(img);
                    frame.appendChild(imgCon)
                    aiOutput.innerHTML = 'Here is your image'
                    frame.scrollTop = frame.scrollHeight
                    resetPlaceholder()
                    records.push("User: " + userInput.innerHTML)
                    records.push(img.src)
                    records.push("AI: " + aiOutput.innerHTML)
                    submitButton.disabled = false
                    micButton.disabled = false
            })
                
            } else {
               textGen({ 
    messages: [
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: userValue,
                },
               
            ],
        },
    ],
    model: "google/gemma-4-31B-it:novita",
})
.then(async (response) => {
    frame.appendChild(userInput)    
    frame.appendChild(aiOutput)
    userInput.innerHTML = userValue
    let cutOff =  stopAtLastPeriod(response["choices"][0]["message"]["content"])
    let noBlankLines = removeBlankLines(cutOff)
    aiOutput.innerHTML = noBlankLines
    aiOutput.classList.add("custom-cursor")
    addBubbleEvent(aiOutput)

    frame.scrollTop = frame.scrollHeight
    resetPlaceholder()
    records.push("User: " + userInput.innerHTML)
    records.push("AI: " + noBlankLines)
     submitButton.disabled = false;
     micButton.disabled = false;

})
            }
        
    }
}

function codieStart() {
    const codieIntro = "Hello, my name is Codie. How can I assist you?";
    const codieInstruction = "Start your sentence with 'generate me an image' or anything to just chat with me!";
    codieIntroTag.classList.add('ai-bubble');
    codieInstructionTag.classList.add('ai-bubble');
    codieIntroTag.textContent = codieIntro;
    codieInstructionTag.textContent = codieInstruction;
    codieIntroTag.classList.add("custom-cursor");
    codieInstructionTag.classList.add("custom-cursor");
    addBubbleEvent(codieIntroTag);
    addBubbleEvent(codieInstructionTag); 
    frame.appendChild(codieIntroTag);
    frame.appendChild(codieInstructionTag);
    records.push("AI: " + codieIntro);
    records.push("AI: " + codieInstruction);
}

function setPlaceholder(cv) {
    if (cv == 0) {
        entry.value = "";
        entry.placeholder = "Please be appropriate!";
    } else {
        entry.value = "";
        entry.placeholder = "There has been an error.";
    }
}

function resetPlaceholder() {
    entry.value = '';
    entry.placeholder = "Chat with Codie or ask him to generate an image";
}

function checkImgPromt(input) {
    for (let i = 0; i < imgPromtString.length; i++) {
        if (input.includes(imgPromtString[i])) {
            return true;
        }
    }
    return false;
}