let characters = [];
let activeIndex = 0;

document.getElementById('add-character').addEventListener('click', showAddCharacterForm);
document.getElementById('end-turn').addEventListener('click', endTurn);

function showAddCharacterForm() {
    const panel = document.getElementById('character-panel');
    const form = document.createElement('div');
    form.className = 'character-form';
    form.innerHTML = `
        <h3>Add Character</h3>
        <input type="text" id="char-name" placeholder="Character Name" required>
        <input type="number" id="char-initiative" placeholder="Initiative" required>
        <select id="char-color">
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="yellow">Yellow</option>
            <option value="purple">Purple</option>
            <option value="orange">Orange</option>
        </select>
        <input type="number" id="char-hp" placeholder="Current HP" required>
        <input type="number" id="char-max-hp" placeholder="Max HP" required>
        <input type="number" id="char-mana" placeholder="Current Mana">
        <input type="number" id="char-max-mana" placeholder="Max Mana">
        <button id="save-char">Save Character</button>
    `;
    panel.appendChild(form);
    document.getElementById('save-char').addEventListener('click', () => {
        const name = document.getElementById('char-name').value;
        const initiative = parseInt(document.getElementById('char-initiative').value);
        const color = document.getElementById('char-color').value;
        const hp = parseInt(document.getElementById('char-hp').value);
        const maxHp = parseInt(document.getElementById('char-max-hp').value);
        const mana = parseInt(document.getElementById('char-mana').value) || 0;
        const maxMana = parseInt(document.getElementById('char-max-mana').value) || 0;
        if (name && !isNaN(initiative) && !isNaN(hp) && !isNaN(maxHp)) {
            characters.push({
                name,
                initiative,
                color,
                hp,
                maxHp,
                mana,
                maxMana,
                effects: []
            });
            sortCharacters();
            renderInitiativeBar();
            renderCharacterPanel();
            form.remove();
        }
    });
}

function sortCharacters() {
    characters.sort((a, b) => b.initiative - a.initiative);
    activeIndex = 0; // reset to first
}

function renderInitiativeBar() {
    const bar = document.getElementById('initiative-bar');
    bar.innerHTML = '<h2>Initiative Bar</h2>';
    characters.forEach((char, index) => {
        const div = document.createElement('div');
        div.className = 'character-initiative' + (index === activeIndex ? ' active' : '');
        div.innerHTML = `
            <div class="color-indicator" style="background-color: ${char.color};"></div>
            ${char.name} (${char.initiative})
        `;
        bar.appendChild(div);
    });
}

function renderCharacterPanel() {
    const panel = document.getElementById('character-panel');
    panel.innerHTML = '<h2>Character Control Panel</h2><button id="add-character">Add Character</button>';
    document.getElementById('add-character').addEventListener('click', showAddCharacterForm);
    characters.forEach((char, index) => {
        const div = document.createElement('div');
        div.className = 'character-form';
        div.innerHTML = `
            <h3>${char.name} <button class="delete-btn" onclick="deleteCharacter(${index})">Delete</button></h3>
            <label>Initiative: <input type="number" value="${char.initiative}" onchange="updateInitiative(${index}, this.value)"></label>
            <label>Color: <select onchange="updateColor(${index}, this.value)">
                <option value="red" ${char.color === 'red' ? 'selected' : ''}>Red</option>
                <option value="blue" ${char.color === 'blue' ? 'selected' : ''}>Blue</option>
                <option value="green" ${char.color === 'green' ? 'selected' : ''}>Green</option>
                <option value="yellow" ${char.color === 'yellow' ? 'selected' : ''}>Yellow</option>
                <option value="purple" ${char.color === 'purple' ? 'selected' : ''}>Purple</option>
                <option value="orange" ${char.color === 'orange' ? 'selected' : ''}>Orange</option>
            </select></label>
            <label>HP: <input type="number" value="${char.hp}" onchange="updateHp(${index}, this.value)"> / <input type="number" value="${char.maxHp}" onchange="updateMaxHp(${index}, this.value)"></label>
            <label>Mana: <input type="number" value="${char.mana}" onchange="updateMana(${index}, this.value)"> / <input type="number" value="${char.maxMana}" onchange="updateMaxMana(${index}, this.value)"></label>
            <button onclick="addEffect(${index})">Add Effect</button>
            <div id="effects-${index}"></div>
        `;
        panel.appendChild(div);
        renderEffects(index);
    });
}

function renderEffects(charIndex) {
    const effectsDiv = document.getElementById(`effects-${charIndex}`);
    effectsDiv.innerHTML = '';
    characters[charIndex].effects.forEach((effect, effectIndex) => {
        const div = document.createElement('div');
        div.className = 'effect';
        div.innerHTML = `
            <input type="number" value="${effect.duration}" onchange="updateEffectDuration(${charIndex}, ${effectIndex}, this.value)">
            <input type="text" value="${effect.description}" onchange="updateEffectDescription(${charIndex}, ${effectIndex}, this.value)">
            <button class="delete-btn" onclick="deleteEffect(${charIndex}, ${effectIndex})">X</button>
        `;
        effectsDiv.appendChild(div);
    });
}

function updateInitiative(index, value) {
    characters[index].initiative = parseInt(value);
    sortCharacters();
    renderInitiativeBar();
    renderCharacterPanel();
}

function updateColor(index, value) {
    characters[index].color = value;
    renderInitiativeBar();
}

function updateHp(index, value) {
    characters[index].hp = parseInt(value);
}

function updateMaxHp(index, value) {
    characters[index].maxHp = parseInt(value);
}

function updateMana(index, value) {
    characters[index].mana = parseInt(value);
}

function updateMaxMana(index, value) {
    characters[index].maxMana = parseInt(value);
}

function addEffect(charIndex) {
    characters[charIndex].effects.push({ duration: 1, description: 'New Effect' });
    renderEffects(charIndex);
}

function updateEffectDuration(charIndex, effectIndex, value) {
    characters[charIndex].effects[effectIndex].duration = parseInt(value);
}

function updateEffectDescription(charIndex, effectIndex, value) {
    characters[charIndex].effects[effectIndex].description = value;
}

function deleteEffect(charIndex, effectIndex) {
    characters[charIndex].effects.splice(effectIndex, 1);
    renderEffects(charIndex);
}

function deleteCharacter(index) {
    characters.splice(index, 1);
    if (activeIndex >= characters.length) activeIndex = 0;
    renderInitiativeBar();
    renderCharacterPanel();
}

function endTurn() {
    if (characters.length === 0) return;
    // Reduce effects of current character
    characters[activeIndex].effects.forEach(effect => {
        effect.duration--;
    });
    characters[activeIndex].effects = characters[activeIndex].effects.filter(effect => effect.duration > 0);
    renderEffects(activeIndex);
    // Move to next
    activeIndex = (activeIndex + 1) % characters.length;
    renderInitiativeBar();
}