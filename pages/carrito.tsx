import React,{useEffect,useState} from 'react'
//next
import Link from 'next/link'
import {useRouter} from 'next/router'
//components
import Layout from '../components/Layout';
//antd
import { Modal ,Form, Button, message, Input, Checkbox} from 'antd';
import { CloseOutlined , CheckCircleTwoTone, WarningTwoTone} from '@ant-design/icons';
//context
import useAuth from '../providers/AuthProvider'
//types
import {Carrito, Producto, ProductoCombo} from '../utils/types'
//axios
import axios from 'axios'
//utils
import {getNewPrice, formatNumber} from '../utils/functions'



const {TextArea} = Input

type showCarrito = Carrito & {totalPrecio?:number,precio?:number,peso?:string}


const carrito = (props:{url:string}):JSX.Element=>{
    const {url} = props
    const [actualCart, setactualCart] = useState<showCarrito[]>()
    const [totalPrice, settotalPrice] = useState<number>(0)
    const [modalVisible, setmodalVisible] = useState<boolean>(false)
    const [toDelete, settoDelete] = useState<number>()
    const [direccion, setDireccion] = useState<string>('')
    const [Observaciones, setObservaciones] = useState<string>('')
    const [saveLocation, setSaveLocation] = useState(false)

    
    //context
    const {user,updateUser} = useAuth()
    
    //router
    const router = useRouter()


    useEffect(() => {
        if (user.direccion !== '' || !user.direccion ) {
            setDireccion(user.direccion)
        }
        var actual:showCarrito[] = user?.carrito
        actual?.map(e=>{
            if (e!==null) {
                if (e?.combo) {
                    (e?.combo as ProductoCombo).precioDescuento = getNewPrice(0,(e?.combo as ProductoCombo)?.precio) 
                    e.totalPrecio=e.cantidad*((e.combo) as ProductoCombo).precio
                    e.precio = getNewPrice(0,e.totalPrecio)  
                }else{
                    (e?.producto as Producto).precioDescuento = getNewPrice((e?.producto as Producto)?.descuento,(e?.producto as Producto)?.precio)
                    e.totalPrecio=e.cantidad*((e.producto) as Producto).precio 
                    e.precio = getNewPrice((e.producto as Producto).descuento,e.totalPrecio)  
                    e.peso = (e.producto as Producto).peso
                }
            }    
        })
        for (let k = 0; k < actual?.length; k++) {
            if (actual[k]?.combo) {
                var combo = ((actual[k]?.combo as ProductoCombo)?.producto as ProductoCombo[])
                var tempDes = []
                for (let m = 0; m < combo.length; m++) {
                    tempDes.push(`${(combo[m]?.producto as Producto).nombre} x${combo[m]?.cantidad}`)
                }
                (actual[k]?.combo as ProductoCombo).descripcion = tempDes.join(', ')
            }
            
        }
        settotalPrice(actual?actual.map(e=>e.precio).reduce((a,b)=>a+b,0):0)
        setactualCart(actual?actual:[])
    }, [user])

    //functions
    const vaciarCarrito =  () => {
        setactualCart([])
    }

    useEffect(() => {
        
    }, [actualCart])

    const plus= async (pos)=>{
        actualCart[pos].cantidad +=1
        actualCart?.map(e=>{
            if (e?.combo) {
                (e?.combo as ProductoCombo).precioDescuento = getNewPrice(0,(e?.combo as ProductoCombo).precio) 
                e.totalPrecio=e.cantidad*((e?.combo) as ProductoCombo).precio
                e.precio = getNewPrice(0,e?.totalPrecio)  
            }else{
                (e.producto as Producto).precioDescuento = getNewPrice((e?.producto as Producto).descuento,(e?.producto as Producto).precio) 
                e.totalPrecio=e.cantidad*((e?.producto) as Producto)?.precio
                e.precio = getNewPrice((e?.producto as Producto).descuento,e?.totalPrecio)            
                e.peso = (e?.producto as Producto)?.peso
            }

        })
        settotalPrice(actualCart?.map(e=>e?.precio).reduce((a,b)=>a+b,0))
        setactualCart([...actualCart])
        await updateCart()
    }

    const minus = async (pos)=>{
        if(actualCart[pos].cantidad>1){
            actualCart[pos].cantidad -=1
            actualCart?.map(e=>{
                if (e?.combo) {
                    (e?.combo as ProductoCombo).precioDescuento = getNewPrice(0,(e?.combo as ProductoCombo)?.precio) 
                    e.totalPrecio=e.cantidad*((e?.combo) as ProductoCombo)?.precio
                    e.precio = getNewPrice(0,e?.totalPrecio)  
                }else{
                    (e?.producto as Producto).precioDescuento = getNewPrice((e?.producto as Producto)?.descuento,(e?.producto as Producto)?.precio) 
                    e.totalPrecio=e?.cantidad*((e?.producto) as Producto)?.precio
                    e.precio = getNewPrice((e?.producto as Producto)?.descuento,e?.totalPrecio)            
                    e.peso = (e?.producto as Producto)?.peso
                }
            })
            settotalPrice(actualCart?.map(e=>e?.precio).reduce((a,b)=>a+b,0))
            setactualCart([...actualCart])
            await updateCart()
        }else{
            settoDelete(pos)
            setmodalVisible(true);
        }
    }

    const updateCart = async () =>{
        await axios.put(`${url}/users/${user._id}`,{
            carrito:actualCart
        },{
            headers:{
                Authorization: `Bearer ${user.jwt}`  
            }
        }).then(res=>updateUser(res)).catch(err=>console.log(err))
    }

    const HandleClose = ()=>{
        setmodalVisible(false)
        Modal.destroyAll()
    }

    const deleteItem = ()=>{
        actualCart.splice(toDelete,1)
        setactualCart([...actualCart])
        setmodalVisible(false)
        settoDelete(null)
        axios.put(`${url}/users/${user._id}`,{
            carrito:actualCart}, {
            headers: {
                Authorization: `Bearer ${user.jwt}`
            }
        }).then(res=>{  

            updateUser(res);
            message.success({content:"Producto eliminado",className: 'messageVerification',duration: '10'})
        }).catch(err=>console.log(err))
    }
 
    const okCart = ()=>{
        actualCart.map(e=>{delete e._id;delete e.id})
        user.pedidos.push({
            carrito:(actualCart as Carrito[]),
            Terminado:false, 
            total: totalPrice
        }) 
        axios.put(`${url}/users/${user._id}`,{
            carrito: [],
            direccion: saveLocation ? direccion : user.direccion,
            Pedidos:user.pedidos}, {
            headers: {
                Authorization: `Bearer ${user.jwt}`
            }
        }).then(res=>{  
            var carrito = actualCart.map(e=>{
                if (e.combo) {
                    return ({
                        cantidad: e.cantidad,
                        producto: (e.combo as ProductoCombo).nombre,
                        precio : e.precio,
                        peso: e.peso
                    })
                }else{
                    return ({
                        cantidad: e.cantidad,
                        producto: (e.producto as Producto).nombre,
                        precio : e.precio,
                        peso: e.peso
                    })
                }

            })
            var carritoMail = actualCart.map(e=>{
                if (e.combo) {
                    return ({
                        cantidad: e.cantidad,
                        producto: (e.combo as ProductoCombo).nombre,
                        precio : e.precio,
                        peso: e.peso,
                        imagen : ((e.combo as ProductoCombo).producto as Producto).imagenes.url
                    })
                }else{
                    return ({
                        cantidad: e.cantidad,
                        producto: (e.producto as Producto).nombre,
                        precio : e.precio,
                        peso: e.peso,
                        imagen : (e.producto as Producto).imagenes.url
                    })
                }

            })
            axios.post(`${url}/pedidos`,{
                Carrito: carrito,
                user: user._id ,
                Entregado: false,
                direccion: direccion,
                telefono_cliente: user.telefono ? user.telefono : '',
                observaciones: Observaciones,
                total: totalPrice,
                nombre_cliente: user.nombre?user.nombre:user.username,
                correo_cliente: user.email
                }, {
                headers: {
                    Authorization: `Bearer ${user.jwt}`
                }
            }).then(async (rpt)=>{ 
                console.log(user)
                console.log(carritoMail)
                axios.post(
                        "https://gestion.mercatto.com.co/email",
                        {
                            'to' : `${user.email}`,
                            'bcc' : "soporte@aidea.com.co",
                            'subject' : "Confimación de pedido, Mercatto ",
                            'html' : 
                    `<!DOCTYPE html
                    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                     <html xmlns="http://www.w3.org/1999/xhtml">
                    <head>
                        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                        <title>Email</title>
                        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap" rel="stylesheet">
                        <style type="text/css">
                            * {
                                font-family: 'Roboto', sans-serif;
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                                }
                
                            body {
                                margin: 0;
                                -webkit-font-smoothing: antialiased;
                                -moz-osx-font-smoothing: grayscale;
                                position: relative;
                                overflow-x: hidden;
                                box-sizing: border-box;
                            }
                    
                            .content {
                                width: 100%;
                                max-width: 600px;
                            }
                            .mainContainer{
                                width: 90%;
                                height: 600px;
                                background-color: #ffffff ;
                                margin: auto;
                                color: rgb(0, 101, 153);
                                
                            }
                            .mainContainer .headerC{
                                background-color:#02205E;
                                color: #ffffff;
                                text-align: center;
                                padding: 20px;
                                height: 30vh;
                                position: relative;
                
                            }
                            .mainContainer .headerC svg{
                                max-height: 15vh;
                                object-fit: cover;
                            }
                            .mainContainer .headerC h1{
                                font-size: 2em;
                                margin-top: 2%;
                            }
                            .bodyC{
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                            }
                            .bodyC > div{
                                border-radius: 25px;
                                height: 30vh;
                                width: 80vw;
                                -webkit-box-shadow: 2px 6px 18px -6px rgba(78, 29, 29, 0.2);
                                -moz-box-shadow: 2px 6px 18px -6px rgba(0, 0, 0, 0.2);
                                box-shadow: 2px 6px 18px -6px rgba(0, 0, 0, 0.2);
                                position: relative;
                                padding: 10px;
                                box-sizing: border-box;
                                margin: 2%;
                                color:#02205E;
                                display: flex;
                                flex-direction: row;
                            }
                            .bodyC > div .data{
                                width: 60%;
                                padding-left: 5%;
                                font-size: 1rem;
                            }
                            .bodyC > div .data >div{
                                margin: 5%;
                                word-wrap:break-word;
                            }
                            .bodyC > div .image{
                                width: 40%;
                                height: 100%;
                                text-align: center;
                            }
                            .bodyC > div .image img{
                               object-fit: cover;
                               height: 100%;
                            }
                        </style>
                    </head>
                    <body >
                        <div class="mainContainer">
                            <div class="headerC">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 764.5 213.52"><defs><style>.cls-1{fill:#fff;}.cls-2{fill:#fcd330;}</style></defs><title>logo color</title><g id="Capa_2" data-name="Capa 2"><g id="Capa_1-2" data-name="Capa 1"><path class="cls-1" d="M245.16,188.73a12.14,12.14,0,0,1-5.61-1.32,4.17,4.17,0,0,1-2.58-3.85V104.84c0-3,.86-5.14,2.58-6.36a9.5,9.5,0,0,1,5.61-1.83,17.83,17.83,0,0,1,5.1.63,9.16,9.16,0,0,1,3.91,2.52,27.2,27.2,0,0,1,3.84,5.54l15.36,28.22,15.5-28.22a41,41,0,0,1,4-5.54,8.34,8.34,0,0,1,3.85-2.52,17.88,17.88,0,0,1,5-.63,9.41,9.41,0,0,1,5.66,1.83c1.68,1.22,2.52,3.33,2.52,6.36v78.72a4.17,4.17,0,0,1-2.58,3.85,12.56,12.56,0,0,1-11.21,0,4.17,4.17,0,0,1-2.58-3.85V129.4l-14.61,26.2a6.66,6.66,0,0,1-5.67,3.28,6.6,6.6,0,0,1-2.84-.7,6.36,6.36,0,0,1-2.58-2.58l-14.48-27.21v55.17a4.18,4.18,0,0,1-2.52,3.85A12,12,0,0,1,245.16,188.73Z"/><path class="cls-1" d="M332.2,188.73a9.63,9.63,0,0,1-4.92-1.32,4.22,4.22,0,0,1-2.26-3.85V101.81A4.21,4.21,0,0,1,327.28,98a9.63,9.63,0,0,1,4.92-1.32H377a4.15,4.15,0,0,1,4,2.27,10.19,10.19,0,0,1,1.19,4.78,9.67,9.67,0,0,1-1.32,5.17A4.24,4.24,0,0,1,377,111H341.39V136.2h19.15a4.35,4.35,0,0,1,3.84,2,8,8,0,0,1,1.32,4.6,8.42,8.42,0,0,1-1.19,4.22,4.22,4.22,0,0,1-4,2.08H341.39v25.32H377a4.24,4.24,0,0,1,3.84,2.14,9.66,9.66,0,0,1,1.32,5.16,10.18,10.18,0,0,1-1.19,4.79,4.15,4.15,0,0,1-4,2.27Z"/><path class="cls-1" d="M442.29,189.36a5.89,5.89,0,0,1-3.21-1,6.71,6.71,0,0,1-2.46-2.9l-17.89-34.76H408.15v32.87a4.18,4.18,0,0,1-2.52,3.85,12.69,12.69,0,0,1-11.27,0,4.17,4.17,0,0,1-2.58-3.85V101.69a4.94,4.94,0,0,1,1.45-3.53,5,5,0,0,1,3.84-1.51H422A44.87,44.87,0,0,1,437.06,99a21.78,21.78,0,0,1,10.77,8.13q4,5.73,4,15.81a32,32,0,0,1-2.14,12.4,21,21,0,0,1-5.86,8.19,24.92,24.92,0,0,1-8.5,4.6L452,178.78a4.66,4.66,0,0,1,.37,1.07,4.17,4.17,0,0,1,.13.94,6.66,6.66,0,0,1-1.51,4,11.65,11.65,0,0,1-3.84,3.28A10.08,10.08,0,0,1,442.29,189.36Zm-34.14-51.52H422q6.17,0,9.82-3t3.66-10.33q0-7.56-3.66-10.52T422,111H408.15Z"/><path class="cls-1" d="M491.41,189.49a36.63,36.63,0,0,1-14.48-2.84,22.46,22.46,0,0,1-10.59-9.2q-3.9-6.34-3.9-16.81V125.5q0-10.45,3.9-16.82a22.52,22.52,0,0,1,10.59-9.2,37.17,37.17,0,0,1,14.61-2.83,38.38,38.38,0,0,1,15.55,3,25.29,25.29,0,0,1,10.59,8.25,21.08,21.08,0,0,1,3.84,12.72c0,3.28-.68,5.44-2,6.49s-3.4,1.57-6.17,1.57a12.4,12.4,0,0,1-5.73-1.19,4.35,4.35,0,0,1-2.46-4,18,18,0,0,0-.44-3.59,12.59,12.59,0,0,0-1.7-4.09,9.83,9.83,0,0,0-3.84-3.4A15.13,15.13,0,0,0,492,111q-6.42,0-9.89,3.59t-3.46,10.9v35.14q0,7.43,3.53,11t10.07,3.52a14.23,14.23,0,0,0,6.81-1.38,9.38,9.38,0,0,0,3.71-3.46,14.21,14.21,0,0,0,1.64-4.35c.29-1.51.52-2.94.69-4.28a4.6,4.6,0,0,1,2.52-4,12.24,12.24,0,0,1,5.54-1.14q4.29,0,6.3,1.64c1.34,1.09,2,3.23,2,6.42a23,23,0,0,1-3.84,13.23A24.55,24.55,0,0,1,507,186.46,38,38,0,0,1,491.41,189.49Z"/><path class="cls-1" d="M532.47,188.73a6,6,0,0,1-2.14-.44,5,5,0,0,1-1.89-1.26,2.66,2.66,0,0,1-.75-1.83,2.63,2.63,0,0,1,.13-.88l26.32-85.53a3.66,3.66,0,0,1,1.89-2.2,6.67,6.67,0,0,1,3-.69,6.91,6.91,0,0,1,3.22.75,3.38,3.38,0,0,1,1.82,2.14l26.2,85.53a2.48,2.48,0,0,1,.13.76,2.59,2.59,0,0,1-.76,1.82,5.44,5.44,0,0,1-1.89,1.32,5.73,5.73,0,0,1-2.39.51,3.72,3.72,0,0,1-1.89-.51,2.32,2.32,0,0,1-1.13-1.63l-5.92-19.4H541.67l-5.79,19.4a2.86,2.86,0,0,1-1.26,1.63A4.25,4.25,0,0,1,532.47,188.73ZM543.69,160h30.6l-15.24-50.76Z"/><path class="cls-1" d="M615.86,188.73a5.18,5.18,0,0,1-2.9-.82,2.76,2.76,0,0,1-1.26-2.46v-81H590.54a2.67,2.67,0,0,1-2.33-1.2,4.87,4.87,0,0,1,0-5.41,2.67,2.67,0,0,1,2.33-1.2h50.51a2.68,2.68,0,0,1,2.4,1.14,4.65,4.65,0,0,1,.75,2.64,5.31,5.31,0,0,1-.75,2.77,2.6,2.6,0,0,1-2.4,1.26H620v81a2.7,2.7,0,0,1-1.32,2.46A5.29,5.29,0,0,1,615.86,188.73Z"/><path class="cls-1" d="M675.94,188.73a5.15,5.15,0,0,1-2.89-.82,2.74,2.74,0,0,1-1.26-2.46v-81H650.63a2.64,2.64,0,0,1-2.33-1.2,4.87,4.87,0,0,1,0-5.41,2.64,2.64,0,0,1,2.33-1.2h50.51a2.66,2.66,0,0,1,2.39,1.14,4.65,4.65,0,0,1,.76,2.64,5.32,5.32,0,0,1-.76,2.77,2.58,2.58,0,0,1-2.39,1.26h-21v81a2.7,2.7,0,0,1-1.32,2.46A5.27,5.27,0,0,1,675.94,188.73Z"/><path class="cls-1" d="M738.17,189.49a32.16,32.16,0,0,1-13.23-2.65,20.31,20.31,0,0,1-9.38-8.57q-3.46-5.91-3.46-15.74v-39q0-9.69,3.46-15.62a20.35,20.35,0,0,1,9.32-8.56,31.86,31.86,0,0,1,13.29-2.65,32.3,32.3,0,0,1,13.35,2.65,20.59,20.59,0,0,1,9.45,8.56q3.53,5.92,3.53,15.62v39.05q0,9.83-3.53,15.74a20.61,20.61,0,0,1-9.45,8.57A32.46,32.46,0,0,1,738.17,189.49Zm0-7.69q8.43,0,13.23-4.66t4.78-14.61v-39q0-9.83-4.78-14.49t-13.23-4.66q-8.45,0-13.1,4.66t-4.66,14.49v39.05q0,9.94,4.66,14.61T738.17,181.8Z"/><path class="cls-2" d="M40.8,126H13.5l2,20.85H42Z"/><path class="cls-2" d="M171.53,146.8H198L200,126H172.72Z"/><path class="cls-2" d="M131.88,180.16h25.21l1.2-20.85h-26Z"/><path class="cls-2" d="M81.24,159.31h-26l1.19,20.85H81.64Z"/><path class="cls-2" d="M169.63,180.16h25.23l2-20.85h-26Z"/><path class="cls-2" d="M42.71,159.31h-26l2,20.85H43.9Z"/><path class="cls-2" d="M57.14,192.67l1.2,20.85H82.27l-.39-20.85Z"/><path class="cls-2" d="M19.85,192.67v.09a22.84,22.84,0,0,0,22.83,20.76H45.8l-1.19-20.85Z"/><path class="cls-2" d="M167.72,213.52h3.11a22.83,22.83,0,0,0,22.83-20.76v-.09H168.91Z"/><path class="cls-2" d="M131.25,213.52h23.94l1.19-20.85H131.65Z"/><path class="cls-2" d="M94.79,213.52h23.95l.39-20.85H94.39Z"/><path class="cls-2" d="M81,144l-18-18H53.33l1.19,20.85H81Z"/><path class="cls-2" d="M132.57,144l0,2.81H159L160.19,126h-9.57Z"/><path class="cls-2" d="M115.61,161a12.52,12.52,0,0,1-17.69,0l-1.65-1.65H93.76l.39,20.85h25.22l.4-20.85h-2.52Z"/><path class="cls-2" d="M170.46,88.41H43.07l63.69,63.7Z"/><path class="cls-2" d="M6.26,88.41A6.26,6.26,0,0,0,0,94.67v12.51a6.25,6.25,0,0,0,6.26,6.25H50.39l-25-25Z"/><path class="cls-2" d="M207.27,88.41H188.15l-25,25h44.14a6.25,6.25,0,0,0,6.25-6.25V94.67A6.25,6.25,0,0,0,207.27,88.41Z"/><path class="cls-2" d="M125.53,10.43A10.44,10.44,0,0,0,115.1,0H98.42A10.43,10.43,0,0,0,88,10.43V75.9h37.53Z"/></g></g></svg>
                                <h1>Hola!</h1>
                                <p>Nos pondremos en contacto contigo pronto.</p>
                                <p>Estos son los datos de tu pedido.</p>
                            </div>
                            <div class="bodyC">
                                ${carritoMail.map(e=>{
                                    return (
                                        `
                                        <div class="element">
                                            <div class="image">
                                                <img src=${url}${e.imagen}}></img>
                                            </div>
                                            <div class="data">
                                                <div class="nombre"><b>Nombre:</b>${e.producto}</div>
                                                <div class="precio"><b>Precio:</b>$${e.precio}</div>
                                                <div class="descripcion"><b>Descripcion:</b>${e.peso}</div>
                                                <div class="cantidad"><b>Cantidad:</b>${e.cantidad}</div>
                                            </div>
                                        </div>
                                        `
                                    )
                                })}
                            </div>
                        </div>
                    </body>
                </html>`
                    },
                    {headers: {"Accept": "application/json"}}
                    ).then(e=>{
                        console.log(e)
                        updateUser(res);
                        message.success({content:"Pedido realizado",className: 'messageVerification',duration: '5'})
                        router.push("/pedidos")
                    })



               
            }).catch(err=>console.log(err))
        }).catch(err=>console.log(err))
    }
    return (
        <>
    <Layout urlBack={url}  logoWhite={false} pathPublic={'../../'} title={"Carrito"} color={"#8D8D8D"}  background={"#EEEEEE"}>
            <div className='carritoMain'>
                <div className='carritoLeft'>
                    <div className='titleCarrito'>
                        <h1>Tu Carrito</h1>
                        {totalPrice>30000?
                            <span><CheckCircleTwoTone twoToneColor="#52c41a"/> Has completado el pedido mínimo</span>
                        :
                            <span><WarningTwoTone  twoToneColor="#eb2f96"/> Te faltan: <span>${formatNumber(30000-totalPrice)}</span> para completar el pedido mínimo</span>   
                        }
                    </div>
                    
                    <div className='containerProducts'>
                        {actualCart?.length>0 ? actualCart?.map((product,i)=>(
                            <div key={product._id} className='productItem'>
                                <div className='productImg'>
                                    {product.combo?
                                        <img src={`${url}${(product.combo as ProductoCombo).imagenes.url}`} alt={`Mercatto ${(product.combo as ProductoCombo).nombre} `}/>
                                        :
                                        <img src={`${url}${(product.producto as Producto).imagenes.url}`} alt={`Mercatto ${(product.producto as Producto).nombre} `}/>
                                    }
                                </div>
                                <div className='productInfo'>
                                    {product.combo?
                                    <>
                                        <div>
                                            <span className='price'>${formatNumber((product.combo as ProductoCombo).precioDescuento)}</span>
                                        </div>
                                        <h2>{(product.combo as ProductoCombo).nombre}</h2>
                                        <span className='productDesc'>{(product.combo as ProductoCombo).descripcion}</span>
                                    </>
                                    :
                                    <>
                                        <div>
                                            <span className='price'>${formatNumber((product.producto as Producto).precioDescuento) }</span>
                                            {(product.producto as Producto).descuento>0? <span className='priceDescount'>${(product.producto as Producto).precio}</span> :null}
                                        </div>
                                        <h2>{(product.producto as Producto).nombre}</h2>
                                        <span className='productDesc'>{(product.producto as Producto).descripcion}</span>
                                    </>
                                    }
                                </div>
                                <div className='productAction'>
                                    <span>{product.cantidad}</span>
                                    <button onClick={()=>minus(i)}>
                                        <span>-</span>
                                    </button>
                                    <button onClick={()=>plus(i)}>
                                        <span>+</span>
                                    </button>
                                    <CloseOutlined onClick={()=>{settoDelete(i);setmodalVisible(true)}}  />
                                </div>
                            </div>
                        )):
                        <div className='emptyCart'>
                            <h1>Tu carrito está vació</h1>
                            <Link href={'/'}>
                                <a>
                                    <button>
                                        Te invitamos a regresar a la tienda para seguir comprando.
                                    </button>
                                    
                                </a>
                            </Link>
                        </div>
                        }

                    </div>
                </div>
                <div className="carritoRight">
                    {actualCart?.length>0?
                        <div className='confirmCart'>
                            <div className='info'>
                                <Input value={direccion} placeholder='Dirección' onChange={(e)=>setDireccion(e.target.value)}></Input>
                                <Checkbox checked={saveLocation} onChange={()=>setSaveLocation(!saveLocation)}>Guardar Dirección para futuras compras</Checkbox>
                                <TextArea style={{resize: 'none'}} placeholder='Observaciones' onChange={(e)=>setObservaciones(e.target.value)}></TextArea>
                            </div>
                            <div className='buttons'>
                                <div className='totalsCarrito'>
                                    <span className='subTotal'>Sub Total: ${formatNumber(totalPrice)}</span>
                                    <br/>
                                    <span style={{fontSize:'1.5em'}}>Envio: $4,500</span>
                                    <br/>
                                    <span className='total'>Total + envio ${formatNumber(totalPrice+4500)}</span>
                                </div>
                                <br/>
                                <div>
                                    <button onClick={()=>vaciarCarrito()} type="button" className="btn btn-primary btn-lg">
                                        Vaciar Carrito
                                    </button>
                                    <button disabled={totalPrice>=30000 && direccion !== '' && direccion ?false:true} onClick={okCart} type="button" className="btn btn-primary btn-lg">
                                        Realizar pedido
                                    </button>
                                </div>
                                
                            </div>
                        </div>
                    :null}
                </div>
            </div>
    </Layout>
    <Modal centered onCancel={HandleClose} visible={modalVisible}>
        {actualCart?
        <div className='containerForm'>
            {actualCart[toDelete]?.combo?
                <h2>{`¿Deseas eliminar el combo: ${(actualCart[toDelete]?.combo as ProductoCombo)?.nombre}?`}</h2>
            :
                <h2>{`¿Deseas eliminar el producto ${(actualCart[toDelete]?.producto as Producto)?.nombre}?`}</h2>
            }
            <div className="image">
                {actualCart[toDelete]?.combo?
                    <img src={`${url}${(actualCart[toDelete]?.combo as ProductoCombo)?.imagenes.url}`} alt={`${(actualCart[toDelete]?.combo as ProductoCombo)?.nombre} mercatto`} />   
                :
                    <img src={`${url}${(actualCart[toDelete]?.producto as Producto)?.imagenes.url}`} alt={`${(actualCart[toDelete]?.producto as Producto)?.nombre} mercatto`} />   
                }
            </div>
             <Form name='signIn' onFinish={deleteItem}>
                <div className='buttonsAuth'>
                    <Button htmlType="submit">Aceptar</Button>
                    <Button onClick={HandleClose}>Cancelar</Button>
                </div>
            </Form>
        </div>:null}
    </Modal>
    </>
    )
}
export async function getServerSideProps (ctx) {
    const URL = process.env.URL_STRAPI;
    return {props: {url:URL}}
}
export default React.memo(carrito)