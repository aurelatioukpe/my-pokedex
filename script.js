document.getElementById('search-button').addEventListener('click', function() {
    const searchInput = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (searchInput === '') {
        showNotification('Veuillez entrer un nom de Pokémon ou un ID.');
        return;
    }
    
    const isId = /^\d+$/.test(searchInput);
    
    if (isId) {
        const id = parseInt(searchInput);
        if (id <= 0) {
            showNotification('L\'ID du Pokémon doit être supérieur à 0.');
            return;
        }
        if (id > 1025) {
            showNotification('L\'ID du Pokémon doit être inférieur ou égal à 1025.');
            return;
        }
    }
    
    let formattedInput = searchInput.replace(/ /g, '-').replace(/[♀♂]/g, match => {
        return match === '♀' ? 'f' : 'm';
    });

    const apiUrl = `https://pokeapi-proxy.freecodecamp.rocks/api/pokemon/${formattedInput}`;

    document.getElementById('pokemon-info').classList.add('loading');

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                if (isId) {
                    showNotification(`Aucun Pokémon trouvé avec l'ID ${searchInput}.`);
                } else {
                    showNotification(`Aucun Pokémon nommé "${searchInput}" trouvé. Vérifiez l'orthographe.`);
                }
                throw new Error('Pokémon not found');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('pokemon-name').innerText = data.name.toUpperCase();
            document.getElementById('pokemon-id').innerText = `#${data.id.toString().padStart(3, '0')}`;
            document.getElementById('weight').innerText = `${(data.weight / 10).toFixed(1)} kg`;
            document.getElementById('height').innerText = `${(data.height / 10).toFixed(1)} m`;
            
            updateStat('hp', data.stats[0].base_stat);
            updateStat('attack', data.stats[1].base_stat);
            updateStat('defense', data.stats[2].base_stat);
            updateStat('special-attack', data.stats[3].base_stat);
            updateStat('special-defense', data.stats[4].base_stat);
            updateStat('speed', data.stats[5].base_stat);
            
            const typesContainer = document.getElementById('types');
            typesContainer.innerHTML = '';
            data.types.forEach(typeInfo => {
                const typeElement = document.createElement('div');
                typeElement.classList.add(`type-${typeInfo.type.name}`);
                typeElement.innerText = typeInfo.type.name.toUpperCase();
                typesContainer.appendChild(typeElement);
            });

            const sprite = document.getElementById('sprite');
            sprite.src = data.sprites.front_default;
            sprite.alt = `${data.name} sprite`;

            document.getElementById('pokemon-info').classList.remove('loading');
        })
        .catch(error => console.error('Error:', error));
});

function updateStat(statName, value) {
    document.getElementById(statName).innerText = value;
    
    const percentage = Math.min(Math.floor((value / 255) * 100), 100);
    
    setTimeout(() => {
        document.getElementById(`${statName}-bar`).style.width = `${percentage}%`;
    }, 100);
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    notificationMessage.textContent = message;
    notification.classList.add('show');
    
    notification.classList.add('shake');
    setTimeout(() => {
        notification.classList.remove('shake');
    }, 600);
    
    document.getElementById('notification-close').addEventListener('click', function() {
        notification.classList.remove('show');
    });
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

document.getElementById('search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('search-button').click();
    }
});

window.addEventListener('load', function() {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    document.getElementById('search-input').value = randomId;
    document.getElementById('search-button').click();
});

// === Versus Mode ===
let versusPokemon1 = null;
let versusPokemon2 = null;

// Toggle Versus mode
const versusToggle = document.getElementById('versus-toggle');
const versusMode = document.getElementById('versus-mode');
const pokedexContainer = document.querySelector('.pokedex-container');
const mainCard = document.getElementById('pokemon-info');

versusToggle.addEventListener('click', () => {
    if (versusMode.style.display === 'none') {
        versusMode.style.display = 'block';
        mainCard.style.display = 'none';
        versusToggle.textContent = 'Quitter le mode Versus';
    } else {
        versusMode.style.display = 'none';
        mainCard.style.display = '';
        versusToggle.textContent = 'Mode Versus';
        resetVersus();
    }
});

function resetVersus() {
    document.getElementById('versus-input-1').value = '';
    document.getElementById('versus-input-2').value = '';
    document.getElementById('versus-info-1').innerHTML = '';
    document.getElementById('versus-info-2').innerHTML = '';
    document.getElementById('versus-result').textContent = '';
    versusPokemon1 = null;
    versusPokemon2 = null;
}

