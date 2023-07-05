const outputBox = document.getElementById("output");
const optionButtons = document.getElementById("optionButtons");

let state = {}
var previousSceneIndex = 0;

function startGame() {
    state = {};
    outputBox.innerHTML = "<h1>The Awakening</h1>";
    optionButtons.innerHTML = "";
    showInitialScene();
}

function showInitialScene() {
    const scene = sceneMap.find(scene => scene.id === 1);
    displayImage('./images/forest_path.png')
    displayMessage(scene.text);
    scene.options.forEach(option => {
        if (showOption(option)) {
            const button = document.createElement('button');
            button.innerText = option.text;
            button.classList.add('optionButton');
            button.addEventListener('click', () => selectOption(option));
            optionButtons.appendChild(button);
        }
    })
    window.scrollTo(0, document.body.scrollHeight);
}

function changeScene(sceneIndex, previousOption) {
    const scene = sceneMap.find(scene => scene.id === sceneIndex);
    if (scene == null) return;
    displayImage(scene.image)

    if (sceneIndex != previousSceneIndex) {
        if (previousOption.hideDestinationText == null) {
            displayMessage(scene.text);
        }
        previousSceneIndex = sceneIndex;

        if (scene.setState) {
            state = Object.assign(state, scene.setState);
        }

        while (optionButtons.firstChild) {
            optionButtons.removeChild(optionButtons.firstChild);
        }

        scene.options.forEach(option => {
            const button = document.createElement('button');
            button.innerText = option.text;
            button.classList.add('optionButton');
            button.addEventListener('click', () => selectOption(option));
            optionButtons.appendChild(button);
        })
    }
    window.scrollTo(0, document.body.scrollHeight);
}

