import { useAuth } from '../hooks/queries/useAuth'

function SetsPage() {

    const { data: profile, isLoading } = useAuth()
    const { logout } = useAuth()

    if (isLoading) return <div>Loading...</div>

  return (
    <div>
        <h1>Hola {profile?.name}</h1>
        <button onClick={logout} className='border-2 rounded-2xl border-karga-orange px-4 py-2 text-karga-orange hover:bg-karga-orange hover:text-white transition-colors cursor-pointer'>Logout</button>
    </div>
  )
}

export default SetsPage