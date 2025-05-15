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
