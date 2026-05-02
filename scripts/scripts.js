let characters = [];
let activeIndex = 0;
let activeCharacterId = null;
let openCharacterId = null;
let nextCharacterId = 1;
let battleStarted = false;

// Initial render
renderCharacterPanel();
renderInitiativeBar();

function showAddCharacterForm() {
    const panel = document.getElementById('character-panel');
    const form = document.createElement('div');
    form.className = 'character-form';
    form.innerHTML = `
        <h3>Add Character</h3>
        <input type="text" id="char-name" placeholder="Character Name" required>
        <input type="number" id="char-initiative" placeholder="Initiative" required>
        <select id="char-color">
            <option value="black">Black</option>
            <option value="white">White</option>
            <option value="grey">Grey</option>
            <option value="silver">Silver</option>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
            <option value="yellow">Yellow</option>
            <option value="aqua">Aqua</option>
            <option value="fuchsia">Fuchsia</option>
            <option value="lime">Lime</option>
            <option value="maroon">Maroon</option>
            <option value="navy">Navy</option>
            <option value="olive">Olive</option>
            <option value="purple">Purple</option>
            <option value="teal">Teal</option>
        </select>
        <input type="number" step="0.1" id="char-max-hp" placeholder="HP" required>
        <input type="number" step="0.1" id="char-max-mana" placeholder="Mana">
        <button id="save-char">Save Character</button>
    `;
    const firstChar = panel.querySelector('.character-form');
    if (firstChar) {
        panel.insertBefore(form, firstChar);
    } else {
        panel.appendChild(form);
    }
    document.getElementById('save-char').addEventListener('click', () => {
        const name = document.getElementById('char-name').value;
        const initiative = parseInt(document.getElementById('char-initiative').value);
        const color = document.getElementById('char-color').value;
        const maxHp = parseFloat(document.getElementById('char-max-hp').value);
        const maxMana = parseFloat(document.getElementById('char-max-mana').value) || 0;
        if (name && !isNaN(initiative) && !isNaN(maxHp)) {
            const id = nextCharacterId++;
            characters.push({
                id,
                name,
                initiative,
                color,
                hp: maxHp,
                maxHp,
                mana: maxMana,
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
    if (battleStarted) {
        const activeIndexAfterSort = characters.findIndex(c => c.id === activeCharacterId);
        activeIndex = activeIndexAfterSort >= 0 ? activeIndexAfterSort : 0;
        activeCharacterId = characters[activeIndex]?.id ?? null;
        if (openCharacterId === activeCharacterId) {
            openCharacterId = null;
        }
    } else {
        activeIndex = 0;
        activeCharacterId = null;
    }
}

function renderInitiativeBar() {
    const bar = document.getElementById('initiative-bar');
    bar.innerHTML = '<h2>Initiative Bar</h2>';
    characters.forEach((char, index) => {
        const div = document.createElement('div');
        div.className = 'character-initiative' + (char.id === activeCharacterId ? ' active' : '');
        div.style.cursor = 'pointer';
        div.addEventListener('click', () => {
            // Allow the active character to remain open; clicking others opens them as the secondary panel.
            if (!battleStarted || char.id !== activeCharacterId) {
                openCharacterId = char.id;
            }
            renderCharacterPanel();
            scrollToCharacter(char.id);
        });
        div.innerHTML = `
            <div class="color-indicator" style="background-color: ${char.color};"></div>
            ${char.name} (${char.initiative})
        `;
        bar.appendChild(div);
    });
    // Add the turn button at the end
    const turnButton = document.createElement('button');
    turnButton.id = 'end-turn';
    turnButton.textContent = battleStarted ? 'End Turn' : 'Start Battle';
    turnButton.addEventListener('click', handleTurnButton);
    bar.appendChild(turnButton);
}

function renderCharacterPanel() {
    const panel = document.getElementById('character-panel');
    panel.innerHTML = '<h2>Character Control Panel</h2><button id="add-character">Add Character</button>';
    document.getElementById('add-character').addEventListener('click', showAddCharacterForm);
    characters.forEach((char, index) => {
        const isOpen = (battleStarted && char.id === activeCharacterId) || (char.id === openCharacterId);

        const div = document.createElement('div');
        div.className = 'character-form';
        div.id = `character-${char.id}`;
        div.innerHTML = `
            <div class="character-header">
                <div class="color-indicator small" style="background-color: ${char.color};"></div>
                <h3 onclick="toggleCharacterTab(${char.id})">${char.name}</h3>
                <div class="header-buttons">
                    <button class="copy-btn" onclick="copyCharacter(${index})">Copy</button>
                    <button class="delete-btn" onclick="deleteCharacter(${index})">Delete</button>
                </div>
            </div>
            <div class="character-details ${isOpen ? 'open' : ''}">
                <div class="character-grid">
                    <div class="grid-item">
                        <label>Initiative: <input type="number" value="${char.initiative}" data-field="initiative" data-index="${index}" onchange="updateInitiative(${index}, this.value)" ondblclick="selectAllText(this)" onkeydown="handleEnter(event, this)" onblur="commitNumericField(this)"></label>
                    </div>
                    <div class="grid-item">
                        <label>Color: <select onchange="updateColor(${index}, this.value)">
                            <option value="black" ${char.color === 'black' ? 'selected' : ''}>Black</option>
                            <option value="white" ${char.color === 'white' ? 'selected' : ''}>White</option>
                            <option value="grey" ${char.color === 'grey' || char.color === 'gray' ? 'selected' : ''}>Grey</option>
                            <option value="silver" ${char.color === 'silver' ? 'selected' : ''}>Silver</option>
                            <option value="red" ${char.color === 'red' ? 'selected' : ''}>Red</option>
                            <option value="green" ${char.color === 'green' ? 'selected' : ''}>Green</option>
                            <option value="blue" ${char.color === 'blue' ? 'selected' : ''}>Blue</option>
                            <option value="yellow" ${char.color === 'yellow' ? 'selected' : ''}>Yellow</option>
                            <option value="aqua" ${char.color === 'aqua' ? 'selected' : ''}>Aqua</option>
                            <option value="fuchsia" ${char.color === 'fuchsia' ? 'selected' : ''}>Fuchsia</option>
                            <option value="lime" ${char.color === 'lime' ? 'selected' : ''}>Lime</option>
                            <option value="maroon" ${char.color === 'maroon' ? 'selected' : ''}>Maroon</option>
                            <option value="navy" ${char.color === 'navy' ? 'selected' : ''}>Navy</option>
                            <option value="olive" ${char.color === 'olive' ? 'selected' : ''}>Olive</option>
                            <option value="purple" ${char.color === 'purple' ? 'selected' : ''}>Purple</option>
                            <option value="teal" ${char.color === 'teal' ? 'selected' : ''}>Teal</option>
                        </select></label>
                    </div>
                    <div class="grid-item">
                        <label>HP: <input type="number" step="0.1" value="${char.hp}" data-field="hp" data-index="${index}" onchange="updateHp(${index}, this.value)" ondblclick="selectAllText(this)" onkeydown="handleEnter(event, this)" onblur="commitNumericField(this)"> / <span>${char.maxHp}</span></label>
                        <div class="adjustment">
                            <button type="button" class="sign-btn" id="hp-plus-btn-${index}" onclick="selectSign('hp', ${index}, '+')" title="Increase">+</button>
                            <button type="button" class="sign-btn active" id="hp-minus-btn-${index}" onclick="selectSign('hp', ${index}, '-')" title="Decrease">-</button>
                            <input type="number" step="0.1" id="hp-adjust-value-${index}" placeholder="value of the change" oninput="validateAdjustButton('hp', ${index})" ondblclick="selectAllText(this)" onkeydown="handleEnter(event)">
                            <button id="hp-apply-btn-${index}" onclick="adjustHp(${index})" disabled>Apply</button>
                        </div>
                    </div>
                    <div class="grid-item">
                        <label>Mana: <input type="number" step="0.1" value="${char.mana}" data-field="mana" data-index="${index}" onchange="updateMana(${index}, this.value)" ondblclick="selectAllText(this)" onkeydown="handleEnter(event, this)" onblur="commitNumericField(this)"> / <span>${char.maxMana}</span></label>
                        <div class="adjustment">
                            <button type="button" class="sign-btn" id="mana-plus-btn-${index}" onclick="selectSign('mana', ${index}, '+')" title="Increase">+</button>
                            <button type="button" class="sign-btn active" id="mana-minus-btn-${index}" onclick="selectSign('mana', ${index}, '-')" title="Decrease">-</button>
                            <input type="number" step="0.1" id="mana-adjust-value-${index}" placeholder="value of the change" oninput="validateAdjustButton('mana', ${index})" ondblclick="selectAllText(this)" onkeydown="handleEnter(event)">
                            <button id="mana-apply-btn-${index}" onclick="adjustMana(${index})" disabled>Apply</button>
                        </div>
                    </div>
                </div>
                <button onclick="addEffect(${index})">Add Effect</button>
                <div id="effects-${index}"></div>
            </div>
        `;
        panel.appendChild(div);
        renderEffects(index);
    });
}

function toggleCharacterTab(id) {
    // During battle, the active character's panel must stay open.
    if (battleStarted && id === activeCharacterId) {
        return;
    }

    if (openCharacterId === id) {
        openCharacterId = null;
    } else {
        openCharacterId = id;
    }
    renderCharacterPanel();
}

function renderEffects(charIndex) {
    const effectsDiv = document.getElementById(`effects-${charIndex}`);
    effectsDiv.innerHTML = '';
    characters[charIndex].effects.forEach((effect, effectIndex) => {
        const durationPlaceholder = effect.infinite ? 'infinite' : 'duration';
        const div = document.createElement('div');
        div.className = 'effect';
        div.innerHTML = `
            <input type="number" value="${effect.duration}" data-field="effect-duration" data-char-index="${charIndex}" data-effect-index="${effectIndex}" placeholder="${durationPlaceholder}" onchange="updateEffectDuration(${charIndex}, ${effectIndex}, this.value)" ondblclick="selectAllText(this)" onkeydown="handleEnter(event, this)" onblur="commitNumericField(this)">
            <input type="text" value="${effect.description}" placeholder="effect description" onchange="updateEffectDescription(${charIndex}, ${effectIndex}, this.value)" ondblclick="selectAllText(this)" onkeydown="handleEnter(event)">
            <button type="button" class="infinite-btn ${effect.infinite ? 'active' : ''}" onclick="toggleInfinite(${charIndex}, ${effectIndex})" title="Infinite duration">\u221E</button>
            <button class="delete-btn" onclick="deleteEffect(${charIndex}, ${effectIndex})">X</button>
        `;
        effectsDiv.appendChild(div);
    });
}

function handleEnter(event, element) {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (element) {
            commitNumericField(element);
        }
        event.target.blur();
    }
}

function commitNumericField(element) {
    if (element.type !== 'number') return;
    const field = element.dataset.field;
    const index = Number(element.dataset.index);
    const value = parseFloat(element.value);
    if (field === 'initiative') {
        const clamped = Number.isNaN(value) ? 0 : Math.max(0, Math.trunc(value));
        updateInitiative(index, clamped);
        element.value = clamped;
        return;
    }
    if (field === 'hp' || field === 'mana') {
        const maxField = field === 'hp' ? 'maxHp' : 'maxMana';
        const max = characters[index][maxField];
        const clamped = Number.isNaN(value) ? 0 : Math.max(0, Math.min(value, max));
        if (field === 'hp') {
            updateHp(index, clamped);
        } else {
            updateMana(index, clamped);
        }
        element.value = clamped;
        return;
    }
    if (field === 'effect-duration') {
        const charIndex = Number(element.dataset.charIndex);
        const effectIndex = Number(element.dataset.effectIndex);
        const clamped = Number.isNaN(value) ? '' : Math.max(0, value);
        updateEffectDuration(charIndex, effectIndex, clamped);
        element.value = clamped;
    }
}

function selectAllText(element) {
    if (typeof element.select === 'function') {
        element.select();
    }
}

function updateInitiative(index, value) {
    const parsed = parseInt(value);
    if (!Number.isNaN(parsed)) {
        characters[index].initiative = Math.max(0, parsed);
        sortCharacters();
        // When a character's initiative (movement in order) changes, close any open panels.
        openCharacterId = null;
        renderInitiativeBar();
        renderCharacterPanel();
    }
}

function updateColor(index, value) {
    characters[index].color = value;
    renderInitiativeBar();
    renderCharacterPanel();
}

function updateHp(index, value) {
    const hp = parseFloat(value);
    const maxHp = characters[index].maxHp;
    if (!Number.isNaN(hp)) {
        characters[index].hp = Math.max(0, Math.min(hp, maxHp));
    }
}

function updateMana(index, value) {
    const mana = parseFloat(value);
    const maxMana = characters[index].maxMana;
    if (!Number.isNaN(mana)) {
        characters[index].mana = Math.max(0, Math.min(mana, maxMana));
    }
}

function selectSign(type, index, sign) {
    const plusBtn = document.getElementById(`${type}-plus-btn-${index}`);
    const minusBtn = document.getElementById(`${type}-minus-btn-${index}`);
    plusBtn.classList.remove('active');
    minusBtn.classList.remove('active');
    if (sign === '+') {
        plusBtn.classList.add('active');
    } else {
        minusBtn.classList.add('active');
    }
}

function validateAdjustButton(type, index) {
    const input = document.getElementById(`${type}-adjust-value-${index}`);
    const button = document.getElementById(`${type}-apply-btn-${index}`);
    const value = parseFloat(input.value);
    if (!isNaN(value) && value !== '') {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
}

function adjustHp(index) {
    const plusBtn = document.getElementById(`hp-plus-btn-${index}`);
    const minusBtn = document.getElementById(`hp-minus-btn-${index}`);
    let sign;
    if (plusBtn.classList.contains('active')) {
        sign = '+';
    } else if (minusBtn.classList.contains('active')) {
        sign = '-';
    } else {
        return;
    }
    const amount = parseFloat(document.getElementById(`hp-adjust-value-${index}`).value) || 0;
    const maxHp = characters[index].maxHp;
    if (sign === '+') {
        characters[index].hp = Math.max(0, Math.min(characters[index].hp + amount, maxHp));
    } else {
        characters[index].hp = Math.max(0, Math.min(characters[index].hp - amount, maxHp));
    }
    // Update the input field
    const input = document.querySelector(`#character-${characters[index].id} input[onchange*="updateHp"]`);
    if (input) input.value = characters[index].hp;
    // Clear the adjust value
    document.getElementById(`hp-adjust-value-${index}`).value = '';
    validateAdjustButton('hp', index);
}

function adjustMana(index) {
    const plusBtn = document.getElementById(`mana-plus-btn-${index}`);
    const minusBtn = document.getElementById(`mana-minus-btn-${index}`);
    let sign;
    if (plusBtn.classList.contains('active')) {
        sign = '+';
    } else if (minusBtn.classList.contains('active')) {
        sign = '-';
    } else {
        return;
    }
    const amount = parseFloat(document.getElementById(`mana-adjust-value-${index}`).value) || 0;
    const maxMana = characters[index].maxMana;
    if (sign === '+') {
        characters[index].mana = Math.max(0, Math.min(characters[index].mana + amount, maxMana));
    } else {
        characters[index].mana = Math.max(0, Math.min(characters[index].mana - amount, maxMana));
    }
    // Update the input field
    const input = document.querySelector(`#character-${characters[index].id} input[onchange*="updateMana"]`);
    if (input) input.value = characters[index].mana;
    // Clear the adjust value
    document.getElementById(`mana-adjust-value-${index}`).value = '';
    validateAdjustButton('mana', index);
}

function addEffect(charIndex) {
    characters[charIndex].effects.push({ duration: '', description: '', infinite: false });
    renderEffects(charIndex);
}

function updateEffectDuration(charIndex, effectIndex, value) {
    const parsed = parseInt(value);
    characters[charIndex].effects[effectIndex].duration = Number.isNaN(parsed) ? '' : Math.max(0, parsed);
}

function updateEffectDescription(charIndex, effectIndex, value) {
    characters[charIndex].effects[effectIndex].description = value;
}

function updateEffectInfinite(charIndex, effectIndex, checked) {
    characters[charIndex].effects[effectIndex].infinite = checked;
}

function toggleInfinite(charIndex, effectIndex) {
    const effect = characters[charIndex].effects[effectIndex];
    effect.infinite = !effect.infinite;
    renderEffects(charIndex);
}

function deleteEffect(charIndex, effectIndex) {
    characters[charIndex].effects.splice(effectIndex, 1);
    renderEffects(charIndex);
}

function deleteCharacter(index) {
    const removed = characters.splice(index, 1)[0];
    if (removed && removed.id === activeCharacterId) {
        if (battleStarted) {
            activeCharacterId = characters[0]?.id ?? null;
        } else {
            activeCharacterId = null;
        }
        if (openCharacterId === activeCharacterId) {
            openCharacterId = null;
        }
    }
    if (removed && removed.id === openCharacterId) {
        openCharacterId = null;
    }
    activeIndex = characters.findIndex(c => c.id === activeCharacterId);
    if (activeIndex < 0) activeIndex = 0;
    renderInitiativeBar();
    renderCharacterPanel();
}

function copyCharacter(index) {
    const original = characters[index];
    const newId = nextCharacterId++;
    // Determine the new name with sequential numbering
    const originalName = original.name;
    const match = originalName.match(/^(.+?)( \d+)?$/);
    const baseName = match[1];
    // Find all existing names that start with baseName
    const existingNumbers = characters
        .map(char => {
            if (char.name === baseName) return 1;
            if (char.name.startsWith(baseName + ' ')) {
                const numMatch = char.name.match(new RegExp(`^${baseName} (\\d+)$`));
                return numMatch ? parseInt(numMatch[1]) : null;
            }
            return null;
        })
        .filter(num => num !== null);
    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const newNum = maxNum + 1;
    const newName = baseName + ' ' + newNum;
    // If the original doesn't have a number, rename it to baseName 1
    if (original.name === baseName) {
        original.name = baseName + ' 1';
    }
    const newChar = {
        id: newId,
        name: newName,
        initiative: original.initiative,
        color: original.color,
        hp: original.hp,
        maxHp: original.maxHp,
        mana: original.mana,
        maxMana: original.maxMana,
        effects: original.effects.map(e => ({ duration: e.duration, description: e.description, infinite: e.infinite }))
    };
    characters.push(newChar);
    sortCharacters();
    renderInitiativeBar();
    renderCharacterPanel();
}

function handleTurnButton() {
    if (!battleStarted) {
        battleStarted = true;
        activeIndex = 0;
        activeCharacterId = characters[0]?.id ?? null;
        openCharacterId = null;
        renderInitiativeBar();
        renderCharacterPanel();
    } else {
        endTurn();
    }
}

function endTurn() {
    if (characters.length === 0) return;
    // Reduce effects of current character
    const current = characters[activeIndex];
    current.effects.forEach(effect => {
        if (!effect.infinite && effect.duration > 0) {
            effect.duration--;
        }
    });
    current.effects = current.effects.filter(effect => effect.infinite || effect.duration > 0);
    renderEffects(activeIndex);
    // Move to next
    activeIndex = (activeIndex + 1) % characters.length;
    activeCharacterId = characters[activeIndex]?.id ?? null;
    // When turn changes, reset secondary open panel so only the active character stays open.
    openCharacterId = null;
    renderInitiativeBar();
    renderCharacterPanel();
}

function scrollToCharacter(id) {
    const element = document.getElementById(`character-${id}`);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('highlight');
    setTimeout(() => element.classList.remove('highlight'), 800);
}