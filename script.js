// =============
// SOUND MANAGER
// =============
const audio = document.getElementById("audio");
const soundEffect = document.getElementById("soundEffect");
const soundButton = document.getElementById("soundToggle");
var soundOn = false;
var currentAudio = "";
var currentAudioVolume = 0;

function toggleSoundOnOff()  {
    if (soundOn === true) {
        soundOn = false;
        soundButton.src = "./images/no_audio.png";
        soundButton.alt = "Audio off";
        audio.pause();
    } else if (soundOn === false) {
        soundOn = true;
        soundButton.src = "./images/audio.png";
        soundButton.alt = "Audio on";
        audio.volume = currentAudioVolume;
        audio.play();
    }
}

function playSound(soundType, soundFile, volume) {
    if (soundFile) {
        if (soundType === audio) {
            if (currentAudio !== soundFile) {
                currentAudio = soundFile;
                currentAudioVolume = volume;
                audio.src = soundFile;
                audio.pause();
            }

            if (soundOn === true) {
                audio.volume = currentAudioVolume;
                audio.play();
            }

        } else if (soundType === soundEffect) {
            soundEffect.src = soundFile;
            soundEffect.pause();

            if (soundOn === true) {
                soundEffect.volume = volume;
                soundEffect.play();
            }
        }
    }
}



// ===================
// FULLSCREEN MANAGER
// ===================
const documentElement = document.documentElement;
const fullscreenButton = document.getElementById("fullscreenToggle");

function toggleFullscreenMode()  {
    if (fullscreenButton.alt === "Exit Fullscreen") {
        fullscreenButton.src = "./images/fullscreen_icon.png";
        fullscreenButton.alt = "Enter Fullscreen";
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }

    } else if (fullscreenButton.alt === "Enter Fullscreen") {
        fullscreenButton.src = "./images/minimise_icon.png";
        fullscreenButton.alt = "Exit Fullscreen";
        if (documentElement.requestFullscreen) {
            documentElement.requestFullscreen();
        } else if (documentElement.webkitRequestFullscreen) {
            documentElement.webkitRequestFullscreen();
        }
    }
}


// ==========
// GAME TIMER
// ==========
var startTime, endTime;

function toTime(time) {
    // Convert seconds into a string representing the time
    time = Math.round(time);
    var minutes = Math.floor(time / 60);
    var seconds = time - (minutes * 60);

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return minutes + ':' + seconds;
}

function startTimer() {
    startTime = new Date();
}

function stopTimer() {
    endTime = new Date();
    var timeDiff = endTime - startTime;
    // Convert from milliseconds to seconds
    timeDiff = timeDiff / 1000;

    return toTime(timeDiff);
}



// =============
// GAME MANAGER
// =============
const outputBox = document.getElementById("output");
const optionButtons = document.getElementById("optionButtons");
const contentOverlayBox = document.getElementById("contentOverlay");

var state = {};
var previousSceneIndex;


function startGame() {
    state = {};
    previousSceneIndex = null;
    outputBox.innerHTML = "<h1>The Awakening</h1>";
    optionButtons.innerHTML = "";
    randomiseItemLocations();
    showInitialScene();
}


