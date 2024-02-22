const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        if (registration.installing) {
          console.log("Service worker installing");
        } else if (registration.waiting) {
          console.log("Service worker installed");
        } else if (registration.active) {
          console.log("Service worker active");
        }
      } catch (error) {
        console.error(`Registration failed with ${error}`);
      }
    }
  };
    
  registerServiceWorker();
  

const audioContext = new AudioContext();
const sampleRate = 44100;
const duration = 10;
const bufferSize = duration * sampleRate;

const buttons = document.getElementsByTagName("button");

for(const button of buttons){
    button.className = "button-inactive";
}


document.getElementById('whiteGain').addEventListener('input', e => adjustGain('white', e));
document.getElementById('pinkGain').addEventListener('input', e => adjustGain('pink', e));
document.getElementById('brownGain').addEventListener('input', e => adjustGain('brown', e));


const noiseInstances = {
    white: null,
    pink: null,
    brown: null
};


function adjustGain(type, e){
    const gainValue = parseFloat(e.target.value);
    if (noiseInstances[type]) {
        noiseInstances[type].gainNode.gain.setValueAtTime(gainValue, audioContext.currentTime);
    }
}

function playNoise(type) {
    if (noiseInstances[type]) {
        stopNoise(type);
        document.getElementById(`${type}Bttn`).className = "button-inactive";
        return; 
    }

    const audioSource = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    let noiseBuffer;
    switch (type) {
        case 'white':
            noiseBuffer = generateWhiteNoise(); 
            break;
        case 'pink':
            noiseBuffer = generatePinkNoise();
            break;
        case 'brown':
            noiseBuffer = generateBrownianNoise();
            break;
    }

    audioSource.buffer = noiseBuffer;
    audioSource.connect(gainNode);
    audioSource.connect(audioContext.destination);
    gainNode.connect(audioContext.destination); 
    audioSource.loop = true;
    audioSource.start();
    document.getElementById(`${type}Bttn`).className = "button-active";

    noiseInstances[type] = { audioSource, gainNode }; 
}

function generateWhiteNoise() {
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate white noise values (each sample is a random value between -1 and 1)
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    return noiseBuffer;
}

function generatePinkNoise() {
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink noise generation using Voss-McCartney algorithm
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // (roughly) compensate for gain
        b6 = white * 0.115926;
    }

    return noiseBuffer;
}

function generateBrownianNoise() {
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Brownian noise generation (integration of white noise)
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // (roughly) compensate for gain
    }

    return noiseBuffer;
}

function stopNoise(type) {
    if (noiseInstances[type]) {
        noiseInstances[type].audioSource.stop();
        noiseInstances[type] = null;
    }
}