function fetchVersusPokemon(inputId, infoId, setPokemon) {
    const input = document.getElementById(inputId).value.toLowerCase().trim();
    if (!input) {
        showNotification('Veuillez entrer un nom ou ID de Pokémon.');
        return;
    }
    let formattedInput = input.replace(/ /g, '-').replace(/[♀♂]/g, match => match === '♀' ? 'f' : 'm');
    const apiUrl = `https://pokeapi-proxy.freecodecamp.rocks/api/pokemon/${formattedInput}`;
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Not found');
            return response.json();
        })
        .then(data => {
            setPokemon(data);
            document.getElementById(infoId).innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:5px;margin-top:10px;">
                    <img src="${data.sprites.front_default}" alt="${data.name}" style="width:80px;height:80px;">
                    <span style="font-weight:600;">${data.name.toUpperCase()} (#${data.id})</span>
                    <span style="font-size:13px;">HP: ${data.stats[0].base_stat} | ATK: ${data.stats[1].base_stat} | DEF: ${data.stats[2].base_stat}</span>
                </div>`;
        })
        .catch(() => {
            document.getElementById(infoId).innerHTML = '<span style="color:red;">Pokémon introuvable.</span>';
            setPokemon(null);
        });
}

document.getElementById('versus-search-1').addEventListener('click', () => {
    fetchVersusPokemon('versus-input-1', 'versus-info-1', p => versusPokemon1 = p);
});
document.getElementById('versus-search-2').addEventListener('click', () => {
    fetchVersusPokemon('versus-input-2', 'versus-info-2', p => versusPokemon2 = p);
});

document.getElementById('versus-battle').addEventListener('click', () => {
    const resultDiv = document.getElementById('versus-result');
    if (!versusPokemon1 || !versusPokemon2) {
        resultDiv.textContent = 'Veuillez sélectionner deux Pokémon valides.';
        resultDiv.style.color = 'red';
        return;
    }
    // --- RPG Battle Simulation ---
    const log = [];
    // Initial stats
    let p1 = {
        name: versusPokemon1.name.toUpperCase(),
        hp: versusPokemon1.stats[0].base_stat,
        attack: versusPokemon1.stats[1].base_stat,
        defense: versusPokemon1.stats[2].base_stat,
        speed: versusPokemon1.stats[5].base_stat,
        sprite: versusPokemon1.sprites.front_default
    };
    let p2 = {
        name: versusPokemon2.name.toUpperCase(),
        hp: versusPokemon2.stats[0].base_stat,
        attack: versusPokemon2.stats[1].base_stat,
        defense: versusPokemon2.stats[2].base_stat,
        speed: versusPokemon2.stats[5].base_stat,
        sprite: versusPokemon2.sprites.front_default
    };
    // Qui commence ?
    let first = p1.speed > p2.speed ? p1 : (p2.speed > p1.speed ? p2 : (Math.random() < 0.5 ? p1 : p2));
    let second = first === p1 ? p2 : p1;
    log.push(`<b>${first.name}</b> est le plus rapide et attaque en premier !`);
    // PV initiaux
    let pv1 = p1.hp;
    let pv2 = p2.hp;
    let round = 1;
    // Combat tour par tour
    while (pv1 > 0 && pv2 > 0 && round < 20) {
        log.push(`<br><u>Tour ${round}</u>`);
        // Attaque du premier
        let dmg1 = Math.max(1, Math.round((first.attack / second.defense) * 10));
        pv2 = Math.max(0, pv2 - dmg1);
        log.push(`${first.name} attaque ${second.name} et inflige <b>${dmg1}</b> dégâts. PV restants de ${second.name}: <b>${pv2}</b>`);
        if (pv2 <= 0) break;
        // Attaque du second
        let dmg2 = Math.max(1, Math.round((second.attack / first.defense) * 10));
        pv1 = Math.max(0, pv1 - dmg2);
        log.push(`${second.name} riposte et inflige <b>${dmg2}</b> dégâts à ${first.name}. PV restants de ${first.name}: <b>${pv1}</b>`);
        round++;
    }
    // Résultat
    let winner = null;
    if (pv1 > 0 && pv2 <= 0) winner = first;
    else if (pv2 > 0 && pv1 <= 0) winner = second;
    else if (pv1 === 0 && pv2 === 0) winner = null;
    // Affichage
    log.push('<br><b>Fin du combat !</b>');
    if (winner) {
        log.push(`<span style='color:green;font-size:1.2em;'>${winner.name} remporte le combat !</span>`);
    } else {
        log.push(`<span style='color:#b00020;font-size:1.1em;'>Égalité parfaite !</span>`);
    }
    resultDiv.innerHTML = `
        <div style='display:flex;justify-content:center;gap:20px;margin-bottom:10px;'>
            <div style='text-align:center;'>
                <img src='${p1.sprite}' style='width:60px'><br>${p1.name}<br><span style='font-size:13px;'>PV initiaux: ${p1.hp}</span>
            </div>
            <div style='text-align:center;'>
                <img src='${p2.sprite}' style='width:60px'><br>${p2.name}<br><span style='font-size:13px;'>PV initiaux: ${p2.hp}</span>
            </div>
        </div>
        <div style='text-align:left;max-height:180px;overflow-y:auto;font-size:1em;padding:8px 4px 0 4px;'>${log.join('<br>')}</div>
    `;
});
