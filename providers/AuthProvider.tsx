import React, {useEffect, useState,useContext} from 'react'
//nextjs
import {useRouter} from 'next/router'
//axios
import axios from 'axios'
//Cookie
import Cookie from 'js-cookie'


type typeUser = {nombre?: string, jwt?:string }
type typeAuthContext = { user: typeUser; isAuthenticated : boolean ;  logout :  () => void, login : (data:{identifier:string, password:string, remember:boolean},urlBack:string, setModalAuthSignIn?:(_:any)=>any, setErrorMessage?:(_:any)=>any) => void };

const AuthContext = React.createContext<typeAuthContext>({} as typeAuthContext);

export const AuthProvider = ({children})=>{

    //States
    const [user, setUser] = useState<typeUser>({})

    //context
    const router = useRouter()
    //Effect
    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_URL_STRAPI

        if(Cookie.get('authTokenMercatto') !== undefined){
            axios.get(`${url}/users/me`, {
                headers: {
                    Authorization: `Bearer ${Cookie.get('authTokenMercatto')}`
                }
            }).then(res=>{
                setUser({
                    nombre: res.data.nombre,
                    jwt: Cookie.get('authTokenMercatto')
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
            console.log(res)
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
    const logout = ()=>{
        setUser({})
        localStorage.removeItem('authTokenMercatto')
        Cookie.remove('authTokenMercatto')
    }

    const pushIndex = () =>{
        console.log(router.query.code)
        if (router.query.code !== "") {
            router.push('/')
        }
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, logout , login}}>
            {children}
        </AuthContext.Provider>
    )

}
export default function useAuth() {
    return useContext(AuthContext)
};