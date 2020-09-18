import React, {useEffect, useState,useContext} from 'react'
//nextjs
import {useRouter} from 'next/router'
//axios
import axios from 'axios'
//Cookie
import Cookie from 'js-cookie'

import {typeUser} from '../utils/types'
type typeAuthContext = { 
    user: typeUser; 
    isAuthenticated : boolean ;  
    logout :  () => void;
    login : (data:{identifier:string, password:string, remember:boolean},urlBack:string, setModalAuthSignIn?:(_:any)=>any, setErrorMessage?:(_:any)=>any) => void;
    loginProvider : (provider)=>void;
    modalAuthSignIn : boolean;
    setModalAuthSignIn : React.Dispatch<React.SetStateAction<Boolean>>;
    modalAuthSignUp :boolean;
    setModalAuthSignUp : React.Dispatch<React.SetStateAction<Boolean>>;
    updateUser : (data)=>void;
}

const AuthContext = React.createContext<typeAuthContext>({} as typeAuthContext);

export const AuthProvider = ({children})=>{

    //States
    const [user, setUser] = useState<typeUser>({})
    const [modalAuthSignIn, setModalAuthSignIn] = useState<boolean>(false)
    const [modalAuthSignUp, setModalAuthSignUp] = useState<boolean>(false)
    //context
    const router = useRouter()
    //Effect
    const url = process.env.NEXT_PUBLIC_URL_STRAPI
    useEffect(() => {
        if(Cookie.get('authTokenMercatto') !== undefined){
            axios.get(`${url}/users/me`, {
                headers: {
                    Authorization: `Bearer ${Cookie.get('authTokenMercatto')}`
                }
            }).then(res=>{
                setUser({
                    _id:res.data._id,
                    nombre: res.data.nombre,
                    jwt: Cookie.get('authTokenMercatto'),
                    pedidos : res.data.Pedidos
                })
                pushIndex()
            }).catch(err=>console.log(err))
        }
    }, [])


    const login = async (data:{identifier:string, password:string, remember:boolean}, urlBack:string, setModalAuthSignIn?:(_:any)=>any, setErrorMessage?:(_:any)=>any) => { 
        await axios.post(`${urlBack}/auth/local`,{
            identifier: data.identifier,
            password: data.password,
        }).then(res=>{
            if (data.remember) {
                Cookie.set('authTokenMercatto', res.data.jwt,{expires:30})
            }else{
                Cookie.set('authTokenMercatto', res.data.jwt,{expires:1})
            }
            setUser({
                _id:res.data.user._id,
                nombre: res.data.user.nombre,
                jwt: res.data.jwt,
                pedidos : res.data.user.Pedidos
            })
            setModalAuthSignIn(false)
            pushIndex()
        }).catch(err=>{
            setErrorMessage('Error al iniciar sesión, verifica tus credenciales')
        })
        
    }

    const loginProvider =  (data) =>{
            setUser({
                _id:data.user._id,
                nombre: data.user.username,
                jwt: data.jwt,
                pedidos : data.user.Pedidos
            })
            Cookie.set('authTokenMercatto',data.jwt, {expires:1})
    }

    const logout = ()=>{
        setUser({})
        localStorage.removeItem('authTokenMercatto')
        Cookie.remove('authTokenMercatto')
    }

    const pushIndex = () =>{
        console.log(router.query.code)
        if (router.query.code !== "") {
            // router.push('/')
        }
    }

    const updateUser = (res)=>{
        setUser({
            _id:res.data.id,
            nombre: res.data.nombre,
            jwt: user.jwt,
            pedidos : res.data.Pedidos
        })
    }
    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, logout , login, loginProvider,modalAuthSignIn,setModalAuthSignIn,modalAuthSignUp,setModalAuthSignUp,updateUser}}>
            {children}
        </AuthContext.Provider>
    )

}
export default function useAuth() {
    return useContext(AuthContext)
};
