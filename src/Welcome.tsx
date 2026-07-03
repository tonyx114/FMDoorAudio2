import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from './assets/logo2.png'

function Welcome() {

    const navigate = useNavigate()

    useEffect(() => {
        setTimeout(() => {
        navigate('/Home', { replace: true })
        }, 3000)
    }, [])
    return (
    <>
    <div className="startscreen">
        <img className='startlogo' src={logo} alt="Logo" />
    </div>
    </>
  )
}

export default Welcome