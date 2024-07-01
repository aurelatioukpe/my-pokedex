document.getElementById('search-button').addEventListener('click', function() {
    const searchInput = document.getElementById('search-input').value.toLowerCase().trim();

    let formattedInput = searchInput.replace(/ /g, '-').replace(/[♀♂]/g, match => {
        return match === '♀' ? 'f' : 'm';
    });

    const apiUrl = `https://pokeapi-proxy.freecodecamp.rocks/api/pokemon/${formattedInput}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                alert('Pokémon not found');
                throw new Error('Pokémon not found');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('pokemon-name').innerText = data.name.toUpperCase();
            document.getElementById('pokemon-id').innerText = `#${data.id}`;
            document.getElementById('weight').innerText = `Weight: ${data.weight}`;
            document.getElementById('height').innerText = `Height: ${data.height}`;
            document.getElementById('hp').innerText = `HP: ${data.stats[0].base_stat}`;
            document.getElementById('attack').innerText = `Attack: ${data.stats[1].base_stat}`;
            document.getElementById('defense').innerText = `Defense: ${data.stats[2].base_stat}`;
            document.getElementById('special-attack').innerText = `Special Attack: ${data.stats[3].base_stat}`;
            document.getElementById('special-defense').innerText = `Special Defense: ${data.stats[4].base_stat}`;
            document.getElementById('speed').innerText = `Speed: ${data.stats[5].base_stat}`;
            
            const typesContainer = document.getElementById('types');
            typesContainer.innerHTML = '';
            data.types.forEach(typeInfo => {
                const typeElement = document.createElement('div');
                typeElement.innerText = typeInfo.type.name.toUpperCase();
                typesContainer.appendChild(typeElement);
            });

            const sprite = document.getElementById('sprite');
            sprite.src = data.sprites.front_default;
            sprite.alt = `${data.name} sprite`;
        })
        .catch(error => console.error('Error:', error));
});
