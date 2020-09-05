import React, {useEffect, useState} from 'react'
//components
import SignInComponent from '../components/Auth/singIn'
import SignUpcomponent from '../components/Auth/singup'
import ResetPasswordComponent from '../components/Auth/resetPasswor'
//nextjs
import Link from 'next/link'
//antD
import {AutoComplete, Input, Badge, Avatar, Button, message, Menu, Dropdown} from 'antd'
import {SearchOutlined, ShoppingCartOutlined, UserOutlined, PoweroffOutlined} from '@ant-design/icons';
//Axios
import axios from 'axios'
//context
import useAuth from '../providers/AuthProvider'


const Layout = (props: {children:JSX.Element, title:string, color:string, background: string, urlBack:string, confirmed?:boolean, code?:string }):JSX.Element =>{

    //Props
    const {children, title ,color, background, urlBack, confirmed, code} = props


    //state
    const [dataSearch, setDataSearch] = useState([])
    const [modalAuthSignIn, setModalAuthSignIn] = useState<boolean>(false)
    const [modalAuthSignUp, setModalAuthSignUp] = useState<boolean>(false)
    const [modalResetPassword, setModalResetPassword] = useState<boolean>(false)

    //context
    const {user, logout} = useAuth()

    //Effect
    useEffect(() => {
        if (confirmed) {
            message.success({content:"Activación de cuenta concretada",className: 'messageVerification',duration: '5'})
            setModalAuthSignIn(true)
        }
        if (code !== '') {
            setModalResetPassword(true)
        }
        axios.get(`${urlBack}/productos?search`).then(res=>{
            var tempDataSearch = []
            for (let k = 0; k < res.data.length; k++) {
                tempDataSearch.push({
                    value: res.data[k].nombre
                })
            }
            setDataSearch(tempDataSearch)
        }).catch(err=>console.log(err))
    }, [])

    //Functions
    const menu = (
        <Menu>
            <Menu.Item>
                <span>{user.nombre}</span>
            </Menu.Item>
            <Menu.Item>
                <a className='logOutButton' onClick={logout}><PoweroffOutlined/> Cerrar Sesión</a>
            </Menu.Item>
        </Menu>
    )
    return(
        <main>
            <div className='mainLayout'>
                <div style={{backgroundColor:background}} className='leftContainer'>
                    <div className='containerLogos'>
                        <Link href='/'>
                            <a >
                                <img className='mainLogo' src="./images/Layout/mercatto-logo-large.svg" alt="mercatto logo"/>
                            </a>
                        </Link>
                    </div>
                    <h1 style={{color: color}}>{title}</h1>
                </div>
                <div className='rigthContainer'>
                    <div className='topContainer'>
                        <div className='searchBar'>
                            <AutoComplete 
                                options={dataSearch}
                                filterOption={(inputValue, option) =>
                                    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                }>
                                <Input prefix={<SearchOutlined />} placeholder={"Buscar"}></Input>
                            </AutoComplete>
                        </div>
                        <div className='socialMedia'>
                                <a href="/"><img src="./images/Layout/facebook.svg" alt="facebook mercatto"/></a>
                                <a href="/"><img src="./images/Layout/instagram.svg" alt="facebook mercatto"/></a>
                                <a href="/"><img src="./images/Layout/whatsapp.svg" alt="facebook mercatto"/></a>
                        </div>
                        <div className='menu'>
                            {
                                user.nombre ? 
                                    <Dropdown overlay={menu}>
                                        <Avatar size={40} className='profileUser' icon={<UserOutlined />}/>
                                    </Dropdown>
                                :
                                <>
                                    <Button style={{margin: '1em'}} onClick={()=>setModalAuthSignUp(true)}>Registrate</Button>
                                    <Button style={{marginLeft: '1em'}} onClick={()=>setModalAuthSignIn(true)}>Iniciar Sesión</Button>
                                </>
                            }
                            <Badge count={1}>
                                <ShoppingCartOutlined className='iconCart' />
                            </Badge>
                            <Link href='/'>
                                <a>
                                    Categorías
                                </a>
                            </Link>
                            <Link href='/'>
                                <a>
                                    Productos
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className='mainContent'>
                    {children}
                </div>
                <SignInComponent urlBack={urlBack} modalAuthSignIn={modalAuthSignIn} setModalAuthSignIn={setModalAuthSignIn} setModalAuthSignUp={setModalAuthSignUp}/>
                <SignUpcomponent urlBack={urlBack} modalAuthSignUp={modalAuthSignUp} setModalAuthSignUp={setModalAuthSignUp} setModalAuthSignIn={setModalAuthSignIn}/>
                <ResetPasswordComponent code={code} setModalResetPassword={setModalResetPassword} modalResetPassword={modalResetPassword} setModalAuthSignIn={setModalAuthSignIn} urlBack={urlBack}/>
            </div>
        </main>
    )
}

export default React.memo(Layout)