function randomiseItemLocations() {
    // Randomise Downstairs Study Key location.
    var downstairsStudyKeyLocations = [{ keyUnderUpstairsBed: true }, { keyInKitchenCupboard: true }];
    var number = Math.floor(Math.random() * downstairsStudyKeyLocations.length);
    state = Object.assign(state, downstairsStudyKeyLocations[number]);
    
    // Randomise Crowbar location.
    var crowbarLocations = [{ crowbarBehindUpstairsCurtain: true }, { crowbarBehindLoungeCurtain: true }, { crowbarInDiningRoomDebris: true }];
    var number = Math.floor(Math.random() * crowbarLocations.length);
    state = Object.assign(state, crowbarLocations[number]);

    // Randomise Upstairs Bedroom Key location.
    var upstairsBedroomKeyLocations = [{ keyInLoungeTable: true }, { keyInNurseryCot: true }];
    var number = Math.floor(Math.random() * upstairsBedroomKeyLocations.length);
    state = Object.assign(state, upstairsBedroomKeyLocations[number]);
    
    // Randomise Front Door Key location.
    var frontDoorKeyLocations = [{ keyInStudyCupboard: true }, { keyInStudyDesk: true }];
    var number = Math.floor(Math.random() * frontDoorKeyLocations.length);
    state = Object.assign(state, frontDoorKeyLocations[number]);

    // Randomise chance of death from barbed wire in Scene 3.
    number = Math.floor(Math.random() * 2);
    if (number == 1) {
        state = Object.assign(state, { barbedWireCausesDeath: true });
    }

    // Randomise chance of death from upstairs bedroom closet in Scene 10.
    number = Math.floor(Math.random() * 2);
    if (number == 1) {
        state = Object.assign(state, { figureInUpstairsBedroomCloset: true });
    }
}


function showInitialScene() {
    const scene = sceneMap.find((scene) => scene.id === 0);
    displayImage("./images/forest_path.png");
    playSound(audio, scene.audio, scene.audioVolume);
    displayMessage(`You are in a dark and creepy looking forest. The sun is setting and it is getting dark quickly.`);
    displayMessage(scene.text);
    scene.options.forEach((option) => {
        const button = document.createElement("button");
        button.innerText = option.text;
        button.classList.add("optionButton");
        button.addEventListener("click", () => selectOption(option));
        optionButtons.appendChild(button);
    });
    contentOverlayBox.scrollTop = contentOverlayBox.scrollHeight;
    startTimer();
}


function changeScene(sceneIndex, previousOption) {
    const scene = sceneMap.find((scene) => scene.id === sceneIndex);
    if (scene == null) return;
    displayImage(scene.image);
    playSound(audio, scene.audio, scene.audioVolume);

    if (sceneIndex !== previousSceneIndex) {
        if (previousOption.hideDestinationText !== true) {            
            displayMessage(scene.text);
        }
        previousSceneIndex = sceneIndex;

        if (scene.setState) {
            state = Object.assign(state, scene.setState);
        }

        while (optionButtons.firstChild) {
            optionButtons.removeChild(optionButtons.firstChild);
        }

        scene.options.forEach((option) => {
            const button = document.createElement("button");
            button.innerText = option.text;
            button.classList.add("optionButton");
            button.addEventListener("click", () => selectOption(option));
            optionButtons.appendChild(button);
        });
    }
}


function displayImage(imageURL) {
    if (imageURL) {
        var img = document.createElement("img");
        img.alt = "An image which is symbolic of the current location within the game.";
        img.classList.add("output");
        img.src = imageURL;
        outputBox.appendChild(img);
    }
}


function displayMessage(message, input) {
    if (input) {
        outputBox.innerHTML += `<p class="input">${message}</p>`;
    } else {
        outputBox.innerHTML += `<p class="output">${message}</p>`;
    }
}


