// @deno-types="npm:@types/react"
import { useState } from 'react'
import ky from 'ky'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

const pkmImage = __vite_import('./salamence.png', import.meta.url)

interface PokemonListItem {
  name: string
}

interface PokemonsData {
  results: PokemonListItem[]
}

export default function Pokedex() {
  const [counter, setCounter] = useState(0)

  const { data } = useQuery(['pokemons'], () =>
    ky('https://pokeapi.co/api/v2/pokemon').json<PokemonsData>()
  )
  const pokemons = data!.results

  return (
    <div>
      <h1>Deno Pokedex!</h1>
      <div className="top-pokedex">
        <img src={pkmImage} className="salamence" />
        <button onClick={() => setCounter(counter + 1)}>
          Very Counter: {counter}
        </button>
      </div>
      {pokemons.map((pokemon) => (
        <div key={pokemon.name} className="pokemon-list-item">
          <Link to={`/pokemon/${pokemon.name}`}>
            <h2>{pokemon.name}</h2>
          </Link>
        </div>
      ))}
    </div>
  )
}
