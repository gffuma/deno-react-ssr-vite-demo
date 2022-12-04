import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import ky from 'ky'

interface Pokemon {
  sprites: {
    back_default: string
    front_default: string
  }
}

export default function Pokemon() {
  const { name } = useParams()
  const { data } = useQuery(['pokemon', name], () =>
    ky(`https://pokeapi.co/api/v2/pokemon/${name}/`).json<Pokemon>()
  )
  const pokemon = data!
  return (
    <div className="pokemon">
      <h2>
        <Link className="bk" to="/">
          {'<'}
        </Link>
      </h2>
      <h1>{name}</h1>
      <img src={pokemon.sprites.back_default} />
      <br />
      <img src={pokemon.sprites.front_default} />
    </div>
  )
}