function meetsStateRequirements(option) {
    if (option.requiredState == null || option.requiredState(state)) {
        if (option.requiredSecondState == null || option.requiredSecondState(state)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}


function checkDead(nextSceneId, option) {
    if (nextSceneId === -2) { //WIN
        var timeElapsed = stopTimer();
        playSound(audio, "./sound/uplifting_track.mp3", "0.2");
        displayMessage(`<br><br><br><b>YOU ESCAPED</b><br><br>Time: ${timeElapsed}<br><br>You died ${localStorage.failCount} time(s) before escaping successfully!<br>`);
        while (optionButtons.firstChild) {
            optionButtons.removeChild(optionButtons.firstChild);
        }
        const playAgainButton = document.createElement("button");
        playAgainButton.innerText = "PLAY AGAIN";
        playAgainButton.classList.add("optionButton");
        playAgainButton.addEventListener("click", () => startGame());
        optionButtons.appendChild(playAgainButton);
        const mainMenuButton = document.createElement("button");
        mainMenuButton.innerText = "MAIN MENU";
        mainMenuButton.classList.add("optionButton");
        mainMenuButton.addEventListener("click", () => window.location.href="index.html");
        optionButtons.appendChild(mainMenuButton);
        // Reset Death Counter on Win
        if (localStorage.failCount) {
            localStorage.failCount = 0;
        }

    } else if (nextSceneId === -1) { //LOSS
        var timeElapsed = stopTimer();
        // Count number of deaths until win
        if (localStorage.failCount) {
            localStorage.failCount = Number(localStorage.failCount) + 1;
        } else {
            localStorage.failCount = 1;
        }
        playSound(audio, "./sound/failure.mp3", "0.2");
        displayMessage(`<br><br><br><b>GAME OVER</b><br><br>Time: ${timeElapsed}<br><br>${localStorage.failCount} death(s)<br>`);
        while (optionButtons.firstChild) {
            optionButtons.removeChild(optionButtons.firstChild);
        }
        const retryButton = document.createElement("button");
        retryButton.innerText = "RETRY";
        retryButton.classList.add("retryButton");
        retryButton.addEventListener("click", () => startGame());
        outputBox.appendChild(retryButton);

    } else {
        changeScene(nextSceneId, option);
    }
}


function selectOption(option) {
    displayMessage(`> ${option.text}`, input=true);

    if (meetsStateRequirements(option)) {
        playSound(soundEffect, option.audio, option.audioVolume);
        displayImage(option.image);
        displayMessage(option.chosenText);
    } else {
        playSound(soundEffect, option.missingStateAudio, option.missingStateAudioVolume);
        displayImage(option.missingStateImage);
        displayMessage(option.missingStateText);
        if (option.missingStateScene) {
            const nextSceneId = option.missingStateScene;
            checkDead(nextSceneId, option);
            return;
        }
    }

    const nextSceneId = option.nextScene;
    state = Object.assign(state, option.setState);
    checkDead(nextSceneId, option);
}



// =========
// GAME JSON
// =========
const sceneMap = [
    {
        id: 0, // Forest (starting location)
        text: `To the west, you can see nothing but trees.<br><br>
        To the east, you can hear a distant sound of a car going past.`,
        image: './images/forest_path.png',
        audio: './sound/outside_ambience.mp3',
        audioVolume: 0.05,
        options: [
            {
                text: 'Head West',
                chosenText: `You begin to walk east following a trail of trampled plants 
                that cuts what otherwise appears to be an undisturbed area of forest.`,
                nextScene: 1,
            },
            {
                text: 'Head East',
                chosenText: `As you walk left you can see that there is a clearing in the forest ahead.<br>
                At the edge of the forst there is a fence which looks to be too tall to climb with barbed wire on top.<br>
                You could go back the way you came, or maybe try and climb over the fence?`,
                image: './images/forest_clearing.png',
                nextScene: 3,
            },
        ]
    },
    {
        id: 1, // Deeper Forest
        text: `A tall, dark and abandoned house begins to come into your vision in between the trees as you continue west...<br><br>
        A path leads off to the side just before it.`,
        image: './images/deep_forest.png',
        options: [
            {
                text: 'Approach House',
                chosenText: `As you begin walking towards the house you hear a rustling in the trees behind you.<br>
                You quickly turn around to see nothing but trees.`,
                image: './images/house.png',
                audio: './sound/branch_snapping.mp3',
                audioVolume: 1,
                nextScene: 2,
            },
            {
                text: 'Take path',
                chosenText: `You walk for almost 20 minutes following the snaking path before reaching a clearing.<br><br>
                You realise you are back where you started.`,
                image: './images/forest_path.png',
                nextScene: 0,
            },
            {
                text: 'Return the way you came',
                chosenText: 'You return the way you came.',
                nextScene: 0,
                hideDestinationText: true,
            },
        ]
    },
    {
        id: 2, // Head towards house
        text: ``,
        options: [
            {
                text: 'Continue to the house',
                chosenText: `You begin walking back towards the house and stop at the front door.<br>
                You attempt to open the door but it doesn't move at all.<br>
                You must find another way around...`,
                image: './images/front_house.png',
                nextScene: 11,
            },
            {
                text: 'Look for the noise',
                chosenText: `As you walk forward away from the house you can see that there is a clearing in the forest ahead.<br>
                You reach the clearing and stop. Slowly, you turn around a full 360 degrees but see nothing.<br>
                You feel a sharp pain in your back before falling to the ground.<br>
                As you fade out of consciousness, you notice something stood over you before you black out!`,
                image: './images/dark_figure.png',
                audio: './sound/punch.mp3',
                audioVolume: 0.5,
                nextScene: 4,
            },
        ]
    },
    {
        id: 3, // Clearing in forest
        text: ``,
        options: [
            {
                text: 'Climb Fence',
                chosenText: `You climb up and almost make it to safety when you slip getting caught in the barbed wire!`,
                nextScene: -1,
                image: './images/barbed_wire.png',
                audio: './sound/climb_fence.mp3',
                audioVolume: 0.3,
                requiredState: (currentState) => currentState.barbedWireCausesDeath,
                missingStateText: `You attempt to climb up the fence but it's too tall and so you turn around heading back the way you came.`,
                missingStateScene: 3,
                missingStateAudio: './sound/climb_fence.mp3',
                missingStateAudioVolume: 0.3,
            },
            {
                text: 'Return the way you came',
                chosenText: 'You take the safe option and return the way you came, heading in to the forest.',
                nextScene: 0,
            },
        ]
    },
    {
        id: 4, // Upstairs room
        text: `You open your eyes to see that you are lying on the floor looking up into a claustrophobic, dark room. <br>
        You notice a small barred window to the right of the room and a dark, oak wooden door in front...<br><br>
        To the left you can see a small bed without any sheets and behind you is a cabinet.`,
        image: './images/upstairs_room.png',
        audio: './sound/house_ambience.mp3',
        audioVolume: 0.2,
        options: [
            {
                text: 'Look out window',
                chosenText: `You go over to the barred window.<br>
                Looking out you see that is pitch black and that you are upstairs.<br><br>
                You look back at the rest of the room.`,
                image: './images/window.png',
                nextScene: 4,
            },
            {
                text: 'Approach bed',
                chosenText: `You go over to the bed and think how that would be a good hiding place.`,
                image: './images/bed.png',
                nextScene: 5,
            },
            {
                text: 'Go to cabinet',
                chosenText: `You turn around to face the cabinet.`,
                image: './images/cabinet.png',
                nextScene: 6,
            },
            {
                text: 'Go to door',
                chosenText: `You walk across to the wooden door and turn the handle.<br>
                The door creaks open to reveal a small corridor with stairs leading down in front of you.<br>
                The first room is behind you, a door to the left and another door to the right of you.`,
                image: './images/upstairs_hallway.png',
                audio: './sound/wooden_door_creak.mp3',
                audioVolume: 0.2,
                nextScene: 7,
                requiredState: (currentState) => currentState.torch,
                missingStateText: `It is too dark to see outside the door. You realise you need to find a source of light...`,
            },
        ]
    },
    {
        id: 5, // Hide under bed in upstairs room
        text: ``,
        options: [
            {
                text: 'Hide',
                chosenText: `You slide under the bed quickly.<br><br>
                You are followed into the room by a dark figure but were just quick enough to not be caught.<br><br>
                You slide out from the bed cautiously and look back at the rest of the room.`,
                image: './images/under_bed.png',
                audio: './sound/hide_breathing.mp3',
                audioVolume: 1,
                requiredState: (currentState) => currentState.followed,
                missingStateText: `You choose not to hide under the bed unless necessary, as there are spiders under there.`,
                setState: { followed: false },
                nextScene: 4,
                hideDestinationText: true,
            },
            {
                text: 'Go back',
                chosenText: 'You look back at the rest of the room...',
                nextScene: 4,
                hideDestinationText: true,
            },
        ]
    },
    {
        id: 6, // Search cabinet in upstairs room
        text: ``,
        options: [
            {
                text: 'Search cabinet',
                chosenText: `You find a small torch in the bottom drawer and pick it up.<br>
                You close the drawer and look back at the rest of the room.`,
                nextScene: 4,
                setState: { torch: true },
                audio: './sound/torch.mp3',
                audioVolume: 0.3,
                requiredState: (currentState) => !currentState.torch,
                missingStateText: `You searched the cabinet again but found nothing of interest.`,
                missingStateScene: 4,
                missingStateAudio: './sound/open_drawer.mp3',
                missingStateAudioVolume: 0.3,
                hideDestinationText: true,
            },
            {
                text: 'Go back',
                chosenText: 'You look back at the rest of the room...',
                nextScene: 4,
                hideDestinationText: true,
            },
        ]
    },
    {
        id: 7, // Upstairs Hallway
        text: ``,
        options: [
            {
                text: 'Open door on left',
                chosenText: `You walk across to the door and turn the handle.<br>
                Inside you see what looks like an old nursery.
                However, it is full of cobwebs and spiders as if it hasn't been used in ages!`,
                image: './images/nursery.png',
                audio: './sound/creaky_stairs.mp3',
                audioVolume: 0.8,
                nextScene: 8,
            },
            {
                text: 'Open door on right',
                chosenText: `You walk across to the door and turn the handle.<br>
                You can see a bed, a curtain and a closet.`,
                nextScene: 10,
                image: './images/upstairs_bedroom.png',
                audio: './sound/wooden_door_creak.mp3',
                audioVolume: 0.2,
                requiredState: (currentState) => currentState.upstairsBedroomKey,
                missingStateText: `You walk across to the door and turn the handle.<br>
                Nothing happens as the door is locked.`,
                missingStateScene: 7,
                missingStateImage: './images/upstairs_hallway.png',
                missingStateAudio: './sound/locked_door.mp3',
                missingStateAudioVolume: 0.5,
            },
            {
                text: 'Go to staircase',
                image: './images/look_down_staircase.png',
                chosenText: `You go over to the staircase leading down. It is full of holes to watch out for.`,
                nextScene: 9,
            },
            {
                text: 'Enter first room',
                chosenText: `You return to the room you woke up in...`,
                nextScene: 4,
            },
        ]
    },
    {
        id: 8, // Nursery
        text: `You duck under a cobweb and walk into the room.<br>
        You see a small teddy lying in the middle of the floor facing away from you.<br><br>
        As you do so, you hear a <b>creak on the stairs</b> below...`,
        setState: { followed: true },
        options: [
            {
                text: 'Search cot',
                chosenText: `You go over to a small, wooden cot and look inside.<br>
                Suddenly, you hear more creaks on the stairs and look back to see the teddy sat, staring directly at you.<br><br>
                Creeped out, you pick up the key quickly and race out of the room...`,
                audio: './sound/pickup_key.mp3',
                audioVolume: 0.7,
                image: './images/nursery.png',
                nextScene: 8,
                setState: { upstairsBedroomKey: true },
                requiredState: (currentState) => !currentState.upstairsBedroomKey,
                requiredSecondState: (currentState) => currentState.keyInNurseryCot,
                missingStateText: `You searched the cot but found nothing.`,
                missingStateScene: 8,
            },
            {
                text: 'Leave room',
                chosenText: `You go back into the upstairs hall...`,
                image: './images/upstairs_hallway.png',
                nextScene: 7,
            },
        ]
    },
    {
        id: 9, // Upstairs Staircase
        text: ``,
        options: [
            {
                text: 'Go down',
                chosenText: `You begin to walk down the stairs and then see the figure stood at the bottom staring at you!<br>
                It runs up the stairs and grabs you...`,
                image: './images/figure_staircase.png',
                audio: './sound/punch.mp3',
                audioVolume: 0.5,
                nextScene: -1,
                requiredState: (currentState) => currentState.followed,
                missingStateText: `You walk down the stairs dodging any loose or creaky steps.<br>
                You reach the bottom and look around...`,
                missingStateImage: './images/downstairs_hallway.png',
                missingStateScene: 12,
            },
            {
                text: 'Back to hallway',
                chosenText: `You go back into the upstairs hall...`,
                image: './images/upstairs_hallway.png',
                nextScene: 7,
            },
        ]
    },
    {
        id: 10, // Upstairs Bedroom
        text: ``,
        options: [
            {
                text: 'Check inside closet',
                chosenText: `A figure jumps out and attacks you before you can even scream for help.`,
                image: './images/figure_standing_over_you.jpg',
                audio: './sound/punch.mp3',
                audioVolume: 0.5,
                nextScene: -1,
                requiredState: (currentState) => currentState.figureInUpstairsBedroomCloset,
                missingStateText: `You checked inside the closet but found nothing.`,
                missingStateScene: 10,
                missingStateImage: './images/upstairs_bedroom.png',
            },
            {
                text: 'Check under bed',
                chosenText: `You searched under the bed and found a key!`,
                nextScene: 10,
                image: './images/upstairs_bedroom.png',
                audio: './sound/pickup_key.mp3',
                audioVolume: 0.7,
                requiredState: (currentState) => !currentState.downstairsStudyKey,
                requiredSecondState: (currentState) => currentState.keyUnderUpstairsBed,
                setState: { downstairsStudyKey: true },
                missingStateText: `You checked under the bed but found nothing.`,
                missingStateScene: 10,
                missingStateImage: './images/upstairs_bedroom.png',
            },
            {
                text: 'Check behind curtain',
                chosenText: `You checked behind the curtain and found a crowbar!`,
                nextScene: 10,
                image: './images/upstairs_bedroom.png',
                requiredState: (currentState) => !currentState.crowbar,
                requiredSecondState: (currentState) => currentState.crowbarBehindUpstairsCurtain,
                setState: { downstairsStudyKey: true },
                missingStateText: `You checked behind the curtain but found nothing.`,
                missingStateScene: 10,
                missingStateImage: './images/upstairs_bedroom.png',
            },
            {
                text: 'Leave room',
                chosenText: `You return to the upstairs hallway.`,
                image: './images/upstairs_hallway.png',
                nextScene: 7,
            },
        ]
    },
    {
        id: 11, // Directly outside house
        text: ``,
        options: [
            {
                text: 'Look around',
                chosenText: `As you walk around the side of the house and turn the corner you feel a
                sharp pain in your back before falling to the ground.<br>
                As you fade out of consciousness, you notice something stood over you before you black out!`,
                image: './images/dark_figure.png',
                audio: './sound/punch.mp3',
                audioVolume: 0.5,
                nextScene: 4,
            },
            {
                text: 'Go back',
                chosenText: 'You head back to the start',
                nextScene: 1,
                hideDestinationText: true,
            },
        ]
    },
    {
        id: 12, // Downstairs Hallway
        text: `You hear some strange noises coming from a room nearby and wonder why you were brought inside by whatever it was you saw.<br>
        Looking to the left you can see an open door that appears to lead to a living room.<br>
        To the right, is a closed door. In front, is what appears to be a front door.`,
        options: [
            {
                text: 'Approach front door',
                chosenText: `You walk across to the door and begin to take the planks off as quickly as possible.<br><br>
                You hear a scream from upstairs and the sound of something thundering across the hallway.<br>
                You immediately get anxious and begin to go faster pulling the planks out of the frame and throwing them down in haste.<br><br>
                You desperately turn the key in the door and throw it open, sprinting out as the figure runs down the stairs after you.<br>
                You keep running and running for what feels like an enternity and don't look back once until the sounds of the figure fade away and stop.<br><br>
                With a stitch and unable to run any further, you slow to a stop and fall to the floor panting and rest a moment trying to catch your breath.<br>
                After taking a few minutes to recover, you think about all that happened and what on earth just happened to you.<br><br>
                Whilst thinking, you notice two bright lights moving in perfect sync, cutting through the trees.<br>
                It takes you a while, but you realise those are car headlights and begin to shout and run towards them.<br>
                The car stops as they see you and the driver looks horrified as they step out and take a look at you.<br>
                You look down and realise your clothes are ripped and you are bleeding before simply passing out...`,
                image: './images/car_road.png',
                nextScene: -2,
                requiredState: (currentState) => currentState.crowbar,
                requiredSecondState: (currentState) => currentState.frontDoorKey,
                missingStateText: `You walk across to the door and turn the handle.<br>
                It's locked and has wooden boards blocking the way out.<br>
                You realise you'd need to remove them to be able to get out.`,
                missingStateImage: './images/barricaded_front_door.png',
                missingStateScene: 12,
                missingStateAudio: './sound/locked_door.mp3',
                missingStateAudioVolume: 0.5,
            },
            {
                text: 'Go into Living Room',
                chosenText: `You walk across into the living room and see a smashed up table along with peeling and mouldy ceilings and walls.`,
                image: './images/living_room.png',
                nextScene: 13,
            },
            {
                text: 'Open door on right',
                chosenText: `You walk across to the door and turn the handle.<br>
                You can see an abandoned kitchen with broken cupboards and a door on the other side.`,
                image: './images/kitchen.png',
                nextScene: 14,
                audio: './sound/wooden_door_creak.mp3',
                audioVolume: 0.2,
                
            },
            {
                text: 'Go up staircase',
                chosenText: `You creep back up the staircase slowly, navigating around the holes and creaky boards.`,
                image: './images/upstairs_hallway.png',
                nextScene: 7,
            },
        ]
    },
    {
        id: 13, // Living Room
        text: ``,
        options: [
            {
                text: 'Check behind curtain',
                chosenText: `You checked behind the curtain and found a crowbar!`,
                image: './images/living_room.png',
                nextScene: 13,
                requiredState: (currentState) => !currentState.crowbar,
                requiredSecondState: (currentState) => currentState.crowbarBehindLoungeCurtain,
                setState: { crowbar: true },
                missingStateText: `You checked behind the curtain but found nothing.`,
                missingStateScene: 13,
            },
            {
                text: 'Search table',
                chosenText: `You searched through the parts of the smashed up table and found a key!`,
                image: './images/living_room.png',
                nextScene: 13,
                requiredState: (currentState) => !currentState.upstairsBedroomKey,
                requiredSecondState: (currentState) => currentState.keyInLoungeTable,
                setState: { upstairsBedroomKey: true },
                missingStateText: `You searched through the parts of the smashed up table but found nothing.`,
                missingStateScene: 13,
            },
            {
                text: 'Go back',
                chosenText: 'You head back into the hallway.',
                image: './images/downstairs_hallway.png',
                nextScene: 12,
                hideDestinationText: true,
            },
        ]
    },
    {
        id: 14, // Kitchen
        text: ``,
        options: [
            {
                text: 'Check cupboards',
                chosenText: `You checked the cupboards and found a key!`,
                nextScene: 14,
                image: './images/kitchen.png',
                audio: './sound/pickup_key.mp3',
                audioVolume: 0.7,
                requiredState: (currentState) => !currentState.downstairsStudyKey,
                requiredSecondState: (currentState) => currentState.keyInKitchenCupboard,
                setState: { downstairsStudyKey: true },
                missingStateText: `You checked the cupboards but found nothing.`,
                missingStateScene: 14,
            },
            {
                text: 'Check counter top',
                chosenText: `You check the counter top and accidentally knock a plate onto the floor.<br>
                It smashes into many pieces and creates a very loud noise.<br><br>
                A figure sprints into the room at you and attacks you, knocking you to the ground.`,
                image: './images/figure_standing_over_you.jpg',
                audio: './sound/plate_smashing.mp3',
                audioVolume: 0.7,
                nextScene: -1,
            },
            {
                text: 'Go into dining room',
                chosenText: `You head through the kitchen into the dining room.<br>
                There is a lot of debris on the floor and a door to the right.`,
                image: './images/dining_room.png',
                nextScene: 15,
            },
            {
                text: 'Go back',
                chosenText: 'You head back into the hallway.',
                nextScene: 12,
                image: './images/downstairs_hallway.png',
                hideDestinationText: true,
            },
        ]
    },
    {
        id: 15, // Dining Room
        text: ``,
        options: [
            {
                text: 'Search the debris',
                chosenText: `You searched the room and found a crowbar!`,
                image: './images/dining_room.png',
                nextScene: 15,
                requiredState: (currentState) => !currentState.crowbar,
                requiredSecondState: (currentState) => currentState.crowbarInDiningRoomDebris,
                setState: { crowbar: true },
                missingStateText: `You searched the room but found nothing.`,
                missingStateScene: 15,
            },
            {
                text: 'Open door on right',
                chosenText: `You head through the door into a study.`,
                nextScene: 16,
                audio: './sound/wooden_door_creak.mp3',
                audioVolume: 0.2,
                image: './images/study.png',
                requiredState: (currentState) => currentState.downstairsStudyKey,
                missingStateText: `You walk across to the door and turn the handle.<br>
                Nothing happens as the door is locked.`,
                missingStateScene: 15,
                missingStateImage: './images/dining_room.png',
                missingStateAudio: './sound/locked_door.mp3',
                missingStateAudioVolume: 0.5,
            },
            {
                text: 'Go back',
                chosenText: 'You head back into the kitchen.',
                image: './images/kitchen.png',
                nextScene: 14,
            },
        ]
    },
    {
        id: 16, // Study
        text: ``,
        options: [
            {
                text: 'Search the desk',
                chosenText: `You searched the desk and found a key!<br>
                It's a bigger key that doesn't look like the rest.`,
                image: './images/study.png',
                audio: './sound/pickup_key.mp3',
                audioVolume: 0.7,
                nextScene: 16,
                requiredState: (currentState) => !currentState.frontDoorKey,
                requiredSecondState: (currentState) => currentState.keyInStudyDesk,
                setState: { frontDoorKey: true },
                missingStateText: `You searched the desk but found nothing.`,
                missingStateScene: 16,
            },
            {
                text: 'Search the cupboards',
                chosenText: `You searched the cupboards and found a key!<br>
                It's a bigger key that doesn't look like the rest.`,
                image: './images/study.png',
                audio: './sound/pickup_key.mp3',
                audioVolume: 0.7,
                nextScene: 16,
                requiredState: (currentState) => !currentState.frontDoorKey,
                requiredSecondState: (currentState) => currentState.keyInStudyCupboard,
                setState: { frontDoorKey: true },
                missingStateText: `You searched the cupboards but found nothing.`,
                missingStateScene: 16,
            },
            {
                text: 'Go back',
                chosenText: 'You head back into the dining room.',
                image: './images/dining_room.png',
                nextScene: 15,
            },
        ]
    },
]

startGame()
