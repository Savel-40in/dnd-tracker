let characters = [];
let activeIndex = 0;
let activeCharacterId = null;
let nextCharacterId = 1;

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
            <option value="pink">Pink</option>
            <option value="cyan">Cyan</option>
            <option value="brown">Brown</option>
            <option value="gray">Gray</option>
            <option value="black">Black</option>
            <option value="white">White</option>
        </select>
        <input type="number" step="0.1" id="char-hp" placeholder="Current HP" required>
        <input type="number" step="0.1" id="char-max-hp" placeholder="Max HP" required>
        <input type="number" step="0.1" id="char-mana" placeholder="Current Mana">
        <input type="number" step="0.1" id="char-max-mana" placeholder="Max Mana">
        <button id="save-char">Save Character</button>
    `;
    panel.appendChild(form);
    document.getElementById('save-char').addEventListener('click', () => {
        const name = document.getElementById('char-name').value;
        const initiative = parseInt(document.getElementById('char-initiative').value);
        const color = document.getElementById('char-color').value;
        const hp = parseFloat(document.getElementById('char-hp').value);
        const maxHp = parseFloat(document.getElementById('char-max-hp').value);
        const mana = parseFloat(document.getElementById('char-mana').value) || 0;
        const maxMana = parseFloat(document.getElementById('char-max-mana').value) || 0;
        if (name && !isNaN(initiative) && !isNaN(hp) && !isNaN(maxHp)) {
            const id = nextCharacterId++;
            characters.push({
                id,
                name,
                initiative,
                color,
                hp,
                maxHp,
                mana,
                maxMana,
                effects: []
            });
            if (activeCharacterId === null) activeCharacterId = id;
            sortCharacters();
            renderInitiativeBar();
            renderCharacterPanel();
            form.remove();
        }
    });
}

function sortCharacters() {
    characters.sort((a, b) => b.initiative - a.initiative);
    const activeIndexAfterSort = characters.findIndex(c => c.id === activeCharacterId);
    activeIndex = activeIndexAfterSort >= 0 ? activeIndexAfterSort : 0;
    activeCharacterId = characters[activeIndex]?.id ?? null;
}

function renderInitiativeBar() {
    const bar = document.getElementById('initiative-bar');
    bar.innerHTML = '<h2>Initiative Bar</h2>';
    characters.forEach((char, index) => {
        const div = document.createElement('div');
        div.className = 'character-initiative' + (char.id === activeCharacterId ? ' active' : '');
        div.style.cursor = 'pointer';
        div.addEventListener('click', () => {
            activeCharacterId = char.id;
            activeIndex = characters.findIndex(c => c.id === char.id);
            renderInitiativeBar();
            scrollToCharacter(char.id);
        });
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
        div.id = `character-${char.id}`;
        div.innerHTML = `
            <div class="character-header">
                <div class="color-indicator small" style="background-color: ${char.color};"></div>
                <h3>${char.name}</h3>
                <div class="header-buttons">
                    <button class="copy-btn" onclick="copyCharacter(${index})">Copy</button>
                    <button class="delete-btn" onclick="deleteCharacter(${index})">Delete</button>
                </div>
            </div>
            <div class="character-grid">
                <div class="grid-item">
                    <label>Initiative: <input type="number" value="${char.initiative}" onchange="updateInitiative(${index}, this.value)"></label>
                </div>
                <div class="grid-item">
                    <label>Color: <select onchange="updateColor(${index}, this.value)">
                        <option value="red" ${char.color === 'red' ? 'selected' : ''}>Red</option>
                        <option value="blue" ${char.color === 'blue' ? 'selected' : ''}>Blue</option>
                        <option value="green" ${char.color === 'green' ? 'selected' : ''}>Green</option>
                        <option value="yellow" ${char.color === 'yellow' ? 'selected' : ''}>Yellow</option>
                        <option value="purple" ${char.color === 'purple' ? 'selected' : ''}>Purple</option>
                        <option value="orange" ${char.color === 'orange' ? 'selected' : ''}>Orange</option>
                        <option value="pink" ${char.color === 'pink' ? 'selected' : ''}>Pink</option>
                        <option value="cyan" ${char.color === 'cyan' ? 'selected' : ''}>Cyan</option>
                        <option value="brown" ${char.color === 'brown' ? 'selected' : ''}>Brown</option>
                        <option value="gray" ${char.color === 'gray' ? 'selected' : ''}>Gray</option>
                        <option value="black" ${char.color === 'black' ? 'selected' : ''}>Black</option>
                        <option value="white" ${char.color === 'white' ? 'selected' : ''}>White</option>
                    </select></label>
                </div>
                <div class="grid-item">
                    <label>HP: <input type="number" step="0.1" value="${char.hp}" onchange="updateHp(${index}, this.value)"> / <input type="number" step="0.1" value="${char.maxHp}" onchange="updateMaxHp(${index}, this.value)"></label>
                </div>
                <div class="grid-item">
                    <label>Mana: <input type="number" step="0.1" value="${char.mana}" onchange="updateMana(${index}, this.value)"> / <input type="number" step="0.1" value="${char.maxMana}" onchange="updateMaxMana(${index}, this.value)"></label>
                </div>
            </div>
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
    renderCharacterPanel();
}

function updateHp(index, value) {
    characters[index].hp = parseFloat(value);
}

function updateMaxHp(index, value) {
    characters[index].maxHp = parseFloat(value);
}

function updateMana(index, value) {
    characters[index].mana = parseFloat(value);
}

function updateMaxMana(index, value) {
    characters[index].maxMana = parseFloat(value);
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
    const removed = characters.splice(index, 1)[0];
    if (removed && removed.id === activeCharacterId) {
        activeCharacterId = characters[0]?.id ?? null;
    }
    activeIndex = characters.findIndex(c => c.id === activeCharacterId);
    if (activeIndex < 0) activeIndex = 0;
    renderInitiativeBar();
    renderCharacterPanel();
}

function copyCharacter(index) {
    const original = characters[index];
    const newId = nextCharacterId++;
    const newChar = {
        id: newId,
        name: original.name,
        initiative: original.initiative,
        color: original.color,
        hp: original.hp,
        maxHp: original.maxHp,
        mana: original.mana,
        maxMana: original.maxMana,
        effects: original.effects.map(e => ({ duration: e.duration, description: e.description }))
    };
    characters.push(newChar);
    sortCharacters();
    renderInitiativeBar();
    renderCharacterPanel();
}

function endTurn() {
    if (characters.length === 0) return;
    // Reduce effects of current character
    const current = characters[activeIndex];
    current.effects.forEach(effect => {
        effect.duration--;
    });
    current.effects = current.effects.filter(effect => effect.duration > 0);
    renderEffects(activeIndex);
    // Move to next
    activeIndex = (activeIndex + 1) % characters.length;
    activeCharacterId = characters[activeIndex]?.id ?? null;
    renderInitiativeBar();
}

function scrollToCharacter(id) {
    const element = document.getElementById(`character-${id}`);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('highlight');
    setTimeout(() => element.classList.remove('highlight'), 800);
}