import React, {useState} from 'react'
//AntDesign 
import {Form, Input, Button, Modal, Checkbox, message} from 'antd'
import { Modal as ModalMobile } from 'antd-mobile';
//provider
import useAuth from '../../providers/AuthProvider'
//axios
import axios from 'axios'

const SignInComponent = (props:{modalAuthSignIn:boolean ,setModalAuthSignIn, setModalAuthSignUp, urlBack:string, pathPublic:string}):JSX.Element =>{
    const {modalAuthSignIn, setModalAuthSignIn, setModalAuthSignUp, urlBack, pathPublic} = props

    //usestate
    const [errorMessage, setErrorMessage] = useState('')
    const [forgotPassword, setForgotPassword] = useState(false)
    //useAuth 
    const {login} = useAuth()

    //functions
    const HandleClose = ()=>{
        setModalAuthSignIn(false)
        setForgotPassword(false)
        Modal.destroyAll()
    }

    const submitForm = async (data)=>{
        login(data, urlBack, setModalAuthSignIn, setErrorMessage)
    }

    const submitForget = async (data)=>{
        message.loading({content:'Cargando...', className:'messageVerification', key:"forget"})
        axios.post(`${urlBack}/auth/forgot-password`,{
            email: data.identifier
        }).then(res=>{
            message.success({content:'Revisa tu correo eléctronico para restaurar tu contraseña', className:'messageVerification', duration:5, key:"forget"})
        }).catch(err=>console.log(err))
    }

    return(
        <Modal width={400} closable={false} centered onCancel={HandleClose} visible={modalAuthSignIn}>
                <div className='containerForm'>
                    <img className='mainLogo' src={`${pathPublic}images/Layout/logoAuth.svg`} alt="mercatto logo"/>
                    {!forgotPassword?
                    <>
                    <h2>Iniciar Sesión</h2>
                    <Form name='signIn' onFinish={submitForm}>
                        <Form.Item name='identifier'>
                            <Input placeholder='Correo Electrónico'/>
                        </Form.Item>
                        <Form.Item name='password'>
                            <Input.Password placeholder='Contraseña'/>
                        </Form.Item>
                        <Form.Item name='remember' valuePropName="checked">
                            <Checkbox>Recordar la sesión</Checkbox>
                        </Form.Item>
                        <span style={{cursor:"pointer"}} onClick={()=>setForgotPassword(true)}>Olvide mi contraseña</span>
                        <div className='buttonsAuth'>
                            <Button htmlType="submit">Iniciar Sesión</Button>
                            <Button onClick={()=>{setModalAuthSignUp(true);HandleClose()}}>Registrate</Button>
                        </div>
                    </Form>
                    </>
                    : 
                    <>
                    <h2>Recordar contraseña</h2>
                    <Form name='signIn' onFinish={submitForget}>
                        <Form.Item style={{paddingTop:"5vh"}} name='identifier'>
                            <Input  placeholder='Ingresa tu Correo Electrónico'/>
                        </Form.Item>
                        <span style={{cursor:"pointer"}} onClick={()=>setForgotPassword(false)}>Regresar</span>
                        <div className='buttonsAuth'>
                            <Button htmlType="submit">Aceptar</Button>
                        </div>
                    </Form>
                    </>
                    }
                    {!forgotPassword?
                    <>
                        <a  href={`${urlBack}/connect/facebook`}>
                            <img className='facebookAuth' src={`${pathPublic}images/Layout/facebook.svg`} alt="facebook mercatto"/>
                        </a>
                        <br/>
                        <span><a href="#">Políticas de privacidad</a></span>
                        <br/>
                        {errorMessage !== "" ?<span style={{color:"#FC3740"}}>{errorMessage}</span>: null}
                    </>
                    :null}
                </div>
        </Modal>
    )
}

export default React.memo(SignInComponent)