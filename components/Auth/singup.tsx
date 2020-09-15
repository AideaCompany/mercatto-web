import React, {useState} from 'react'
import axios from 'axios'
//AntDesign 
import {Form, Input, Button, Modal} from 'antd'


const SignUpcomponent = (props:{modalAuthSignUp:boolean ,setModalAuthSignUp, setModalAuthSignIn, urlBack:string, pathPublic:string}):JSX.Element =>{
    const {modalAuthSignUp, setModalAuthSignUp, setModalAuthSignIn, urlBack, pathPublic} = props

    //States
    const [okeyRegister, setOkeyRegister] = useState(false)
    //functions
    const HandleClose = ()=>{
        setModalAuthSignUp(false)
        Modal.destroyAll()
    }

    const submitForm = async (data)=>{
        delete data.passwordTwo
        await axios.post(`${urlBack}/auth/local/register`,{
            nombre: data.nombre,
            email: data.email,
            password: data.password,
            tipo_identificacion: data.tipo_identificacion,
            identificacion: data.identificacion,
        }).then(res=>{
          if (res.status === 200) {
            setOkeyRegister(true)
          }
        }).catch(err=>console.log(err))
    }

    return(
        <Modal centered onCancel={HandleClose} visible={modalAuthSignUp}>
                <div className='containerForm'> 
                    <img className='mainLogo' src={`${pathPublic}images/Layout/mercatto-large.svg`} alt="mercatto logo"/>
                    {!okeyRegister ? 
                    <>
                    <h2>Registrate</h2>
                    <Form name='signUp' onFinish={submitForm}>
                        <Form.Item name='nombre' rules={[{required: true,message: 'Por favor inserta un nombre'}]}>
                            <Input placeholder='Nombre'/>
                        </Form.Item >
                        <Form.Item name='tipo_identificacion' rules={[{required: true,message: 'Por favor selecciona un tipo de identificación'}]}>
                            <Input placeholder='Tipo de identificación'/>
                        </Form.Item>
                        <Form.Item name='identificacion' rules={[{required: true,message: 'Por favor inserta tu No de identificación'}]}>
                            <Input placeholder='No de Identificación'/>
                        </Form.Item>
                        <Form.Item name='email'
                        rules={[
                            {
                              type: 'email',
                              message: 'Correo eléctronico invalido',
                            },
                            {
                              required: true,
                              message: 'Por favor inserta un correo',
                            },
                          ]}>
                            <Input placeholder='Correo eléctronico'/>
                        </Form.Item>
                        <Form.Item name='password' rules={[{required: true,message: 'Por favor inserta una contraseña'}]}>
                            <Input.Password placeholder='Contraseña'/>
                        </Form.Item>
                        <Form.Item name='passwordTwo'
                            dependencies={['password']}
                            rules={[
                                {
                                  required: true,
                                  message: 'Por favor repite tu contraseña',
                                },
                                ({ getFieldValue }) => ({
                                  validator(rule, value) {
                                    if (!value || getFieldValue('password') === value) {
                                      return Promise.resolve();
                                    }
                                    return Promise.reject('Las contraseñas no concuerdan.');
                                  },
                                }),
                              ]}>
                            <Input.Password placeholder='Repetir Contraseña'/>
                        </Form.Item>
                        <div className='buttonsAuth'>
                            <Button htmlType="submit">Registrate</Button>
                            <Button onClick={()=>{setModalAuthSignIn(true);HandleClose()}}>Iniciar Sesión</Button>
                        </div>
                    </Form>
                    <img className='facebookAuth' src="./images/Layout/facebook.svg" alt="facebook mercatto"/>
                    <br/>
                    <span><a>Políticas de privacidad</a></span>
                    </>
                    :
                    <p className='messageAfterSignup'>Gracias por registrarte con Mercatto, recibiras un correo para confirmar tu cuenta.</p> }
                    <div className='buttonsAuth'>
                      <Button onClick={()=>{HandleClose()}}>Aceptar</Button>
                    </div>
                </div>
        </Modal>
    )
}

export default React.memo(SignUpcomponent)