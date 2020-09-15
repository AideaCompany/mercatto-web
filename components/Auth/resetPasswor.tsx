import React, {useState} from 'react'
//AntDesign 
import {Form, Input, Button, Modal, Checkbox, message} from 'antd'

//axios
import axios from 'axios'

const ResetPasswordComponent = (props:{modalResetPassword:boolean ,setModalResetPassword, setModalAuthSignIn, urlBack:string, code:string, pathPublic:string}):JSX.Element =>{
    const {modalResetPassword, setModalResetPassword , urlBack, setModalAuthSignIn, code, pathPublic} = props
    //functions
    const HandleClose = ()=>{
        setModalResetPassword(false)
        Modal.destroyAll()
    }

    const submitForget = async (data)=>{
        console.log(code)
        axios.post(`${urlBack}/auth/reset-password`,{
            code: code,
            password: data.password,
            passwordConfirmation: data.passwordConfirmation
        }).then(res=>{
            message.success({content:'Contraseña restablecida', className:'messageVerification', duration:10})
            HandleClose()
            setModalAuthSignIn(true)
        }).catch(err=>{
            message.error({content:'Error al restablecer la contraseña, por favor verifica tu código secreto', className:'messageVerification', duration:10})
        })
    }

    return(
        <Modal centered onCancel={HandleClose} visible={modalResetPassword}>
                <div className='containerForm'>
                    <img className='mainLogo' src={`${pathPublic}images/Layout/mercatto-large.svg`} alt="mercatto logo"/>
                    <>
                    <h2>Restaurar Contraseña</h2>
                    <Form name='signIn' onFinish={submitForget}>
                        <Form.Item style={{paddingTop:"5vh"}} name='password'>
                            <Input.Password  placeholder='Ingresa tu contraseña'/>
                        </Form.Item>
                        <Form.Item  name='passwordConfirmation'
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
                            <Input.Password  placeholder='Repite la contraseña'/>
                        </Form.Item>
                        <div className='buttonsAuth'>
                            <Button htmlType="submit">Acetar</Button>
                        </div>
                    </Form>
                    </>
                    
                </div>
        </Modal>
    )
}

export default React.memo(ResetPasswordComponent)