import React, {useState} from 'react'
//Next
import Link from 'next/link'
//Axios
import axios from 'axios'
//AntDesign 
import {Form, Input, Button, Modal, Select} from 'antd'

const {Option} = Select

const SignUpcomponent = (props:{modalAuthSignUp:boolean ,setModalAuthSignUp, setModalAuthSignIn, urlBack:string, pathPublic:string}):JSX.Element =>{
    const {modalAuthSignUp, setModalAuthSignUp, setModalAuthSignIn, pathPublic} = props

    const URL = `https://gestion.mercatto.com.co`
    //States
    const [okeyRegister, setOkeyRegister] = useState(false)
    //functions
    const HandleClose = ()=>{
        setModalAuthSignUp(false)
        Modal.destroyAll()
    }

    const submitForm = async (data)=>{
        delete data.passwordTwo
        await axios.post(`${URL}/auth/local/register`,{
            nombre: data.nombre,
            email: data.email.toLowerCase(),
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
        <Modal width={400} closable={false} centered onCancel={HandleClose} visible={modalAuthSignUp}>
                <div className='containerForm'> 
                    <img className='mainLogo' src={`${pathPublic}images/Layout/logoAuth.svg`} alt="mercatto logo"/>
                    {!okeyRegister ? 
                    <>
                    <h2>Registrate</h2>
                    <Form name='signUp' onFinish={submitForm}>
                        <Form.Item name='nombre' rules={[{required: true,message: 'Por favor inserta un nombre'}]}>
                            <Input placeholder='Nombre'/>
                        </Form.Item >
                        <Form.Item name='tipo_identificacion' rules={[{required: true,message: 'Por favor selecciona un tipo de identificación'}]}>
                            <Select placeholder='tipo de identificación'>
                              <Option value='cedula'>Cédula de ciudadania</Option>
                              <Option value='NIT'>NIT</Option>
                              <Option value='cedula_extranjera'>Cédula extranjera</Option>
                            </Select>
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
                        <Form.Item name='telefono' rules={[{required: true,message: 'Por favor inserta un telefono'}]}>
                            <Input placeholder='telefono'/>
                        </Form.Item >
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
                    <a  href={`${URL}/connect/facebook`}>
                        <img className='facebookAuth' src={`${pathPublic}images/Layout/facebook.svg`} alt="facebook mercatto"/>
                    </a>
                    <br/>
                    <span>
                      <Link href='/terminos_condiciones'>
                        <a onClick={()=>setModalAuthSignUp(false)} >Políticas de privacidad</a>
                      </Link>
                      
                    </span>
                    </>
                    :
                    <p className='messageAfterSignup'>Gracias por registrarte con Mercatto, recibiras un correo para confirmar tu cuenta.</p> }
                </div>
        </Modal>
    )
}

export default React.memo(SignUpcomponent)