import { useAuth } from '../hooks/queries/useAuth'

function SetsPage() {

    // const { data: profile } = useAuth()
    const { logout } = useAuth()

  return (
    <div>
        <h1>Hola {profile?.email}</h1>
        <button onClick={logout} className='border-2 rounded-2xl border-karga-orange px-4 py-2 text-karga-orange hover:bg-karga-orange hover:text-white transition-colors cursor-pointer'>Logout</button>
    </div>
  )
}

export default SetsPage