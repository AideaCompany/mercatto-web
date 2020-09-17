import React, {useEffect, useState,useContext} from 'react'
//nextjs
import {useRouter} from 'next/router'
//axios
import axios from 'axios'
//Cookie
import Cookie from 'js-cookie'

type Producto = {_id:string,nombre:string,descripcion:string,precio:Number,imagenes:{url:string}}
type Carrito = {_id:string,cantidad:Number,producto:Producto}
type Pedidos = {_id:string,carrito:[Carrito],Terminado:Boolean}
type typeUser = {nombre?: string, jwt?:string, pedidos? : [Pedidos]}
type typeAuthContext = { 
    user: typeUser; 
    isAuthenticated : boolean ;  
    logout :  () => void;
    login : (data:{identifier:string, password:string, remember:boolean},urlBack:string, setModalAuthSignIn?:(_:any)=>any, setErrorMessage?:(_:any)=>any) => void;
    loginProvider : (provider)=>void
}

const AuthContext = React.createContext<typeAuthContext>({} as typeAuthContext);

export const AuthProvider = ({children})=>{

    //States
    const [user, setUser] = useState<typeUser>({})

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
            }
            setUser({
                nombre: res.data.user.nombre,
                jwt: res.data.jwt
            })
            setModalAuthSignIn(false)
            pushIndex()
        }).catch(err=>{
            setErrorMessage('Error al iniciar sesión, verifica tus credenciales')
        })
        
    }

    const loginProvider =  (data) =>{
            setUser({
                nombre: data.user.username,
                jwt: data.jwt
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

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, logout , login, loginProvider}}>
            {children}
        </AuthContext.Provider>
    )

}
export default function useAuth() {
    return useContext(AuthContext)
};