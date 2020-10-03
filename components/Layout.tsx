import React, {useEffect, useState} from 'react'
//components
import SignInComponent from '../components/Auth/singIn'
import SignUpcomponent from '../components/Auth/singup'
import ResetPasswordComponent from '../components/Auth/resetPasswor'
//nextjs
import Link from 'next/link'
import router from 'next/router'
import Head from 'next/head'
//antD
import {AutoComplete, Input, Badge, Avatar, Button, message, Menu, Dropdown} from 'antd'
import {SearchOutlined, ShoppingCartOutlined, UserOutlined, PoweroffOutlined, FacebookFilled, InstagramFilled} from '@ant-design/icons';
//Axios
import axios from 'axios'
//fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faWhatsapp, faInstagram, faFacebookF} from '@fortawesome/free-brands-svg-icons'
//context
import useAuth from '../providers/AuthProvider'



type propsLayout ={
    children: JSX.Element
    title: string
    color?: string
    background?: string
    urlBack?:string
    confirmed?:boolean
    code?:string
    pathPublic?:string
    logoWhite?:boolean
    tokenProvider?: string
}

const Layout = (props: propsLayout):JSX.Element =>{

    //Props
    const {children, title , urlBack, confirmed, code, pathPublic, logoWhite, tokenProvider} = props

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
                <span  className='logOutButton' onClick={logout}><PoweroffOutlined/> Cerrar Sesión</span>
            </Menu.Item>
        </Menu>
    )
    return(
        <>
        <Head>
        <title>{`Mercatto | ${title}`}</title>
        <meta name="description" content="Mercatto tienda de comestibles."/>
        <link rel="icon" href="/favicon.ico" />
        </Head> 
        <main>
            <div className='mainLayout'>
                <header>
                    <div>
                        <div className='containerMainLogo'>
                            <Link href='/'>
                                <a >
                                    <img className='mainLogo' src={`${pathPublic}images/Layout/mercatto-${!logoWhite ? 'large' : 'white'}.svg`} alt="mercatto logo"/>
                                </a>
                            </Link>
                        </div>
                        <div className='searchBar'>
                            <AutoComplete onChange={(e)=>setSearchWord(e)}>
                                <Input onPressEnter={(e)=>{router.push(`/productos/${searchWord}`)}} value={searchWord}   prefix={<SearchOutlined />}  placeholder={"Buscar"}></Input>
                            </AutoComplete>
                        </div>
                        <div className='menu'>
                                {
                                    user.jwt ? 
                                    <>
                                        
                                        <Badge className='cart' count={cartCount}>
                                            <Link href='/carrito'>
                                                <a>
                                                    <ShoppingCartOutlined className='iconCart' />
                                                </a>
                                            </Link>
                                        </Badge>
                                        <Dropdown overlay={menu}>
                                            <Avatar size={40} className='profileUser' icon={<UserOutlined />}/>
                                        </Dropdown>
                                        
                                    </>
                                    :
                                    <>
                                        <Button style={{marginLeft: '1em'}} onClick={()=>setModalAuthSignIn(true)}>Iniciar Sesión</Button>
                                        <Button style={{margin: '1em'}} onClick={()=>setModalAuthSignUp(true)}>Registrate</Button>
                                        
                                    </>

                                }
                        </div>
                    </div>

                </header>
                <div className='mainContent'>
                    {children}
                </div>
                <div className='footer'>
                        <div className='socialMediaIcons'>
                            <a className='socialIcon' href="/"><FontAwesomeIcon icon={faFacebookF}/></a>
                            <a className='socialIcon' href="/"><FontAwesomeIcon icon={faInstagram} /></a>
                            <a className='socialIcon' href="/"><FontAwesomeIcon icon={faWhatsapp}/></a>
                        </div>
                        <div className='infoSocial'>
                            <Link  href='/terminos_condiciones'>
                                <a>
                                    <span>Politicas de privacidad</span>
                                </a>
                            </Link>
                            <span>Powered by <a target="_blank" href="https://ideautomation.com.co/">IDEA SAS</a> - AIDEA SAS</span>
                        </div>

                    
                </div>
                <SignInComponent pathPublic={pathPublic} urlBack={urlBack} modalAuthSignIn={modalAuthSignIn} setModalAuthSignIn={setModalAuthSignIn} setModalAuthSignUp={setModalAuthSignUp}/>
                <SignUpcomponent pathPublic={pathPublic} urlBack={urlBack} modalAuthSignUp={modalAuthSignUp} setModalAuthSignUp={setModalAuthSignUp} setModalAuthSignIn={setModalAuthSignIn}/>
                <ResetPasswordComponent pathPublic={pathPublic} code={code} setModalResetPassword={setModalResetPassword} modalResetPassword={modalResetPassword} setModalAuthSignIn={setModalAuthSignIn} urlBack={urlBack}/>
            </div>
        </main>
    </>
    )
}

export default React.memo(Layout)