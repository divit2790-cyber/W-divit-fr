import { contentFilterText, stopAtLastPeriod, removeBlankLines } from "./content-filter.js";
import { hugging_face_key } from "./keys.js";

const submitButton = document.querySelector(".submit-btn");
const entry = document.querySelector(".image-gen-entry");
const textFrame = document.querySelector(".text-frame");
const downloadButton = document.querySelector(".download-btn");
const downloadableLink = document.querySelector(".download-link");


let records = [];


query({ inputs: "" }).then((response) => {

});
async function query(data) {
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
    submit();
});

async function submit() {
    const input = entry.value;
    if (input != "") {
            query({ 
    messages: [
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: input,
                },
               
            ],
        },
    ],
    model: "google/gemma-4-31B-it:novita",
}).then((response) => 
                {
                    let  AIresult = response["choices"][0]["message"]["content"]
                    console.log(AIresult)
                    const userInput = document.createElement('p')
                    const aiOutput = document.createElement('p')
                    userInput.classList.add("user-bubble")
                    aiOutput.classList.add("ai-bubble")
                    let cutOff = stopAtLastPeriod(AIresult)
                    userInput.innerHTML = input
                    aiOutput.innerHTML = cutOff
                    textFrame.appendChild(userInput)
                    textFrame.appendChild(aiOutput)
                    textFrame.scrollTop = textFrame.scrollHeight
                    entry.value = ''
                    entry.placeholder = "Ask me a question..."
                    let noBlankLines = removeBlankLines(cutOff)
                    records.push("User: " + userInput.innerHTML)
                    records.push("Ai: " + noBlankLines)                    
                
            });

    }

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