function displayImage(imageURL) {
    if (imageURL) {
        let img = document.createElement('img');
        img.classList.add('output');
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

function showOption(option) {
    return option.requiredState == null || option.requiredState(state);
}

function checkDead(nextSceneId, option) {
    if (nextSceneId <= 0) {
        displayMessage("<br><br>GAME OVER");
        while (optionButtons.firstChild) {
            optionButtons.removeChild(optionButtons.firstChild);
        }
        const button = document.createElement('button');
        button.innerText = "RETRY";
        button.classList.add('retryButton');
        button.addEventListener('click', () => startGame());
        optionButtons.appendChild(button);
    } else {
        changeScene(nextSceneId, option);
    }
}

function selectOption(option) {
    displayMessage(`> ${option.text}`, input=true);

    if (option.requiredState) {
        if (option.requiredState(state)) {
            displayImage(option.image)
            displayMessage(option.chosenText);
        } else {
            displayImage(option.missingStateImage)
            displayMessage(option.missingStateText);
            state = Object.assign(state, option.setState);
            if (option.missingStateScene) {
                const nextSceneId = option.missingStateScene;
                checkDead(nextSceneId, option)
            }
            return;
        }
    } else if (option.chosenText) {
        displayImage(option.image)
        displayMessage(option.chosenText);
    }

    const nextSceneId = option.nextScene;
    state = Object.assign(state, option.setState);
    checkDead(nextSceneId, option)
}


const sceneMap = [
    {
        id: 1, // spawn
        text: `You are in a dark and creepy looking forest, the sun is setting as you see
        a tall, dark and abandoned house in front of you...<br><br>
        To the west you can hear a distant sound of a car going past.`,
        image: './images/forest_path.png',
        options: [
            {
                text: 'Approach House',
                image: './images/house.png',
                nextScene: 2,
            },
            {
                text: 'Head West',
                image: './images/forest_clearing.png',
                nextScene: 3,
            },
        ]
    },
    {
        id: 2, // outside_mystery_person
        text: `As you begin walking towards the house you hear a rustling in the trees behind you.<br>
        You quickly turn around to see nothing but trees.`,
        options: [
            {
                text: 'Continue to the house',
                chosenText: `You begin walking back towards the house and stop at the front door.<br>
                You attempt to open the door but it doesn't move at all.<br>
                You must find another way around...`,
                image: './images/front_house.png',
                nextScene: 2,
            },
            {
                text: 'Look for the noise',
                chosenText: `As you walk forward away from the house you can see that there is a clearing in the forest ahead.<br>
                You reach the clearing and stop. Slowly, you turn around a full 360 degrees but see nothing.<br>
                You feel a sharp pain in your back before falling to the ground.<br>
                As you fall you notice something coming towards you before you black out!`,
                image: './images/dark_figure.png',
                nextScene: 4,
            },
        ]
    },
    {
        id: 3, // clearing
        text: `As you walk left you can see that there is a clearing in the forest ahead.<br>
        At the edge of the forst there is a fence which looks to be too tall to climb with barbed wire on top.<br>
        You could go back the way you came, or maybe try and climb over the fence?`,
        options: [
            {
                text: 'Climb Fence',
                chosenText: 'You climb up and almost make it to safety when you slip getting caught in the barbed wire!',
                image: './images/barbed_wire.png',
                nextScene: -1,
            },
            {
                text: 'Return the way you came',
                chosenText: 'You take the safe option and return the way you came, heading in to the forest.',
                nextScene: 1,
                hideDestinationText: true,
            },
        ]
    },
    {
        id: 4, // inside_house_captured
        text: `You open your eyes to see that you are lying on the floor looking up into a claustrophobic, dark room. <br>
        You notice a small barred window to the right of the room and a dark, oak wooden door in front...<br><br>
        To the left you can see a small bed without any sheets and behind you is a cabinet.`,
        image: './images/bedroom.png',
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
                chosenText: `You walk across to the wooden door and turn the handle.`,
                image: './images/upstairs_hallway.png',
                nextScene: 7,
                requiredState: (currentState) => currentState.flashlight,
                missingStateText: `It is too dark to see outside the door. You realise you need to find a source of light...`,
            },
        ]
    },
    {
        id: 5, // hide under bed
        text: ``,
        options: [
            {
                text: 'Hide',
                chosenText: `You slide under the bed quickly.<br><br>
                You are followed into the room by a dark figure but were just quick enough to not be caught.<br><br>
                You slide out from the bed cautiously and look back at the rest of the room.`,
                image: './images/underbed.png',
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
        id: 6, // search cabinet
        text: ``,
        options: [
            {
                text: 'Search cabinet',
                chosenText: `You searched the cabinet again but found nothing of interest.`,
                nextScene: 4,
                requiredState: (currentState) => currentState.flashlight,
                missingStateText: `You find a small flashlight in the bottom drawer and pick it up.<br>
                You close the drawer and look back at the rest of the room.`,
                missingStateScene: 4,
                setState: { flashlight: true },
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
        id: 7, // upstairs_hallway
        text: `The door creaks open to reveal a small corridor with stairs leading down on the left.<br>
        The first room is behind you, a metal door in front of you and a wooden door to the right of you.`,
        options: [
            {
                text: 'Try metal door',
                chosenText: `You walk across to the metal door and turn the handle.<br>
                Nothing happens as the door is locked.`,
                image: './images/upstairs_hallway.png',
                nextScene: 7,
            },
            {
                text: 'Try wooden door',
                chosenText: `You walk across to the wooden door and turn the handle.<br>
                Inside you see what looks like an old nursery.
                However, it is full of cobwebs and spiders as if it hasn't been used in ages!`,
                image: './images/nursery.png',
                nextScene: 8,
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
        id: 8, // nursery
        text: `You duck under a cobweb and walk into the room...<br><br>
        You go over to a small, wooden cot and look inside.<br>
        You see a small teddy lying in the middle facing away from you.<br><br>
        Suddenly, you hear a creak on the stairs below...<br>
        You turn around to face the cot and see the teddy sat, staring at you`,
        setState: { followed: true },
        options: [
            {
                text: 'Leave room',
                chosenText: `You go back into the upstairs hall...`,
                image: './images/upstairs_hallway.png',
                nextScene: 7,
            },
            {
                text: 'Pick up teddy',
                chosenText: `You pick up the battered teddy.<br>
                You hear another creak on the stairs and race out of the room...`,
                image: './images/upstairs_hallway.png',
                setState: { teddy: true },
                nextScene: 7,
            },
        ]
    },
    {
        id: 9, // upstairs_staircase
        text: ``,
        options: [
            {
                text: 'Go down',
                chosenText: `You begin to walk down the stairs and then see the figure stood at the bottom staring at you!<br>
                It runs up the stairs and grabs you...`,
                image: './images/figure_staircase.png',
                nextScene: -1,
                requiredState: (currentState) => currentState.followed,
                missingStateText: `You walk down the stairs dodging any loose or creaky steps.<br>
                You reach the bottom and look around...`,
                missingStateImage: './images/downstairs_hallway.png',
                missingStateScene: -1,
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
        id: 10, // downstairs_hallway
        text: ` >>>>> To Be Continued <<<<< `,
        options: [
            {

            }
        ]
    }
]

startGame()
