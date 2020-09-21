import React, {useEffect, useState} from 'react'
//components
import SignInComponent from '../components/Auth/singIn'
import SignUpcomponent from '../components/Auth/singup'
import ResetPasswordComponent from '../components/Auth/resetPasswor'
//nextjs
import Link from 'next/link'
import router from 'next/router'
//antD
import {AutoComplete, Input, Badge, Avatar, Button, message, Menu, Dropdown} from 'antd'
import {SearchOutlined, ShoppingCartOutlined, UserOutlined, PoweroffOutlined} from '@ant-design/icons';
//Axios
import axios from 'axios'
//context
import useAuth from '../providers/AuthProvider'



type propsLayout ={
    children: JSX.Element
    title: string
    color: string
    background: string
    urlBack?:string
    confirmed?:boolean
    code?:string
    pathPublic:string
    logoWhite?:boolean
    tokenProvider?: string
}

const Layout = (props: propsLayout):JSX.Element =>{

    //Props
    const {children, title ,color, background, urlBack, confirmed, code, pathPublic, logoWhite, tokenProvider} = props

    const [modalResetPassword, setModalResetPassword] = useState<boolean>(false)
    const [cartCount, setcartCount] = useState<Number>(0)
    const [searchWord, setSearchWord] = useState<string>('')
    //context
    const {user, logout, loginProvider,modalAuthSignIn,setModalAuthSignIn,modalAuthSignUp,setModalAuthSignUp} = useAuth()

    //Effect
    useEffect(() => {
        if (confirmed) {
            message.success({content:"Activación de cuenta concretada",className: 'messageVerification',duration: '5'})
            setModalAuthSignIn(true)
        }

        if (code !== '' && code) {
            setModalResetPassword(true)
        }
        if (tokenProvider !== '' && tokenProvider !== undefined) {
            axios.get(`${urlBack}/auth/facebook/callback?access_token=${tokenProvider}`).then(res=>
                loginProvider(res.data)
            ).catch(err=>console.log(err))
        }

    }, [])
    
    useEffect(() => {
        setcartCount(user?user.carrito?.length:0)
    }, [user])
    //Functions
    const menu = (
        <Menu>
            <Menu.Item>
                <span>{user.nombre}</span>
            </Menu.Item>
            <Menu.Item>
                <Link href='/pedidos'>
                    <a>
                        Mis pedidos
                    </a>
                </Link>
            </Menu.Item>
            <Menu.Item>
                <a className='logOutButton' onClick={logout}><PoweroffOutlined/> Cerrar Sesión</a>
            </Menu.Item>
        </Menu>
    )

    return(
        <main>
            <div className='mainLayout'>
                <div style={{backgroundColor:background}} className='leftContainer' >
                    <div className='containerLogos'>
                        <Link href='/'>
                            <a >
                                <img className='mainLogo' src={`${pathPublic}images/Layout/mercatto-${!logoWhite ? 'large' : 'white'}.svg`} alt="mercatto logo"/>
                            </a>
                        </Link>
                    </div>
                    <h1 style={{color: color}}>{title}</h1>
                </div>
                <div className='rigthContainer'>
                    <div className='topContainer'>
                        <div className='searchBar'>
                            <AutoComplete onChange={(e)=>setSearchWord(e)}>
                                <Input onPressEnter={(e)=>{router.push(`/productos/${searchWord}`)}} value={searchWord}   prefix={<SearchOutlined />}  placeholder={"Buscar"}></Input>
                            </AutoComplete>
                        </div>
                        <div className='socialMedia'>
                                <a href="/"><img src={`${pathPublic}images/Layout/facebook.svg`} alt="facebook mercatto"/></a>
                                <a href="/"><img src={`${pathPublic}images/Layout/instagram.svg`} alt="instagram mercatto"/></a>
                                <a href="/"><img src={`${pathPublic}images/Layout/whatsapp.svg`} alt="whatsapp mercatto"/></a>
                        </div>
                        <div className='menu'>
                            {
                                user.jwt ? 
                                <>
                                    <Dropdown overlay={menu}>
                                        <Avatar size={40} className='profileUser' icon={<UserOutlined />}/>
                                    </Dropdown>
                                    <Badge count={cartCount}>
                                        <Link href='/carrito'>
                                            <a>
                                                <ShoppingCartOutlined className='iconCart' />
                                            </a>
                                        </Link>
                                    </Badge>
                                    
                                </>
                                :
                                <>
                                    <Button style={{margin: '1em'}} onClick={()=>setModalAuthSignUp(true)}>Registrate</Button>
                                    <Button style={{marginLeft: '1em'}} onClick={()=>setModalAuthSignIn(true)}>Iniciar Sesión</Button>
                                </>

                            }
                            
                            <Link href='/'>
                                <a>
                                    Productos
                                </a>
                            </Link>
                            <Link href='/'>
                                <a>
                                    Categorías
                                </a>
                            </Link>
                            
                        </div>
                    </div>
                </div>
                <div className='mainContent'>
                    {children}
                </div>
                <div className='footer'>
                    <span>Powered by IDEA SAS - AIDEA SAS</span>
                    <span>Politicas de privacidad</span>
                </div>
                <SignInComponent pathPublic={pathPublic} urlBack={urlBack} modalAuthSignIn={modalAuthSignIn} setModalAuthSignIn={setModalAuthSignIn} setModalAuthSignUp={setModalAuthSignUp}/>
                <SignUpcomponent pathPublic={pathPublic} urlBack={urlBack} modalAuthSignUp={modalAuthSignUp} setModalAuthSignUp={setModalAuthSignUp} setModalAuthSignIn={setModalAuthSignIn}/>
                <ResetPasswordComponent pathPublic={pathPublic} code={code} setModalResetPassword={setModalResetPassword} modalResetPassword={modalResetPassword} setModalAuthSignIn={setModalAuthSignIn} urlBack={urlBack}/>
            </div>
        </main>
    )
}

export default React.memo(Layout)